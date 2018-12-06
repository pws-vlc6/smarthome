import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SensorData, lampData } from './data.models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _token: string;
  private _timeLeft: number;

  constructor(private http: HttpClient,
    private _router: Router) {
    this._token = sessionStorage.getItem('token');
  }

  public get isSignedIn(): boolean {
    return !!this._token;
  }

  getSensorData(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>('/pws/api/sensor/all', { headers: this.createHeader() });
  }

  buzzOff(sensorName: string): Promise<any> {
    return this.http.post(`/pws/api/sensor/${sensorName}`, { "command": "buzzOff" }, { headers: this.createHeader() }).toPromise();
  }

  pumpRange(duration: number): Promise<any> {
    return this.http.post('/pws/api/sensor/bodemvochtigheid', { "duration": duration, "command": "pumpOn" }, { headers: this.createHeader() }).toPromise();
  }

  getPumpTime(): Promise<number> {
    return this.http.get<{ timeLeft: number }>('/pws/api/sensor/bodemvochtigheid', { headers: this.createHeader() }).toPromise().then(bodemvochtigheid_data => {
      return bodemvochtigheid_data.timeLeft;
    });
  }

  getVideoUrl(): Promise<string> {
    return this.http.get<{ url: string }>('/pws/api/sensor/camera', { headers: this.createHeader() }).toPromise().then(e => {
      return e.url;
    });
  }

  getLampData(): Observable<lampData> {
    // return of({
    //   status: true,
    //   brightness: 0.42,
    //   colors: [],
    //   active: 1,
    //   displayName: "Lamp"
    // });
    return this.http.get<lampData>('/pws/api/sensor/lamp', { headers: this.createHeader() });
  }

  addColor(color: string): Promise<object> {
    return this.http.post('/pws/api/lamp/add', { "color": color }, { headers: this.createHeader() }).toPromise();
  }
  editColor(index: number, color: string): Promise<object> {
    return this.http.post('/pws/api/lamp/edit', { "index": index, "color": color }, { headers: this.createHeader() }).toPromise();
  }
  deleteColor(index: number): Promise<object> {
    return this.http.post('/pws/api/lamp/delete', { "index": index }, { headers: this.createHeader() }).toPromise();
  }
  lampBrightness(brightness: number): Promise<object> {
    return this.http.post('/pws/api/lamp/brightness', { "brightness": brightness }, { headers: this.createHeader() }).toPromise();
  }
  lampStatus(status: boolean): Promise<object> {
    return this.http.post('/pws/api/lamp/status', { "status": status }, { headers: this.createHeader() }).toPromise();
  }
  activeColor(index: number): Promise<object> {
    return this.http.post('/pws/api/lamp/active', { "active": index }, { headers: this.createHeader() }).toPromise();
  }

  login(password: string, username: string): Promise<boolean> {
    return this.http.post<{ token: string }>("/pws/api/login", { "password": password, "username": username }).toPromise().then(t => {
      this._token = t.token;
      sessionStorage.setItem('token', this._token);
      return !!this._token;
    });
  }
  public logout() {
    this._token = "";
    this._router.navigate(['/']);
  }
  private createHeader(): HttpHeaders {
    if (this._token) {
      return new HttpHeaders({ "token": this._token });
    }
    return void 0;
  }
}
