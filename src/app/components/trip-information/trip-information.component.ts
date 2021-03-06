import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';
import { ToastService } from 'src/app/services/toast.service';
import { FrequentOffendersService } from 'src/app/services/frequent-offenders.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApproveModalComponent } from '../approve-modal/approve-modal.component';
import { AuditModalComponent } from '../audit-modal/audit-modal.component';

import { Trip, TripLocation } from 'src/app/models/trip.model';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';
import { NestedValuePipe } from 'src/app/pipes/nested-value.pipe';
import { TripKindPipe } from 'src/app/pipes/trip-kind.pipe';

import { tileLayer, latLng, marker, icon, Map, polyline, LatLng, point, latLngBounds } from 'leaflet';
import * as L from 'leaflet';


@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss'],
  providers: [LicensePlatePipe, NestedValuePipe, TripKindPipe]
})

export class TripInformationComponent implements OnChanges {
  @ViewChild('descriptionInput') descriptionInput: ElementRef;

  @Input() tripInfo: Trip;
  @Input() isManager: boolean;
  @Input() indexInfo: {current: number, min: number, max: number, total: number};

  @Output() indexChange = new EventEmitter<{index: number, trip: Trip, approving: boolean}>();

  private initialLoad = false;
  private leafletMap: Map;
  private geoLocations: TripLocation[] = [];
  private markerIcon = icon({
    iconSize: [ 25, 41 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'assets/marker-icon-2x.png',
    shadowUrl: 'assets/marker-shadow.png'
  });
  private emptyMapPopup = L.popup({
      keepInView: true,
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      closeOnEscapeKey: false
    })
    .setLatLng([52.1, 5.1])
    .setContent('<p>Geen route gevonden</p>');

  public mapLayers = [];
  public mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 18, attribution: '...' })
    ],
    zoom: 7,
    center: latLng(52.1, 5.1),
    attributionControl: false
  };

  public failedResponse = false;
  public driverOffends = null;

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
    private modalService: NgbModal,
    private nestedValuePipe: NestedValuePipe,
    private toastService: ToastService,
    private offendersService: FrequentOffendersService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tripInfo['currentValue'] && this.initialLoad && this.leafletMap) {
      this.resetMap();

      if (changes.tripInfo['currentValue'] && changes.tripInfo.currentValue['locations']) {
        this.setDriverOffends();
        this.initMapLocations(changes.tripInfo.currentValue);
      }
    } else {
      this.initialLoad = false;
      this.resetMap();
    }
  }

  navigatePage(index: number): void {
    this.indexChange.emit({index, trip: this.tripInfo, approving: false});
  }

  openModalApprove(tripKind: string, newApprove = true): void {
    const modalRef = this.modalService.open(ApproveModalComponent);
    if (!newApprove) {
      modalRef.componentInstance.descriptionValue = this.nestedValuePipe.transform(this.tripInfo, 'checking_info', 'description');
    }
    modalRef.componentInstance.tripKind = tripKind;
    modalRef.result.then((result) => this.handleModalResponse(result), error => console.log(error));
  }

  openModalAudit(): void {
    const modalRef = this.modalService.open(AuditModalComponent);
    modalRef.componentInstance.tripId = this.tripInfo.id;
  }

  handleModalResponse(result: {saving: boolean, tripKind: string, value: string | null}): void {
    if (result.saving) {
      const requestBody = {
        trip_kind: result.tripKind,
        description: result.value ? result.value : null
      };
      this.httpClient.put(
        `${this.env.apiUrl}/data/trips/${this.tripInfo.id}`, requestBody).subscribe(
          (response: Trip) => this.handleCheckResponse(response),
          error => this.handleError(error));
    }
  }

  handleCheckResponse(response: Trip): void {
    this.tripInfo = response;

    this.toastService.show(
      'De rit is succesvol beoordeeld. De volgende niet beoordeelde rit wordt geselecteerd', 'Rit beoordelen',
      { classname: 'toast-success', delay: 2000});

    setTimeout(() => {
      this.indexChange.emit({index: 1, trip: this.tripInfo, approving: true});
    }, 2000);
  }

  handleError(error: HttpErrorResponse): void {
    console.log(error);
    this.toastService.show(
      'Er is iets fout gegaan tijdens het beoordelen, probeer het later nog een keer', 'Rit beoordelen',
      { classname: 'toast-danger'});
  }

  onMapReady(map: Map): void {
    this.leafletMap = map;
    this.initialLoad = true;

    this.initMapLocations(this.tripInfo);
  }

  resetMap(): void {
    this.geoLocations = [];

    if (this.leafletMap) {
      this.leafletMap.closePopup();

      for (const layer of this.mapLayers) {
        this.leafletMap.removeLayer(layer);
      }
    }
  }

  initMapLocations(tripInfo: Trip): void {
    let mapLocations = [];

    for (const property of tripInfo.locations) {
      mapLocations.push(property);
    }

    if (mapLocations.length >= 2) {
      mapLocations = mapLocations.sort((a, b) => a.when > b.when ? -1 : (a.when < b.when ? 1 : 0));
      this.geoLocations = mapLocations;

      const markerLayer = L.layerGroup();
      const locCoordinates = [];
      const totalLoc = mapLocations.length - 1;

      for (let i = 0; i < mapLocations.length; i++) {
        const coordinates = this.getLatLng(mapLocations[i]);
        locCoordinates.push(coordinates);

        if ([0, totalLoc].includes(i)) {
          markerLayer.addLayer(marker(coordinates, { icon: this.markerIcon }).bindTooltip(
            (i === 0 ? 'Start' : 'Eind') , {permanent: true}));
        }
      }

      markerLayer.addLayer(polyline(
        [locCoordinates],
        { weight: 4, dashArray: '5, 10', lineCap: 'square' }
      ));

      markerLayer.addTo(this.leafletMap);
      this.mapLayers.push(markerLayer);
    }

    this.boundMap();
  }

  boundMap(): void {
    if (this.leafletMap) {
      if (this.geoLocations.length > 0) {
        const coordinates = [];
        this.geoLocations.forEach((location) => {
          coordinates.push(this.getLatLng(location));
        });

        this.leafletMap.fitBounds(latLngBounds(coordinates), {
          padding: point(24, 24),
          animate: true,
          duration: 1
        });
      } else {
        this.emptyMapPopup.openOn(this.leafletMap);
        this.leafletMap.panTo(latLng(52.1, 5.1));
        this.leafletMap.setZoom(7);
      }
    }
  }

  getLatLng(location: TripLocation): LatLng {
    return latLng(location.geometry.coordinates[1], location.geometry.coordinates[0]);
  }

  get driverName(): string {
    const driverInfo = this.tripInfo.driver_info;
    let driverName = '';

    for (const value of [driverInfo.driver_first_name, driverInfo.driver_prefix_name, driverInfo.driver_last_name]) {
      if (value !== null) {
        driverName = `${driverName} ${value}`;
      }
    }

    return driverName !== '' ? driverName : 'Onbekend';
  }

  get driverDepartment(): string {
    return this.tripInfo.driver_info && this.tripInfo.driver_info.department_name ?
      this.tripInfo.driver_info.department_name : '-';
  }

  get driverCarName(): string {
    return this.tripInfo.driver_info && this.tripInfo.driver_info.car_brand_name ?
      this.tripInfo.driver_info.car_brand_name : 'Onbekend';
  }

  get driverCarModel(): string {
    return this.tripInfo.driver_info && this.tripInfo.driver_info.car_brand_type ?
      this.tripInfo.driver_info.car_brand_type : '-';
  }

  setDriverOffends(): void {
    this.offendersService.offenders.subscribe(
      data => {
        const driverEmployeeNumber = this.nestedValuePipe.transform(this.tripInfo, 'driver_info', 'driver_employee_number');
        for (const item of data) {
          if (this.nestedValuePipe.transform(item, 'driver_info', 'driver_employee_number') === driverEmployeeNumber) {
            this.driverOffends = item;
          }
        }
      }
    );
  }

  get isChecked(): boolean {
    return this.nestedValuePipe.transform(this.tripInfo, 'checking_info', 'trip_kind') === null ? false : true;
  }

  get isExported(): boolean {
    return this.nestedValuePipe.transform(this.tripInfo, 'exported', 'exported_at') ? true : false;
  }
}
