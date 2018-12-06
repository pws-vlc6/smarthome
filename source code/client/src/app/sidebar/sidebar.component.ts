import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {

  toggledMenu: boolean;
  toggledStartpage: boolean;
  constructor(
    private _data: DataService,
  ) {  }

  ngOnInit() {
    this.toggledMenu = false;
    this.toggledStartpage = false;
   }
  public get isSignedIn(): boolean {
    return this._data.isSignedIn;
  }
  public toggleMenu() {
    if (this.toggledStartpage === true) {
      this.toggledStartpage = false;
    } else {
      this.toggledMenu = !this.toggledMenu;
    }
  }
  public toggleEditStartpage() {
    this.toggledMenu = false;
    this.toggledStartpage = !this.toggledStartpage;
  }
  public logout(): void {
    this.toggledMenu = false;
    this._data.logout();
  }
  public get startPage(): string {
    return localStorage.getItem('startPage') || "";
  }
  public set startPage(value: string) {
    localStorage.setItem('startPage', value);
  }
}