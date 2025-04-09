import { Component, OnInit } from '@angular/core';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
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
import { HttpClient } from '@angular/common/http';

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
  isSubmitting: boolean = false;
  emailAlreadyUsed: boolean = false;
  usernameAlreadyUsed: boolean = false;
  user: any;

  constructor(private router: Router, private http: HttpClient) {}

  //navegação botões
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  //ver senha
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  //validações do formulário
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

    if (this.isSubmitting) return;
    this.isSubmitting = true;

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

      const registrationData = {
        username: this.username,
        name: this.name,
        email: this.email,
        password: this.password
      };

      this.http.post("http://localhost:8085/api/register", registrationData)
        .subscribe({
          next: (response: any) => {
            if (response.status) {
              console.log('Cadastro bem-sucedido!', response.message);

              const userData = {
                id: response.user?.id,
                username: registrationData.username,
                name: registrationData.name,
                email: registrationData.email,
                profile_pic: null,
                cover_pic: null,
                bio: null,
                created_at: new Date().toISOString()
              };

              localStorage.setItem('user', JSON.stringify(userData));

              this.navigateToFY();
            } else {
              console.error(response.message);
              alert(response.message);
            }
          },
          error: (error) => {
            console.error('Erro ao cadastrar:', error);
            this.emailAlreadyUsed = false;
            this.usernameAlreadyUsed = false;

            if (error.status === 409) {
              const field = error.error.field;
              if (field === 'email') {
                this.emailAlreadyUsed = true;
              } else if (field === 'username') {
                this.usernameAlreadyUsed = true;
              }
            } else {
              alert('Erro ao tentar cadastrar. Por favor, tente novamente.');
            }
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
    } else {
      console.log('Erro ao enviar formulário');
      this.isSubmitting = false;
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
