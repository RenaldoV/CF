import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactForgotPasswordComponent } from './contact-forgot-password.component';

describe('ContactForgotPasswordComponent', () => {
  let component: ContactForgotPasswordComponent;
  let fixture: ComponentFixture<ContactForgotPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactForgotPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
