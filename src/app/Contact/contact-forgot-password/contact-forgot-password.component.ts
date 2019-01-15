import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {ContactService} from '../contact.service';

@Component({
  selector: 'app-contact-forgot-password',
  templateUrl: './contact-forgot-password.component.html',
  styleUrls: ['./contact-forgot-password.component.css']
})
export class ContactForgotPasswordComponent implements OnInit {
  submitted = false;
  message = '';
  constructor(
    private auth: ContactService,
    private router: Router,
    private matSnack: MatSnackBar
  ) { }

  ngOnInit() {
  }

  submit(e) {
    console.log('form value outside: ' + e);
    this.auth.checkEmail(e)
      .subscribe(res => {
        if (res) {
          this.submitted = true;
          this.message = 'Please check your email and follow the instructions';
          this.matSnack.open('Please check your email and follow the instructions');
        } else {
          this.submitted = true;
          this.message = 'Email does not exist or has not been verified, please follow the link from your email to verify your account.';
          this.matSnack.open('Email does not exist or has not been verified, ' +
            'please follow the link from your email to verify your account.');
        }
      }, (error) => {
        console.log(error);
      });
  }

}
