import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuth: boolean = false;
  private authSub: Subscription;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isAuth = this.authService.getIsAuth();  //listener is instantiated after listener, doesn't know prev value (getisAut() is available because header loads after app comp)
    this.authSub = this.authService.getAuthStatusListener().subscribe(isAuth => { this.isAuth = isAuth })
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  onLogout() {
    this.authService.logoutUser();
  }
}
