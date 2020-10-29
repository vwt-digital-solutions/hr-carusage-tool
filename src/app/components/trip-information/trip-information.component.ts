import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

import { Trip, TripLocation } from 'src/app/models/trip.model';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { tileLayer, latLng, marker, icon, Map, polyline, LatLng, point, latLngBounds } from 'leaflet';
import * as L from 'leaflet';
import { NgTemplateOutlet } from '@angular/common';
import { ApproveModalComponent } from '../approve-modal/approve-modal.component';
import { HttpClient } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss'],
  providers: [LicensePlatePipe]
})

export class TripInformationComponent implements OnChanges {
  @ViewChild('reasonInput') reasonInput: ElementRef;

  @Input() tripInfo: Trip;
  @Input() indexInfo: {current: number, min: number, max: number};

  @Output() indexChange = new EventEmitter<number>();

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

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
    private modalService: NgbModal
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tripInfo['currentValue'] && this.initialLoad && this.leafletMap) {
      this.resetMap();

      if (changes.tripInfo['currentValue'] && changes.tripInfo.currentValue['locations']) {
        this.initMapLocations(changes.tripInfo.currentValue);
      }
    } else {
      this.initialLoad = false;
      this.resetMap();
    }
  }

  navigatePage(index: number): void {
    this.indexChange.emit(index);
  }

  openVerticallyCentered(content: NgTemplateOutlet, isCorrect: boolean): void {
    const modalRef = this.modalService.open(ApproveModalComponent, { centered: true });
    modalRef.componentInstance.isCorrect = isCorrect;
    modalRef.result.then((result) => this.handleModalResponse(result));
  }

  handleModalResponse(result: {saving: boolean, correct: boolean, value: string | null}): void {
    if (result.saving) {
      const requestBody = {
        checked: true,
        correct: result.correct ? true : false,
        reason: result.value ? result.value : null
      };
      this.httpClient.put(
        `${this.env.apiUrl}/trips/${this.tripInfo.id}`, requestBody).subscribe(
          response => this.handleCheckResponse(response, requestBody),
          error => {
            console.log(error);
            this.failedResponse = true;
          });
    }
  }

  handleCheckResponse(response: unknown, requestBody = null): void {
    this.failedResponse = false;
    this.tripInfo.checking_info = requestBody;
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

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  getNested(obj: any, ...args: any[]): any {
    return args.reduce((obj, level) => obj && obj[level], obj);
  }

  get driverName(): string {
    return this.tripInfo.driver_info ?
      `${this.tripInfo.driver_info.initial } ${this.tripInfo.driver_info.prefix } ${this.tripInfo.driver_info.last_name}` :
      'Onbekend';
  }

  get driverFunction(): string {
    return this.tripInfo.driver_info && this.tripInfo.driver_info.function_name ?
      this.tripInfo.driver_info.function_name : '-';
  }

  get canBeChecked(): boolean {
    return this.getNested(this.tripInfo, 'checking_info', 'checked') === true ? false : true;
  }
}
