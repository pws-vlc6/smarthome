import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../data.service';
import { BehaviorSubject, timer, EMPTY, Observable, interval, of } from 'rxjs';
import { map, combineLatest, switchMap, takeWhile, tap, filter, startWith, flatMap } from 'rxjs/operators';

@Component({
  selector: 'app-humidity',
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.scss']
})
export class HumidityComponent implements OnInit, OnDestroy {

  private _pauseResumeCountDown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _countDownValue$: BehaviorSubject<{ value: number, start: boolean }> = new BehaviorSubject({ value: 0, start: false });
  private readonly _resolution = 10;

  constructor(
    private _data: DataService,
  ) { }

  public countDown$: Observable<string>;

  ngOnInit() {
    $('#content').addClass('center');
    // roundSlider
    if (!this._data.isSignedIn) {
      return;
    }
    $("#duration").roundSlider({
      radius: 110,
      circleShape: "pie",
      sliderType: "min-range",
      showTooltip: false,
      value: 0,
      startAngle: 315,
      max: 30 * (60 / this._resolution),
      mouseScrollAction: true
    }).on("drag", e => {
      // this._pauseResumeCountDown$.next(false);
      this._countDownValue$.next({ value: e.value * this._resolution, start: false });
    }).on("change", e => {
      this._countDownValue$.next({ value: e.value * this._resolution, start: true });
      this._data.pumpRange(e.value * this._resolution);
    });
    this._data.getPumpTime().then(data => {
      interval(10000).pipe(
        flatMap(() => this._data.getPumpTime()),
        startWith(data)
      ).subscribe(v => this._countDownValue$.next({ value: v, start: true }))
    }); 

    this.countDown$ = this._countDownValue$.pipe(
      filter(v => v.value >= 0),
      map(v => { return { value: new Date().getTime() + (v.value * 1000), start: v.start }; }),
      switchMap(c => c.start ?
        timer(0, 1000).pipe(
          map(t => { return { value: Math.round((c.value - new Date().getTime()) / 1000), start: c.start }; }),
          takeWhile(v => v.value >= 0)) :
        [{ value: Math.round((c.value - new Date().getTime()) / 1000), start: c.start}]
      ),
      tap(v => { if (v.start) { $("#duration").data("roundSlider").setValue(v.value / this._resolution); } }),
      map(t => this.seconds2time(t.value))
    );

  }

  ngOnDestroy() {
    $("#duration").roundSlider("destroy");
    $('#content').removeClass('center');

  }

  private seconds2time(seconds: number): string {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);
    let time = "";

    if (hours != 0) {
      time = hours + ":";
    }
    if (minutes != 0 || time !== "") {
      time += ((minutes < 10 && time !== "") ? "0" + minutes : String(minutes)) + ":";
    }
    if (time === "") {
      time = seconds + "s";
    }
    else {
      time += (seconds < 10) ? "0" + seconds : String(seconds);
    }
    return time;
  }
  
}
