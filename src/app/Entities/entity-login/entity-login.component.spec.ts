import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityLoginComponent } from './entity-login.component';

describe('EntityLoginComponent', () => {
  let component: EntityLoginComponent;
  let fixture: ComponentFixture<EntityLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
