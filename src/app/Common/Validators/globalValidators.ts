import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Observable} from 'rxjs/index';
import {SelectorValidatorWalker} from 'codelyzer/selectorNameBase';


export class GlobalValidators {

  static validCellNo(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const cellNumber = control.value as string;
      if (cellNumber) {
        if (cellNumber.length < 10 || cellNumber.length > 12) {
          return {
            invalidCell: true
          };
        } else if (cellNumber.length > 10 && cellNumber.substr(0, 3) !== '+27') { // check +27 format
          return {
            invalidCell: true
          };
        } else if (cellNumber.length === 9 && cellNumber[0] !== '0') { // check 078 format
          return {
            invalidCell: true
          };
        } else {
          for (let i = 1; i < cellNumber.length; i++) { // not alphanumeric
            if (isNaN(cellNumber[i] as any)) {
              return {
                invalidCell: true
              };
            }
          }
          return null;
        }
      }
    };
  }

  static validStudentEmail(control: AbstractControl): ValidationErrors | null {
    let email = control.value as string;
    let ret = {invalidStudentEmail: true};
    if (email) {
      email = email.toLowerCase();
      const validDomains = ['.edu', '@tuks.co.za', '.ac.za'];
      for (let i = 0; i < validDomains.length; i++) {
        if (email.endsWith(validDomains[i])) {
          ret = null;
        }
      }
    }
    return ret;
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
    return null;
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


