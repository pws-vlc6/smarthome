import { Component, OnInit, Input, AfterContentInit, AfterViewInit } from '@angular/core';
declare var videojs: any;

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, AfterViewInit {
  private player: any;
  constructor() { }

  ngOnInit() {
  }
  
  @Input() public id : string;
  @Input() public url : string;

  ngAfterViewInit() {

    // ID with which to access the template's video element
    let el = 'video_' + this.id;

    // setup the player via the unique element ID
    this.player = videojs(document.getElementById(el), {}, function () {

      // Store the video object
      var myPlayer = this, id = myPlayer.id();

      // Make up an aspect ratio
      var aspectRatio = 264 / 640;

      // internal method to handle a window resize event to adjust the video player
      function resizeVideoJS() {
        var width = document.getElementById(id).parentElement.offsetWidth;
        myPlayer.width(width).height(width * aspectRatio);
      }

      // Initialize resizeVideoJS()
      resizeVideoJS();

      // Then on resize call resizeVideoJS()
      window.onresize = resizeVideoJS;
    });
  }

}
