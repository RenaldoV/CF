import {Component, Inject, OnInit} from '@angular/core';
import {AddContactDialogComponent} from '../../Contact/add-contact-dialog/add-contact-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoaderService} from '../../Common/Loader';
import {AdminService} from '../../Admin/admin.service';
import {GlobalValidators} from '../../Common/Validators/globalValidators';

@Component({
  selector: 'app-add-comment-dialog',
  templateUrl: './add-comment-dialog.component.html',
  styleUrls: ['./add-comment-dialog.component.css']
})
export class AddCommentDialogComponent implements OnInit {
  commentForm: FormGroup;
  filteredEmailContacts; // to filter out contacts without emails
  filteredCellContacts; // to filter out contacts without cells
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCommentDialogComponent>,
    private matSnack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filteredEmailContacts = this.data.contacts.filter(ct => ct.email !== undefined);
    this.filteredCellContacts = this.data.contacts.filter(ct => ct.cell !== undefined);
    this.createCommentForm();
  }

  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }
  createCommentForm() {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
      sendSMS: [true],
      sendEmail: [true],
      smsContacts: [this.filteredCellContacts],
      emailContacts: [this.filteredEmailContacts]
    });
  }
  get sendSMS() {
    return this.commentForm.get('sendSMS');
  }
  get sendEmail() {
    return this.commentForm.get('sendEmail');
  }
  get comment() {
    return this.commentForm.get('comment');
  }
  get smsContacts () {
    return this.commentForm.get('smsContacts');
  }
  get emailContacts () {
    return this.commentForm.get('emailContacts');
  }
  changeSend(e, name) {
    if (name === 'sendSMS') {
      if (e.checked) {
        this.commentForm.get('smsContacts').setValue(this.filteredCellContacts);
        this.commentForm.get('smsContacts').setValidators(Validators.required);
        this.commentForm.get('smsContacts').updateValueAndValidity();
      } else {
        this.commentForm.get('smsContacts').setValue('');
        this.commentForm.get('smsContacts').clearValidators();
        this.commentForm.get('smsContacts').updateValueAndValidity();
      }
    } else if (name === 'sendEmail') {
      if (e.checked) {
        this.commentForm.get('emailContacts').setValue(this.filteredEmailContacts);
        this.commentForm.get('emailContacts').setValidators(Validators.required);
        this.commentForm.get('emailContacts').updateValueAndValidity();
      } else {
        this.commentForm.get('emailContacts').setValue('');
        this.commentForm.get('emailContacts').clearValidators();
        this.commentForm.get('emailContacts').updateValueAndValidity();
      }
    }
  }
  submitComment() {
    if (this.commentForm.valid) {
      this.dialogRef.close(this.commentForm.value);
    }
  }

}
