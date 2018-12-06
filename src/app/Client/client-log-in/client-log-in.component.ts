import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {ClientService} from '../client.service';
import {FileService} from '../../Files/file.service';

@Component({
  selector: 'app-client-log-in',
  templateUrl: './client-log-in.component.html',
  styleUrls: ['./client-log-in.component.css']
})
export class ClientLogInComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  fileID;
  fileRef;
  clientID;
  subtitle;
  title;
  ngOnInit() {
    this.fileID = this.route.snapshot.paramMap.get('file');
    this.clientID = this.route.snapshot.paramMap.get('client');
    if (this.fileID && this.clientID) {
      this.clientService.getClient(this.clientID)
        .subscribe(res => {
          if (!res.verified) {
            this.subtitle = 'Create an account';
            this.title = 'Registration';
            this.createRegisterForm(res.email);
          } else {
            this.subtitle = 'Welcome back! Please login to your account.';
            this.title = 'Client Log-In';
            this.createLoginForm();
          }
        });
      this.fileService.getFileRef(this.fileID)
        .subscribe(res => {
          if (res.fileRef) {
            this.fileRef = res.fileRef;
          }
        });
    } else if (this.fileID) {
      this.subtitle = 'Welcome back! Please login to your account.';
      this.title = 'Client Log-In';
      this.createLoginForm();
      this.fileService.getFileRef(this.fileID)
        .subscribe(res => {
          if (res.fileRef) {
            this.fileRef = res.fileRef;
          }
        });
    }
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private fileService: FileService,
    private router: Router) {
  }
  createLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  get loginEmail () {
    return this.loginForm.get('email');
  }
  get loginPassword () {
    return this.loginForm.get('password');
  }
  createRegisterForm(email) {
    this.registerForm = this.fb.group({
      email: [email, Validators.required],
      password: ['', Validators.required],
      rePassword: ['', Validators.required]
    });
    this.regEmail.disable();
  }
  get regEmail () {
    return this.registerForm.get('email');
  }
  get regPassword () {
    return this.registerForm.get('password');
  }
  get regRePassword () {
    return this.registerForm.get('rePassword');
  }
  login () {
    this.auth.loginUser(this.loginForm.value);
  }
  register () {
    this.auth.loginUser(this.loginForm.value);
  }
}
