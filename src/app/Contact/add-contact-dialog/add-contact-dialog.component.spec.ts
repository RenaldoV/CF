import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactDialogComponent } from './add-contact-dialog.component';

describe('AddRequiredDocumentDialogComponent', () => {
  let component: AddContactDialogComponent;
  let fixture: ComponentFixture<AddContactDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddContactDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
