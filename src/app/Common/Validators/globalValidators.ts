import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Observable} from 'rxjs/index';
import {SelectorValidatorWalker} from 'codelyzer/selectorNameBase';


export class GlobalValidators {

  static cellRegex (control: AbstractControl) {
    if (control.value as string === '' || control.value === null) {
      return null;
    } else if (!(/^\d+$/.test(control.value as string))) {
      return {
        numbers: true
      };
    } else if ((control.value as string).length !== 10) {
      return {
        length: true
      };
    } else if ((control.value as string)[0] !== '0') {
      return {
        firstZero: true
      };
    }
    return null;
  }

  static validEmail(control: AbstractControl): {[key: string]: boolean} | null {
    let email = control.value as string;
    if (email) {
      email = email.toLowerCase();
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!regex.test(email)) {
        return {
          invalidEmail: true
        };
      }
    }
  }

  static validSMS(control: AbstractControl): {[key: string]: boolean} | null {
    let sms = control.value as string;
    if (sms) {
      const regex = /[^@£$¥èéùìò\f\n !#%&'\(\)\*\+,-.\/0-9:;=\?ÄÖÑÜa-zäöñüà\^\|€_]/gi;
      if (regex.test(sms)) {
        return {
          invalidCharacter: true
        };
      }
    }
  }

    static required(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (val) {
      return null;
    } else {
      return {
        required: true
      };
    }
  }

  static IdDobValidation(control: AbstractControl) {
    const dob = new Date(control.get('dob').value);
    const IDnumber = control.get('IDnumber').value;
    if (dob && IDnumber) {
      const day = (String(dob.getDate()).length < 2) ? '0' + String(dob.getDate()) : String(dob.getDate());
      const month = String(dob.getMonth() + 1).length < 2 ? '0' + String(dob.getMonth() + 1) : String(dob.getMonth() + 1);
      const year = String(dob.getFullYear()).substr(2, 2);
      const DOB = year + month + day;
      if (DOB !== String(IDnumber).substr(0, 6)) {
        control.get('IDnumber').setErrors({dobIdMismatch: true});
      }
    }
    return null;
  }

  static range(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      if (c.value && (isNaN(c.value) || c.value < min || c.value > max)) {
        return {'range': true};
      }
      return null;
    };
  }

}


