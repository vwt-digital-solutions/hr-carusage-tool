import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { Trip, TripLocation } from 'src/app/models/trip.model';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import { tileLayer, latLng, marker, icon, Map, polyline, LatLng, point, latLngBounds } from 'leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss'],
  providers: [LicensePlatePipe]
})

export class TripInformationComponent implements OnChanges {
  @Input() tripInfo: Trip;
  @Input() indexInfo: {current: number, min: number, max: number};

  @Output() indexChange = new EventEmitter<number>();

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

  public mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 18, attribution: '...' })
    ],
    zoom: 7,
    center: latLng(52.1, 5.1),
    attributionControl: false
  };
  public layers = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.layers = [];
    this.geoLocations = [];

    if (this.leafletMap) {
      this.leafletMap.closePopup();
    }

    if (changes.tripInfo['currentValue'] && changes.tripInfo.currentValue['locations']) {
      for (const property of changes.tripInfo.currentValue['locations']) {
        this.geoLocations.push(property);
      }

      this.geoLocations = this.geoLocations.sort((a, b) => a.when > b.when ? -1 : (a.when < b.when ? 1 : 0));
      this.createMapMarkers();
    }

    this.boundMap();
  }

  navigatePage(index: number): void {
    this.indexChange.emit(index);
  }

  onMapReady(map: Map): void {
    this.leafletMap = map;
    this.boundMap();
  }

  createMapMarkers(): void {
    if (this.geoLocations.length >= 2) {
      const mapMarkers = [];
      const locCoordinates = [];
      const totalLoc = this.geoLocations.length - 1;

      this.geoLocations.forEach((location, i) => {
        const coordinates = this.getLatLng(location);
        locCoordinates.push(coordinates);

        if ([0, totalLoc].includes(i)) {
          mapMarkers.push(marker(coordinates, { icon: this.markerIcon }).bindTooltip(
            (i === 0 ? 'Start' : 'Eind') , {permanent: true}));
        }
      });

      mapMarkers.push(polyline([locCoordinates]));
      this.layers = mapMarkers;
    }

    this.boundMap();
  }

  getLatLng(location: TripLocation): LatLng {
    return latLng(location.geometry.coordinates[0], location.geometry.coordinates[1]);
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
}
