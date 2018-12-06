import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { DataService } from "./data.service";

@Injectable()
export class FirstTimeGuard implements CanActivate {
    private firstTime: boolean = true;
    private startPage: string
    
    constructor(
        private _data: DataService,
        private _router: Router,
    ) {
        this.startPage = localStorage.getItem('startPage');
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.firstTime) {
            if (this.startPage) {
                this._router.navigate(["/", this.startPage]);
            } else {
                this._router.navigate(["/"]);
            }
            this.firstTime = false;
            return false;
        } else {
            return true;
        }
    }
}