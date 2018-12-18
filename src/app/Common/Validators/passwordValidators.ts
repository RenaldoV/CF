import {AbstractControl, ValidationErrors } from '@angular/forms';

export class PasswordValidators {


  static passwordsMatch (control: AbstractControl) {
      const retype = control.get('rePassword');
      const pw = control.get('passwordHash');

      if (pw.value) {
        if (retype.value !== pw.value) {
          control.get('rePassword').setErrors( {PasswordMismatch: true} );
        }
      }
      return null;
  }
  static passwordPattern (control: AbstractControl): ValidationErrors | null {
      const lowerCaseRegex = RegExp('(?=.*[a-z])'),
            upperCaseRegex = RegExp('(?=.*[A-Z])'),
            numberRegex = RegExp('(?=.*[0-9])'),
            specialRegex = RegExp('(?=.*[!@#\$%\^&\*])'),
            lengthRegex = RegExp('(?=.{6,})');
      if (control.value as string === '' || control.value === null) {
        return null;
      } else if (lowerCaseRegex.exec((control.value as string)) === null) {
        return {
          lowerCase: true
        };
      } else if (upperCaseRegex.exec((control.value as string)) === null) {
        return {
          upperCase: true
        };
      } else if (numberRegex.exec((control.value as string)) === null) {
        return {
          number: true
        };
      } else if (specialRegex.exec((control.value as string)) === null) {
        return {
          special: true
        };
      } else if (lengthRegex.exec((control.value as string)) === null) {
        return {
          length: true
        };
      }
      return null;
    }
}
