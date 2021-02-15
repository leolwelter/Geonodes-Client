import {Component, OnInit} from '@angular/core';
import {circle, latLng, LatLngBounds, LeafletEvent, polygon, tileLayer} from 'leaflet';
import {GeonodeService} from '../_services/geonode.service';
import {Geonode} from '../_types/Geonode';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  constructor(
    private geoNodeService: GeonodeService
  ) {
  }

  mapOptions: any;
  layersControl: any;
  heatData: Geonode[] = [];

  private static handleError(err: any): void {
    console.error(err); // TODO actually handle the error
  }

  ngOnInit(): void {
    this.layersControl = {
      baseLayers: {
        'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'}),
        'Open Cycle Map': tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
      },
      overlays: {
        'Big Circle': circle([46.95, -122], {radius: 5000}),
        'Big Square': polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]])
      }
    };

    this.mapOptions = {
      layers: [
        tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
      ],
      zoom: 6,
      center: latLng(39.76, -86.15),
      maxZoom: 9,
      minZoom: 5
    };

    // get initial heat data
    const lltuple = this.mapOptions.center.toBounds(50000);
    this.getHeatData(lltuple);
  }

  onMapMoveEnd(event: LeafletEvent): void {
    const bounds: LatLngBounds = event.target.getBounds();
    // make request to get data within bounds
    this.getHeatData(bounds);
  }

  private setHeatData(next: Geonode[]): void {
    this.heatData = next;
    // now we probably update the heat layer
  }

  // fetch and subsequently set heat data from API
  private getHeatData(bounds: LatLngBounds): void {
    this.geoNodeService.getDataInBounds(bounds).subscribe(
      next => {
        this.setHeatData(next);
      },
      error => {
        MapComponent.handleError(error);
      }
    );
  }
}
