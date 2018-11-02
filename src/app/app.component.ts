import { Component } from '@angular/core';
import {AuthService} from './auth/auth.service';
import {IUser} from '../interfaces/IUser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private authService: AuthService) {
    /*const user : IUser = {
      passwordHash : 'rootTest1',
      name : 'Renaldo',
      surname : 'van Dyk',
      role : 'admin',
      email : 'renaldovd@gmail.com'
    };*/
    // this.authService.addUser(user);
  }
}
