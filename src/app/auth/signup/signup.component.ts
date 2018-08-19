import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../_services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authSub: Subscription;
  form: FormGroup;

  constructor(private authService: AuthService) { }

  ngOnInit() {

    this.form = new FormGroup({
      email: new FormControl(null, { validators: [Validators.required, Validators.email] }),
      passwords: new FormGroup({
          password: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(12)]),
          confirmPassword: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(12)]),
        },
        {
          validators: group => group.value.password === group.value.confirmPassword ? null : {'unmatched': true}
        }
      )
    });

    this.authSub = this.authService.getAuthStatusListener().subscribe(auth => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  checkPasswordMatch() {
    return this.form.get('passwords.password').valid
        && this.form.get('passwords.confirmPassword').valid
        && this.form.get('passwords').invalid;
  }

  onSignup() {
    if (this.form.invalid) { return; }
    
    this.isLoading = true;
    this.authService.createUser(this.form.value.email, this.form.value.passwords.password);
  }

}
