import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GlobalValidators} from '../Validators/globalValidators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  emailParam;
  @Output() _submit = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.emailParam = this.route.snapshot.paramMap.get('email');
    this.createForm();
  }
  createForm() {
    this.forgotForm = this.fb.group({
      email: [this.emailParam, [Validators.required, GlobalValidators.validEmail]]
    });
  }
  get email () {
    return this.forgotForm.get('email');
  }
  submit() {
    if (this.forgotForm.valid) {
      this._submit.emit(this.email.value);
    }
  }

}
