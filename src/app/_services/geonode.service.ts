import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {LatLngBounds} from 'leaflet';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeonodeService {

  constructor(
    private http: HttpClient
  ) { }

  // note that I can't read and so "*_min" should be "*_max"
  // in the django filter sets ¯\_(ツ)_/¯
  getDataInBounds(bounds: LatLngBounds, limit?: number): Observable<any> {
    // e.g. ?lat_min=55&lat_max=25&long_min=-65&long_max=-125
    const params = new HttpParams({
      fromObject: {
        lat_max: bounds.getSouthWest().lat.toString(10),
        long_max: bounds.getSouthWest().lng.toString(10),
        lat_min: bounds.getNorthEast().lat.toString(10),
        long_min: bounds.getNorthEast().lng.toString(10),
        limit: limit?.toString(10) || '10000'
      }
    });
    return this.http.get(environment.apiUrl + 'heatmap/geonode', {params});
  }
}
