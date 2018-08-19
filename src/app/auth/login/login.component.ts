import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../_services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authSub = this.authService.getAuthStatusListener().subscribe(auth => {  //auth is bool
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  onLogin(form: NgForm) {
    if (form.invalid) { return }
    this.isLoading = true;
    this.authService.loginUser(form.value.email, form.value.password);
  }

}
