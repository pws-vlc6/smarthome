import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VideoComponent } from './video/video.component';
import { HumidityComponent } from './humidity/humidity.component';
import { LoginComponent } from './login/login.component';
import { VideoTabComponent } from './video-tab/video-tab.component';
import { SignedInGuard } from './signed-in.guard';
import { LampComponent } from './lamp/lamp.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { FirstTimeGuard } from './first-time.guard';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HomeComponent,
    VideoComponent,
    HumidityComponent,
    LoginComponent,
    VideoTabComponent,
    LampComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ColorPickerModule
  ],
  providers: [SignedInGuard, FirstTimeGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
