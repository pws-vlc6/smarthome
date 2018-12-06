import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { lampData } from '../data.models';
import { Observable, interval } from 'rxjs';
import { flatMap, startWith, tap, filter } from 'rxjs/operators';
import { ColorPickerService } from 'ngx-color-picker';


@Component({
  selector: 'app-lamp',
  templateUrl: './lamp.component.html',
  styleUrls: ['./lamp.component.scss']
})
export class LampComponent implements OnInit {

  lampData: lampData = {};
  savedcolor: string;
  isEditing: boolean;
  addIndex: number;

  constructor(private _data: DataService) { }

  ngOnInit() {
    if (!this._data.isSignedIn) {
      return;
    }

    this._data.getLampData().toPromise().then(data => {
      interval(2000).pipe(
        filter(() => !this.isEditing),
        flatMap(() => this._data.getLampData()),
        startWith(data)
      ).subscribe(data => {
        this.lampData = data;
        debugger;
        this.addIndex = -1;
        $("#brightness").data("roundSlider").setValue(data.brightness * 100);

      });
    });

    $("#brightness").roundSlider({
      radius: 110,
      circleShape: "pie",
      sliderType: "min-range",
      showTooltip: true,
      value: 0,
      startAngle: 315,
      max: 100,
      mouseScrollAction: true
    }).on("change", e => {
      this._data.lampBrightness(e.value / 100);
    });
  }
  ngOnDestroy() {
    $("#brightness").roundSlider("destroy");
    // $('#content').removeClass('center');

  }

  public addColor() {
    this.isEditing = true;
    this.addIndex = this.lampData.colors.length;
    this.lampData.colors.push('');
  };

  public changeColor(idx: number, color) {
    if (idx < this.lampData.colors.length) {
      this.lampData.colors[idx] = color;
      if (idx === this.addIndex) {
        this._data.addColor(color);
        this.addIndex = -1;
      } else {
        this._data.editColor(idx, color);
      }
    }
  }

  public deleteColor(idx: number) {
    if (idx < this.lampData.colors.length) {
      this.lampData.colors.splice(idx, 1);
      this._data.deleteColor(idx);
    }
  }

  public activeColor(index: number) {
    this.lampData.active = index;
    this._data.activeColor(index);
  }

  public statusColor(status: boolean) {
    this._data.lampStatus(status);
  }

  public startEditingColor() {
    this.isEditing = true;
  }

  public colorClosed() {
    this.isEditing = false;
  }

}
