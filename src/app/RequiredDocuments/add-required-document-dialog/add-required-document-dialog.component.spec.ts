import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRequiredDocumentDialogComponent } from './add-required-document-dialog.component';

describe('AddRequiredDocumentDialogComponent', () => {
  let component: AddRequiredDocumentDialogComponent;
  let fixture: ComponentFixture<AddRequiredDocumentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRequiredDocumentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRequiredDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
