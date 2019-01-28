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
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCommentDialogComponent>,
    private matSnack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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
      chooseBank1: [''],
      chooseBank2: [''],
      contacts1: ['', [Validators.required]],
      contacts2: ['', [Validators.required]]
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
  get chooseBank1 () {
    return this.notiPropsForm.get('chooseBank1');
  }
  get chooseBank2 () {
    return this.notiPropsForm.get('chooseBank2');
  }
  get contacts1 () {
    return this.notiPropsForm.get('contacts1');
  }
  get contacts2 () {
    return this.notiPropsForm.get('contacts2');
  }
  changeSend(e, name) {
    const ctr = this.notiPropsForm.get(name);
    if (name === 'sendSMS') {
      if (e.checked) {
        this.chooseBank1.setValidators(Validators.required);
        this.chooseBank1.updateValueAndValidity();
      } else {
        this.chooseBank1.clearValidators();
        this.chooseBank1.updateValueAndValidity();
      }
    } else if (name === 'sendEmail') {
      if (e.checked) {
        this.chooseBank2.setValidators(Validators.required);
        this.chooseBank2.updateValueAndValidity();
      } else {
        this.chooseBank2.clearValidators();
        this.chooseBank2.updateValueAndValidity();
      }
    }
  }
  chooseBank(e, name) {
    const ctr = this.notiPropsForm.get(name);
    ctr.setValue(ctr.value.replace('*bank*', e));
    if (name === 'smsMessage') {
      if (confirm('Would you like to choose the same bank for the email message?')) {
        this.emailMessage.setValue(this.emailMessage.value.replace('*bank*', e));
        this.chooseBank2.setValue(e);
        this.sendEmail.setValue(true);
      }
    } else if (name === 'emailMessage') {
      if (confirm('Would you like to choose the same bank for the sms message?')) {
        this.smsMessage.setValue(this.smsMessage.value.replace('*bank*', e));
        this.chooseBank1.setValue(e);
        this.sendSMS.setValue(true);
      }
    }
  }
  submit() {
    this.notiPropsForm.markAsTouched();
    if (this.notiPropsForm.valid) {
      const payload = {
        smsMessage: null,
        emailMessage: null,
        sendSMS: this.sendSMS.value,
        sendEmail: this.sendEmail.value
      };
      if (this.data.milestone.smsMessage !== this.smsMessage.value) {
        payload.smsMessage = this.smsMessage.value;
      }
      if (this.data.milestone.emailMessage !== this.emailMessage.value) {
        payload.emailMessage = this.emailMessage.value;
      }
      this.dialogRef.close(payload);
    }
  }
}


