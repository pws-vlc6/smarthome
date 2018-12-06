import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng6';

  constructor(
    private _data: DataService,
    ) {}

  public get isSignedIn(): boolean {
    return this._data.isSignedIn;
  }


}

