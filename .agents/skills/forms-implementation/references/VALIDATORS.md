# Angular Form Validators Reference

## Built-in Validators

| Validator | Usage | Error Key |
|-----------|-------|-----------|
| `required` | Field must have value | `required` |
| `minLength(n)` | Min n characters | `minlength` |
| `maxLength(n)` | Max n characters | `maxlength` |
| `min(n)` | Minimum number | `min` |
| `max(n)` | Maximum number | `max` |
| `email` | Valid email format | `email` |
| `pattern(regex)` | Match pattern | `pattern` |

## Usage Examples

```typescript
// Reactive Forms
this.form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  age: [null, [Validators.min(18), Validators.max(120)]]
});

// Template Forms
<input [(ngModel)]="name" required minlength="3" />
```

## Error Display Pattern

```html
<input formControlName="email" />
<div *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
  <span *ngIf="form.get('email')?.hasError('required')">Email required</span>
  <span *ngIf="form.get('email')?.hasError('email')">Invalid email</span>
</div>
```

## Cross-Field Validation

```typescript
// Password confirmation
this.form = this.fb.group({
  password: ['', Validators.required],
  confirm: ['', Validators.required]
}, { validators: this.passwordMatch });

passwordMatch(group: FormGroup) {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pass === confirm ? null : { mismatch: true };
}
```
