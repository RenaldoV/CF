import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {LoaderService} from '../../Loader';
import {AdminService} from '../../Admin/admin.service';
import {GlobalValidators} from '../../Common/Validators/globalValidators';

@Component({
  selector: 'app-add-contact-dialog',
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['./add-contact-dialog.component.css']
})
export class AddContactDialogComponent implements OnInit {

  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddContactDialogComponent>,
    public loaderService: LoaderService,
    private adminService: AdminService,
    private matSnack: MatSnackBar
  ) {
    this.createContactsForm();
  }

  ngOnInit() {}
  close() {
    this.dialogRef.close();
  }

  createContactsForm() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      cell: ['', Validators.required],
      email: ['', [
        Validators.required,
        GlobalValidators.validEmail
      ], this.shouldBeUnique.bind(this)],
      type: ['', Validators.required]
    });
  }
  get name() {
    return this.contactForm.get('name');
  }
  get cell() {
    return this.contactForm.get('cell');
  }
  get email() {
    return this.contactForm.get('email');
  }
  get type() {
    return this.contactForm.get('type');
  }
  submitContact() {
    if (this.contactForm.valid) {
      this.adminService.createContact(this.contactForm.value)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Contact added successfully');
            this.dialogRef.close(res);
          } else {
            const sb = this.matSnack.open('Contact not created successful', 'retry');
            sb.onAction().subscribe(() => {
              this.submitContact();
            });
          }
        }, err => {
          const sb = this.matSnack.open('Contact not created successful', 'retry');
          sb.onAction().subscribe(() => {
            this.submitContact();
          });
          console.log(err);
        });
    }
  }

  shouldBeUnique(control: AbstractControl): Promise<ValidationErrors> | null {
    const q = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.adminService.getContactByEmail(control.value).subscribe((res) => {
          if (!res) {
            resolve(null);
          } else {
            resolve({'emailNotUnique': true});
          }
        });
      }, 100);
    });
    return q;
  }
}
