import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable, interval } from 'rxjs';
import { flatMap, startWith } from 'rxjs/operators';
import { SensorData } from '../data.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allData$: Observable<SensorData[]>;
  

  constructor(private _data: DataService) { }

  ngOnInit() {
    this._data.getSensorData().toPromise().then(data => {
      this.allData$ = interval(2000).pipe(
        flatMap(() => this._data.getSensorData()),
        startWith(data)
      )
    });
  }
  
  public buttonclick(data: SensorData): void {
    this._data.buzzOff(data.name);
  }
  public sensorid(data: SensorData): string {
    return data.name;
  }
  public get isSignedIn(): boolean {
    return this._data.isSignedIn;
  }
}
