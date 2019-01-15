import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
      sendSMS: [this.data.sendSMS],
      smsMessage: [this.data.smsMessage],
      sendEmail: [this.data.sendEmail],
      emailMessage: [this.data.emailMessage]
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
  insertNoti(e, msg, control) {
    e.preventDefault();
    this.notiPropsForm.get(control).setValue(this.notiPropsForm.get(control).value + msg);
  }
  submit() {
    if (this.notiPropsForm.valid) {
      const payload = {
        smsMessage: null,
        emailMessage: null,
        sendSMS: this.sendSMS.value,
        sendEmail: this.sendEmail.value
      };
      if (this.data.smsMessage !== this.smsMessage.value) {
        payload.smsMessage = this.smsMessage.value;
      }
      if (this.data.emailMessage !== this.emailMessage.value) {
        payload.emailMessage = this.emailMessage.value;
      }
      this.dialogRef.close(payload);
    }
  }
}


