import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-admin-forgot-password',
  templateUrl: './admin-forgot-password.component.html',
  styleUrls: ['./admin-forgot-password.component.css']
})
export class AdminForgotPasswordComponent implements OnInit {

  constructor(
    private auth: AuthService
  ) { }

  ngOnInit() {
  }

  submit(e) {
    console.log('form value outside: ' + e);
    this.auth.checkEmail(e)
      .subscribe(res => {
        console.log(res);
      }, (error) => {
        console.log(error);
      });
  }

}
