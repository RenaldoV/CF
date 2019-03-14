import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../../Admin/admin.service';
import {AuthService} from '../../auth/auth.service';
import {Router} from '@angular/router';
import {LoaderService} from '../../Common/Loader';
import {MatSnackBar} from '@angular/material';
import {EntityService} from '../entity.service';

@Component({
  selector: 'app-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.css']
})
export class EntityFormComponent implements OnInit {
  @Input() EntityForm: FormGroup;
  @Input() entity: any;
  @Output() _submit = new EventEmitter();
  @Output() _valueChange = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private auth: AuthService,
    private router: Router,
    public loaderService: LoaderService,
    private matSnack: MatSnackBar,
    private entityService: EntityService
  ) {
    this.createForm();
    console.log(this.EntityForm);
  }

  ngOnInit() {
  }
  createForm(existing?) {
    this.EntityForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      telephone: ['', Validators.required],
      contactPerson: [''],
      website: ['', Validators.required],
      contacts: [''],
      files: ['']
    });
  }
  valueChange() {
    this._valueChange.emit();
  }
  save() {
    this._submit.emit(this.EntityForm.value);
  }

}
