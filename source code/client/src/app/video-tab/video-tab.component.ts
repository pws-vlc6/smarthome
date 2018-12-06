import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-video-tab',
  templateUrl: './video-tab.component.html',
  styleUrls: ['./video-tab.component.scss']
})
export class VideoTabComponent implements OnInit {

  constructor(private _data: DataService) { }

  ngOnInit() {
    this._data.getVideoUrl().then(data => {
      this.url = data;
    });
  }
  public url: string;

}
