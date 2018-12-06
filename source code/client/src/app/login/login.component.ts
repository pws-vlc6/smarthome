import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private data: DataService, private _router:Router) { }

  ngOnInit() {
  }

  public password: string;
  public username: string;
  public submit(): void {
    // console.log(this.password);
    this.data.login(this.password, this.username).then(r => {
      if (r) {
        this._router.navigate(["/"]);
      }
    });
  }
}
