import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {PasswordValidators} from '../../Common/Validators/passwordValidators';
import {MatSnackBar} from '@angular/material';
import {LoaderService} from '../../Common/Loader';

@Component({
  selector: 'app-log-in',
  templateUrl: './admin-log-in.component.html',
  styleUrls: ['./admin-log-in.component.css']
})
export class AdminLogInComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  uid;
  ngOnInit() {
    this.uid = this.route.snapshot.paramMap.get('id');
    if (this.uid) { // check if user has been verified and exists
      this.auth.getUserById(this.uid)
        .subscribe(res => {
          if (res) {
            if (!res.verified) {
              this.createRegisterForm(res.email);
            } else {
              alert('This account has already been registered, please log in');
              this.createForm();
            }
          } else {
            alert('This account has already been registered, please log in');
            this.createForm();
          }
        }, (err) => {
          if (err) {
            alert('Please log in with you credentials');
            this.router.navigate(['admin-login']);
          }
        });
    } else {
      this.createForm();
    }
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private matSnack: MatSnackBar,
    public loaderService: LoaderService
  ) {
    /*const u = {
      passwordHash : 'admin',
      company : 'CBI Attorneys',
      email : 'renaldovd@gmail.com',
      role : 'admin',
      name : 'Theuns',
      cell : '0781553936',
      surname : '',
      verified: true
    };
    this.auth.addUser(u)
      .subscribe((res) => {
        console.log(res);
      });*/
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
    this.auth.loginUser(this.loginForm.value)
      .subscribe(res => {
        if (res) {
          this.auth.saveUser(res);
          this.router.navigate(['/admin-home']);
        } else {
          this.matSnack.open('Email and password combination is incorrect.');
          return false;
        }
      }, err => {
        console.log(err);
        return false;
      });
  }

  createRegisterForm(email) {
    this.registerForm = this.fb.group({
      email: [email, Validators.required],
      passwordHash: ['', [Validators.required, PasswordValidators.passwordPattern]],
      rePassword: ['', Validators.required]
    }, {
      validator: PasswordValidators.passwordsMatch
    });
    this.regEmail.disable();
  }
  get regEmail () {
    return this.registerForm.get('email');
  }
  get regPassword () {
    return this.registerForm.get('passwordHash');
  }
  get regRePassword () {
    return this.registerForm.get('rePassword');
  }
  togglePasswordViz(el) {
    el.type === 'password' ? el.type = 'text' : el.type = 'password';
  }
  register() {
    // delete password and email
    const payload = this.registerForm.value;
    payload.verified = true;
    payload._id = this.uid;
    delete payload.email;
    delete payload.rePassword;
    this.auth.register(payload);
  }

}
