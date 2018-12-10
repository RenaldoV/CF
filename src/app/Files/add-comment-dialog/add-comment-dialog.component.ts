import { Component, OnInit } from '@angular/core';
import {AddContactDialogComponent} from '../add-contact-dialog/add-contact-dialog.component';
import {MatDialogRef, MatSnackBar} from '@angular/material';
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
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCommentDialogComponent>,
    private matSnack: MatSnackBar
  ) {
    this.createCommentForm();
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }
  createCommentForm() {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }
  get comment() {
    return this.commentForm.get('comment');
  }
  submitComment() {
    if (this.commentForm.valid) {
      this.dialogRef.close(this.commentForm.value.comment);
    }
  }

}
