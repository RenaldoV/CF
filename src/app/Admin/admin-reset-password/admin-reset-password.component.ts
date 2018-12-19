import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-admin-reset-password',
  templateUrl: './admin-reset-password.component.html',
  styleUrls: ['./admin-reset-password.component.css']
})
export class AdminResetPasswordComponent implements OnInit {
  token;
  tokenValid = false;
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private matSnack: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.auth.checkResetToken(this.token)
    .subscribe(res => {
      if (res) {
        this.tokenValid = true;
      } else {
        const sb = this.matSnack.open('Reset token has expired, please try again.', 'ok');
        sb.afterDismissed().subscribe(() => {
          this.router.navigate(['/admin-forgot']);
        });
      }
    }, er => {
      console.log(er);
    });
  }

  submit(e) {
    this.auth.updateForgotPassword(this.token, e)
      .subscribe(res => {
        if (res) {
          const sb = this.matSnack.open('Password successfully changed', 'ok');
          sb.afterDismissed().subscribe(() => {
            this.auth.loginUser({email: res.email, password: e});
          });
        } else {
          const sb = this.matSnack.open('Unsuccessful', 'retry');
          sb.afterDismissed().subscribe(() => {
            this.submit(e);
          });
        }
      });
  }

}
