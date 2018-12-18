import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactResetPasswordComponent } from './contact-reset-password.component';

describe('ContactResetPasswordComponent', () => {
  let component: ContactResetPasswordComponent;
  let fixture: ComponentFixture<ContactResetPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactResetPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
