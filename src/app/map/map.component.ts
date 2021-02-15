import {Component, OnInit} from '@angular/core';
import {latLng, LatLngBounds, LeafletEvent, tileLayer} from 'leaflet';
import {GeonodeService} from '../_services/geonode.service';
import {Geonode} from '../_types/Geonode';

declare var HeatmapOverlay: any; // global UMD variable from heatmap.js

interface HeatmapNode {
  lat: number;
  lng: number;
  count: number;
}

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
  layers: any;
  heatmapLayer = new HeatmapOverlay({
    radius: .1,
    maxOpacity: 0.5,
    scaleRadius: true,
    useLocalExtrema: true,
    latField: 'lat',
    lngField: 'lng',
    valueField: 'count'
  });
  layersControl: any;
  heatData: HeatmapNode[] = [];
  zoomLevel = 6;

  private static handleError(err: any): void {
    console.error(err); // TODO actually handle the error
  }

  ngOnInit(): void {
    this.layersControl = {
      baseLayers: {
        'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'}),
        'Open Cycle Map': tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
      }
    };


    this.mapOptions = {
      layers: [
        this.heatmapLayer,
        tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
      ],
      zoom: 6,
      center: latLng(39.76, -86.15),
      maxZoom: 9,
      minZoom: 4
    };

    this.zoomLevel = this.mapOptions.zoom;
  }

  onMapMoveEnd(event: LeafletEvent): void {
    const bounds: LatLngBounds = event.target.getBounds();
    // make request to get data within bounds
    this.getHeatData(bounds);
  }

  // fetch and subsequently set heat data from API

  private getHeatData(bounds: LatLngBounds): void {
    // scale request based on zoom level
    const limit = 6E5 / this.zoomLevel; // TODO tune this later
    this.geoNodeService.getDataInBounds(bounds, limit).subscribe(
      next => {
        this.setHeatDataFromGeonodes(next.results);
      },
      error => {
        MapComponent.handleError(error);
      }
    );
  }

  // set heatdata from the list provided, then refresh the layer
  private setHeatDataFromGeonodes(geonodeList: Geonode[]): void {
    this.heatData = geonodeList.map(gn => {
      return {lat: gn.latitude, lng: gn.longitude, count: 1};
    });
    // now we update the heat layer
    this.refreshHeatLayer();
  }

  private refreshHeatLayer(): void {
    this.heatmapLayer.setData({data: this.heatData});
  }

  setZoomLevel(num: number): void {
    this.zoomLevel = num;
  }
}
