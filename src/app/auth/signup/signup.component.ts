import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  isloading = false;

  constructor() { }

  ngOnInit() {
  }

  onSignup(form: NgForm) {
    console.log(form);
  }

}