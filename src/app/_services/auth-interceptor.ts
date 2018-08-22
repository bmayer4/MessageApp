import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

//middleware for outgoing requests
@Injectable()   //need to so we can inject services into this service
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler ) {
        const authToken = this.authService.getToken();
        const authRequest = req.clone({      //must clone, creates copy of request to avoid unwated side effects
            headers: req.headers.set('Authorization', 'Bearer ' + authToken)  
        });  
        return next.handle(authRequest);
    }
}
