// Custom Form Validators for Angular
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, first } from 'rxjs/operators';

// Sync Validators
export class CustomValidators {

  // No whitespace
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (control.value?.includes(' ')) {
      return { noWhitespace: true };
    }
    return null;
  }

  // Strong password
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const isLongEnough = value.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecial && isLongEnough;

    return valid ? null : { strongPassword: {
      hasUpperCase, hasLowerCase, hasNumber, hasSpecial, isLongEnough
    }};
  }

  // Match another field (e.g., password confirmation)
  static matchField(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const otherField = parent.get(fieldName);
      if (!otherField) return null;

      return control.value === otherField.value ? null : { matchField: true };
    };
  }

  // Date range validator
  static dateRange(startField: string, endField: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get(startField)?.value;
      const end = group.get(endField)?.value;

      if (start && end && new Date(start) > new Date(end)) {
        return { dateRange: true };
      }
      return null;
    };
  }
}

// Async Validator Factory
export function uniqueEmailValidator(userService: any): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return userService.checkEmail(control.value).pipe(
      debounceTime(300),
      map(exists => exists ? { emailTaken: true } : null),
      first()
    );
  };
}
