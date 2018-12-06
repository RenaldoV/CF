import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './admin-log-in.component.html',
  styleUrls: ['./admin-log-in.component.css']
})
export class AdminLogInComponent implements OnInit {
  loginForm: FormGroup;
  ngOnInit() {
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router) {
    /*this.auth.addUser(
      {
        passwordHash: 'rootTest1#',
        company: 'CBI Attorneys',
        email: 'renaldovd@gmail.com',
        role: 'admin',
        name: 'Renaldo',
        surname: 'Van Dyk'
      }
    );*/
    this.createForm();
  }
  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  get email () {
    return this.loginForm.get('email');
  }
  get password () {
    return this.loginForm.get('password');
  }
  submit () {
    this.auth.loginUser(this.loginForm.value);
  }

}
