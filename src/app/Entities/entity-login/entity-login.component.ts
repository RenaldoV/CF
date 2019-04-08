import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ContactService} from '../../Contact/contact.service';
import {FileService} from '../../Files/file.service';
import {MatSnackBar} from '@angular/material';
import {LoaderService} from '../../Common/Loader';
import {EntityService} from '../entity.service';
import {PasswordValidators} from '../../Common/Validators/passwordValidators';

@Component({
  selector: 'app-entity-login',
  templateUrl: './entity-login.component.html',
  styleUrls: ['./entity-login.component.css']
})
export class EntityLoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  entityID;
  entityName;
  contactID;
  subtitle;
  title;
  ngOnInit() {
    this.entityID = this.route.snapshot.paramMap.get('entity');
    this.contactID = this.route.snapshot.paramMap.get('contact');
    if (this.entityID && this.contactID) {
      this.contactService.getContact(this.contactID)
        .subscribe(res => {
          if (!res.verified) {
            this.subtitle = 'Create an account';
            this.title = 'Registration';
            this.createRegisterForm(res.email);
          } else {
            this.subtitle = 'Welcome back! Please login to your account.';
            this.title = 'Client Log-In';
            this.createLoginForm(res.email);
          }
        }, (err) => {
          alert('Invalid client ID, please use the link provided in the email');
        });
      this.entityService.getEntity(this.entityID)
        .subscribe(res => {
          if (res) {
            this.entityName = res.name;
          }
        }, (err) => {
          alert('Invalid entity ID, please use the link provided in the email');
        });
    }
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private entityService: EntityService,
    private matSnack: MatSnackBar,
    private router: Router,
    public loaderService: LoaderService) {
  }
  createLoginForm(email) {
    this.loginForm = this.fb.group({
      email: [email, Validators.required],
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
  login () {
    this.contactService.login({
      _id: this.contactID,
      password: this.loginPassword.value
    }).subscribe(res => {
      console.log('login server result: ' + res);
      if (res) {
        this.auth.saveUser({
          _id: res._id,
          type: 'contact',
          name: res.name,
          email: res.email
        });
        this.router.navigate(['/entity', this.entityID]);
      } else {
        this.matSnack.open('Login failed, invalid username and password combination');
      }
    });
  }
  register () {
    if (this.registerForm.valid) {
      const contact = {
        _id: this.contactID,
        passwordHash: this.regPassword.value
      };
      this.contactService.registerContact(contact)
        .subscribe(res => {
          if (res) {
            this.auth.saveUser({
              _id: res._id,
              type: 'contact',
              name: res.name,
              email: res.email
            });
            this.router.navigate(['/entity', this.entityID]);
          } else {
            this.matSnack.open('Registration failed, please try again later');
          }
        });
    }
  }

}
