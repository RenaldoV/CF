import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactLogInComponent } from './contact-log-in.component';

describe('ContactLogInComponent', () => {
  let component: ContactLogInComponent;
  let fixture: ComponentFixture<ContactLogInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactLogInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactLogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
