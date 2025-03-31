import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { Message } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuBarComponent } from '../shared/menu-bar/menu-bar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-sing-in',
  imports: [InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule, MessageModule, Message, CommonModule, MenuBarComponent, FooterComponent],
  templateUrl: './sing-in.component.html',
  styleUrls: ['./sing-in.component.css']
})
export class SingInComponent {

  name: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  emailError: boolean = false;
  usernameFormatError: boolean = false;
  usernameSpaceError: boolean = false;
  usernameLengthError: boolean = false;
  usernameMaxLengthError: boolean = false;
  nameMaxLengthError: boolean = false;
  nameLengthError: boolean = false;
  passwordError: boolean = false;
  confirmPasswordError: boolean = false;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor(private router: Router) {}

  //navegação botões ------------------------------
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  // Ver senha ------------------------------
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  // Validações do formulário
  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.email);
  }

  validateUsername() {
    this.usernameFormatError = !/^[A-Za-z0-9._]+$/.test(this.username);
    this.usernameSpaceError = this.username.includes(' ');
    this.usernameLengthError = this.username.length < 3;
    this.usernameMaxLengthError = this.username.length > 10;
  }

  validateName() {
    this.nameLengthError = !this.name || this.name.trim().length < 3;
    this.nameMaxLengthError = this.name.length > 20;
  }

  validatePassword() {
    this.passwordError = this.password.length < 8;
  }

  validateConfirmPassword() {
    this.confirmPasswordError = this.password !== this.confirmPassword;
  }

  onSubmit() {
    this.clearErrors();
    this.validateEmail();
    this.validateName();
    this.validateUsername();
    this.validatePassword();
    this.validateConfirmPassword();

    if (!this.emailError && !this.nameLengthError && !this.nameMaxLengthError &&
        !this.usernameFormatError && !this.usernameSpaceError &&
        !this.usernameLengthError && !this.usernameMaxLengthError &&
        !this.passwordError && !this.confirmPasswordError) {
      console.log('Formulário enviado com sucesso');
      this.navigateToFY();
    } else {
      console.log('Erro ao enviar formulário');
    }
  }


  clearErrors() {
    this.emailError = false;
    this.usernameFormatError = false;
    this.usernameSpaceError = false;
    this.usernameLengthError = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
  }
}
