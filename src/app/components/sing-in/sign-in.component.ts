import { ChangeDetectorRef, Component } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sing-in',
  imports: [
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule,
    MessageModule, Message, CommonModule, MenuBarComponent, FooterComponent
  ],
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

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  //navegação botões login/cadastro -----------------
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  //validações do formulário ---------------------

  //validação senha + ver senha
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  validatePassword() {
    this.passwordError = this.password.length < 8;
  }

  validateConfirmPassword() {
    this.confirmPasswordError = this.password !== this.confirmPassword;
  }

  //validação email, nome e user
  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.email);
  }

  validateUsername() {
    this.usernameFormatError = !/^[A-Za-z0-9._-]+$/.test(this.username);
    this.usernameSpaceError = this.username.includes(' ');
    this.usernameLengthError = this.username.length < 3;
    this.usernameMaxLengthError = this.username.length > 15;
  }

  validateName() {
    this.nameLengthError = !this.name || this.name.trim().length < 3;
    this.nameMaxLengthError = this.name.length > 25;
  }

  //envia o form para criar novo user
  checkEmailAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.get(`http://localhost:8085/api/users/check-email?email=${encodeURIComponent(this.email)}`)
        .subscribe({
          next: (response: any) => resolve(response.exists),
          error: () => resolve(false)
        });
    });
  }

  //faz check paa ver se o username já est+a em uso
  checkUsernameAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.get(`http://localhost:8085/api/users/check-username?username=${encodeURIComponent(this.username)}`)
        .subscribe({
          next: (response: any) => resolve(response.exists),
          error: (err) => {
            console.error("Erro na verificação de username:", err);
            resolve(false);
          }
        });
    });
  }

  async onSubmit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.clearErrors();

    this.validateEmail();
    this.validateUsername();
    this.validateName();
    this.validatePassword();
    this.validateConfirmPassword();

    //executa verificações de maneira assíncrona
    const [isEmailUsed, isUsernameUsed] = await Promise.all([
      this.emailError ? false : this.checkEmailAvailability(),
      (this.usernameFormatError || this.usernameSpaceError || this.usernameLengthError || this.usernameMaxLengthError) ? false : this.checkUsernameAvailability()
    ]);

    this.emailAlreadyUsed = isEmailUsed;
    this.usernameAlreadyUsed = isUsernameUsed;

    this.cdr.detectChanges();

    //erro, cancela envio
    const hasError =
      this.emailError || this.emailAlreadyUsed ||
      this.usernameFormatError || this.usernameSpaceError ||
      this.usernameLengthError || this.usernameMaxLengthError || this.usernameAlreadyUsed ||
      this.nameLengthError || this.nameMaxLengthError ||
      this.passwordError || this.confirmPasswordError;

    if (hasError) {
      this.isSubmitting = false;
      return;
    }

    //verificações validações
    if (!this.nameLengthError && !this.nameMaxLengthError &&
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

              const userData = response.user; //data o user, incluindo id do user cadastrado
              localStorage.setItem('user', JSON.stringify(userData));

              this.navigateToFY();
            } else {
              console.error(response.message);
              alert(response.message);
            }
          },
          error: (error) => {
            console.error('Erro ao cadastrar:', error);
            alert('Erro ao tentar cadastrar. Por favor, tente novamente.');
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

  //limpar erros do form
  clearErrors() {
    this.emailError = false;
    this.usernameFormatError = false;
    this.usernameSpaceError = false;
    this.usernameLengthError = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
  }
}
