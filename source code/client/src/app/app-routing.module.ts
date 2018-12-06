import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VideoTabComponent } from './video-tab/video-tab.component';
import { HumidityComponent } from './humidity/humidity.component';
import { LoginComponent } from './login/login.component';
import { SignedInGuard } from './signed-in.guard';
import { LampComponent } from './lamp/lamp.component';
import { FirstTimeGuard } from './first-time.guard';



const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [FirstTimeGuard]
  },
  {
    path: 'video',
    component: VideoTabComponent,
    canActivate: [SignedInGuard]
  },
  {
    path: 'lamp',
    component: LampComponent,
    canActivate: [SignedInGuard]
  },
  {
    path: 'humidity',
    component: HumidityComponent,
    canActivate: [SignedInGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
