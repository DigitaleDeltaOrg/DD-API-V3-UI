// search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from './types/app-settings';
import { Type } from './types/type';
import { RequestParameters } from './types/request-parameters';

export interface Item {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private http: HttpClient) { }

  getAppSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>('/ddapi/appsettings');
  }

  getMetaData(baseUrl: string, endPoint: string): Observable<any[]> {
    let body = {
      url: baseUrl,
      endPoint: endPoint
    };
    return this.http.post<any[]>('/ddapi/metadata', body);
  }

  get(url: string, apiKey: string, coordinateSystem?: string): Observable<any> {
    let body: RequestParameters = {
      url: url,
      apiKey: apiKey,
      coordinateSystem: coordinateSystem
    };
    return this.http.post('/ddapi', body);
  }
}
