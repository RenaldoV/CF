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
  formType;
  commentForm: FormGroup;
  summaryForm: FormGroup;
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
    if (this.data.summary) {
      this.createSummaryForm();
      this.formType = 'Summary';
    } else {
      this.formType = 'Comment';
      this.createCommentForm();
    }
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
  createSummaryForm() {
    this.summaryForm = this.fb.group({
      summary: ['', Validators.required],
      sendSMS: [true],
      sendEmail: [true],
      smsContacts: [this.filteredCellContacts],
      emailContacts: [this.filteredEmailContacts]
    });
  }
  get sendSMS() {
    if (this.data.summary) {
      return this.summaryForm.get('sendSMS');
    } else {
      return this.commentForm.get('sendSMS');
    }
  }
  get sendEmail() {
    if (this.data.summary) {
      return this.summaryForm.get('sendEmail');
    } else {
      return this.commentForm.get('sendEmail');
    }
  }
  get comment() {
    return this.commentForm.get('comment');
  }
  get summary() {
    return this.summaryForm.get('summary');
  }
  get smsContacts () {
    if (this.data.summary) {
      return this.summaryForm.get('smsContacts');
    } else {
      return this.commentForm.get('smsContacts');
    }
  }
  get emailContacts () {
    if (this.data.summary) {
      return this.summaryForm.get('emailContacts');
    } else {
      return this.commentForm.get('emailContacts');
    }
  }
  changeSend(e, name) {
    let form = this.commentForm;
    if (this.data.summary) {
      form = this.summaryForm;
    }
    if (name === 'sendSMS') {
      if (e.checked) {
        form.get('smsContacts').setValue(this.filteredCellContacts);
        form.get('smsContacts').setValidators(Validators.required);
        form.get('smsContacts').updateValueAndValidity();
      } else {
        form.get('smsContacts').setValue('');
        form.get('smsContacts').clearValidators();
        form.get('smsContacts').updateValueAndValidity();
      }
    } else if (name === 'sendEmail') {
      if (e.checked) {
        form.get('emailContacts').setValue(this.filteredEmailContacts);
        form.get('emailContacts').setValidators(Validators.required);
        form.get('emailContacts').updateValueAndValidity();
      } else {
        form.get('emailContacts').setValue('');
        form.get('emailContacts').clearValidators();
        form.get('emailContacts').updateValueAndValidity();
      }
    }
  }
  submitComment() {
    if (this.data.summary) {
      if (this.summaryForm.valid) {
        this.dialogRef.close(this.summaryForm.value);
      }
    } else {
      if (this.commentForm.valid) {
        this.dialogRef.close(this.commentForm.value);
      }
    }
  }

}
