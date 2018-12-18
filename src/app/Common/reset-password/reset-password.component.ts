import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {PasswordValidators} from '../Validators/passwordValidators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token;
  @Output() _submit = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.createForm();
  }
  createForm() {
    this.resetForm = this.fb.group({
      passwordHash: ['', [Validators.required, PasswordValidators.passwordPattern]],
      rePassword: ['', [Validators.required]]
    }, {
      validator: PasswordValidators.passwordsMatch
    });
  }
  get passwordHash() {
    return this.resetForm.get('passwordHash');
  }
  get rePassword() {
    return this.resetForm.get('rePassword');
  }
  submit() {
    if (this.resetForm.valid) {
      this._submit.emit(this.passwordHash.value);
    }
  }
  togglePasswordViz(el) {
    el.type === 'password' ? el.type = 'text' : el.type = 'password';
  }
}
