import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-admin-forgot-password',
  templateUrl: './admin-forgot-password.component.html',
  styleUrls: ['./admin-forgot-password.component.css']
})
export class AdminForgotPasswordComponent implements OnInit {

  constructor(
    private auth: AuthService,
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
          this.matSnack.open('Please check your email and follow the instructions');
        } else {
          this.matSnack.open('Email does not exist or has not been verified, ' +
            'please follow the link from your email to verify your account.');
        }
        console.log(res);
      }, (error) => {
        console.log(error);
      });
  }

}
