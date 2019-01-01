import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlwaysAskNotificationsComponent } from './always-ask-notifications.component';

describe('AlwaysAskNotificationsComponent', () => {
  let component: AlwaysAskNotificationsComponent;
  let fixture: ComponentFixture<AlwaysAskNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlwaysAskNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlwaysAskNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
