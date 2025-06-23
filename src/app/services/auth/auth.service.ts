import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getUserRole(): number | null {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.role;
    }
    return null;
  }

  isUserAdmin(): boolean {
    const role = this.getUserRole();
    return role === 1 || role === 2;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}
