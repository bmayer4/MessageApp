import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';

import { AuthData } from '../models/auth-data.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + 'user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private userId: string;   //if storing more like email, name, use user object
  //decoded: any;  //I added this, only being used in header if I want

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }


  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(BACKEND_URL + 'signup/', authData).subscribe(() => {
      this.router.navigate(['/login']);
    }, err => {
      this.authStatusListener.next(false);
    });
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{ token: string, expiresIn: number, userId: string }>(BACKEND_URL + 'login/', authData).subscribe(response => {
      this.token = response.token;
      if (this.token) {
        //this.decoded = jwt_decode(response.token);  //teacher says decoding on front end is more work, send info from back end
        this.userId = response.userId;
        this.isAuthenticated = true;
        this.authStatusListener.next(true);

        const expiresInDuration = response.expiresIn; //seconds
        this.setAuthTimer(expiresInDuration);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);  //now + 3 hours
        this.saveAuthData(response.token, expirationDate, response.userId);
        this.router.navigate(["/"]);
      }
    }, err => {
      this.authStatusListener.next(false);
      console.log('error logging in'); //I can handle error here even though I have an error interceptor
    })
  }

  autoAuthUser() {  
    const authInfo = this.getAuthData();
    if (!authInfo) { return; }
    
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {  //then date is in future
      this.token = authInfo.token;
      this.userId = authInfo.userId;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000);
      //this.decoded = jwt_decode(authInfo.token);
    }
  }

  logoutUser() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(["/"]);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    //this.decoded = null;
  }


  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logoutUser();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }
  
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate || !userId) {
      return;
    } else {
      return {
        token, 
        userId,
        expirationDate: new Date(expirationDate)
      }
    }
   }

}
  //expires new Date(decoded.exp * 1000);
  //now new Date();