import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTabComponent } from './video-tab.component';

describe('VideoTabComponent', () => {
  let component: VideoTabComponent;
  let fixture: ComponentFixture<VideoTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
