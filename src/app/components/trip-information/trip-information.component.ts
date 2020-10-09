import { Component, Input } from '@angular/core';

import { Trip } from 'src/app/models/trip';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import { tileLayer, latLng, marker, icon } from 'leaflet';

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss'],
  providers: [LicensePlatePipe]
})

export class TripInformationComponent {
  @Input() tripInfo: Trip;

  private markerIcon = icon({
    iconSize: [ 25, 41 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });

  public mapOptions = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 18, attribution: '...' })
    ],
    zoom: 12,
    center: latLng(52.1, 5.1)
  };

  public layers = [
    marker([52.1, 5.1], { icon: this.markerIcon }),
    marker([52.1, 5.01], { icon: this.markerIcon })
  ];
}
