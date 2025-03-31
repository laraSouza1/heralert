import { Component } from '@angular/core';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { MenuBarComponent } from '../shared/menu-bar/menu-bar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-login',
  imports: [InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule, MenuBarComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  isPasswordVisible: boolean = false;

  constructor(private router: Router) {}

  //navegação botões
  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }

  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  //visibilidade password
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
