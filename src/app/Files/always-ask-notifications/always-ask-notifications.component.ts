import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {AddCommentDialogComponent} from '../add-comment-dialog/add-comment-dialog.component';

@Component({
  selector: 'app-always-ask-notifications',
  templateUrl: './always-ask-notifications.component.html',
  styleUrls: ['./always-ask-notifications.component.css']
})
export class AlwaysAskNotificationsComponent implements OnInit {
  notiPropsForm: FormGroup;
  milestone: any;
  filteredEmailContacts;
  filteredCellContacts;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCommentDialogComponent>,
    private matSnack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filteredEmailContacts = this.data.contacts.filter(ct => ct.email !== undefined);
    this.filteredCellContacts = this.data.contacts.filter(ct => ct.cell !== undefined);
    this.createForm();
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }
  createForm() {
    this.notiPropsForm = this.fb.group({
      sendSMS: [this.data.milestone.sendSMS],
      smsMessage: new FormControl({value: this.data.milestone.smsMessage, disabled: true}),
      sendEmail: [this.data.milestone.sendEmail],
      emailMessage: new FormControl({value: this.data.milestone.emailMessage, disabled: true}),
      smsContacts: [this.data.milestone.sendSMS ? this.filteredCellContacts : ''],
      emailContacts: [this.data.milestone.sendEmail ? this.filteredEmailContacts : '']
    });
  }
  get sendSMS() {
    return this.notiPropsForm.get('sendSMS');
  }
  get sendEmail() {
    return this.notiPropsForm.get('sendEmail');
  }
  get smsMessage() {
    return this.notiPropsForm.get('smsMessage');
  }
  get emailMessage() {
    return this.notiPropsForm.get('emailMessage');
  }
  get smsContacts () {
    return this.notiPropsForm.get('smsContacts');
  }
  get emailContacts () {
    return this.notiPropsForm.get('emailContacts');
  }
  changeSend(e, name) {
    const ctr = this.notiPropsForm.get(name);
    if (name === 'sendSMS') {
      if (e.checked) {
        this.smsContacts.setValue(this.filteredCellContacts);
        this.smsContacts.setValidators(Validators.required);
        this.smsContacts.updateValueAndValidity();
      } else {
        this.smsContacts.setValue('');
        this.smsContacts.clearValidators();
        this.smsContacts.updateValueAndValidity();
      }
    } else if (name === 'sendEmail') {
      if (e.checked) {
        this.emailContacts.setValue(this.filteredEmailContacts);
        this.emailContacts.setValidators(Validators.required);
        this.emailContacts.updateValueAndValidity();
      } else {
        this.emailContacts.setValue('');
        this.emailContacts.clearValidators();
        this.emailContacts.updateValueAndValidity();
      }
    }
  }
  submit() {
    if (this.notiPropsForm.valid) {
      this.dialogRef.close(this.notiPropsForm.value);
    }
  }
}


