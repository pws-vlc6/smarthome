import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { DataService } from "./data.service";

@Injectable()
export class SignedInGuard implements CanActivate {
    constructor (
        private _data: DataService,
        private _router: Router,
    ){

    }
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this._data.isSignedIn) {
        return true;
      }
      this._router.navigate(['/login']);
      return false;
  }
}