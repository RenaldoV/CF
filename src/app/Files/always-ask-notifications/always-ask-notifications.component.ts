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
      sendEmail: [this.data.sendEmail]
    });
  }
  submit() {
    if (this.notiPropsForm.valid) {
      this.dialogRef.close(this.notiPropsForm.value);
    }
  }
}


