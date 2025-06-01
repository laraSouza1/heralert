import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { Message } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StepsModule } from 'primeng/steps';
import { MessageService } from 'primeng/api';
import { Toast, ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-form-signin',
  providers: [MessageService],
  imports: [
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule,
    MessageModule, Message, CommonModule, StepsModule, ToastModule
  ],
  templateUrl: './form-signin.component.html',
  styleUrl: './form-signin.component.css'
})
export class FormSigninComponent {

  @Output() formValid = new EventEmitter<boolean>();
  @Output() formDataReady = new EventEmitter<any>();

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
  emailAlreadyUsed: boolean = false;
  usernameAlreadyUsed: boolean = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  //-------------------- VALIDAÇÕES DO FORMULÁRIO ---------------------

  //validação senha + ver senha---------------------
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  validatePassword() {
    this.passwordError = this.password.length < 8;
    this.onValidationChange();
  }

  validateConfirmPassword() {
    this.confirmPasswordError = this.password !== this.confirmPassword;
    this.onValidationChange();
  }

  //validação email, nome e user ------------------------
  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.email);
    this.onValidationChange();
  }

  validateUsername() {
    this.usernameFormatError = !/^[A-Za-z0-9._-]+$/.test(this.username);
    this.usernameSpaceError = this.username.includes(' ');
    this.usernameLengthError = this.username.length < 3;
    this.usernameMaxLengthError = this.username.length > 15;
    this.onValidationChange();
  }

  validateName() {
    this.nameLengthError = !this.name || this.name.trim().length < 3;
    this.nameMaxLengthError = this.name.length > 25;
    this.onValidationChange();
  }

  //validações de email/username em uso -----------------

  //verifica email em uso no back
  checkEmailAvailability(): Promise<boolean> {
    if (!this.email || this.emailError) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      this.http.get(`http://localhost:8085/api/users/check-email?email=${encodeURIComponent(this.email)}`)
        .subscribe({
          next: (response: any) => resolve(response.exists),
          error: () => resolve(false)
        });
    });
  }

  //verifica username em uso no back
  checkUsernameAvailability(): Promise<boolean> {
    if (!this.username || this.usernameFormatError || this.usernameSpaceError || this.usernameLengthError || this.usernameMaxLengthError) {
      return Promise.resolve(false);
    }
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

  async onValidationChange() {
    this.clearAvailabilityErrors();

    //executa verificações de maneira assíncrona
    const [isEmailUsed, isUsernameUsed] = await Promise.all([
      this.emailError ? false : this.checkEmailAvailability(),
      (this.usernameFormatError || this.usernameSpaceError || this.usernameLengthError || this.usernameMaxLengthError) ? false : this.checkUsernameAvailability()
    ]);

    this.emailAlreadyUsed = isEmailUsed;
    this.usernameAlreadyUsed = isUsernameUsed;

    this.cdr.detectChanges(); //garante que a UI seja atualizada com os novos erros de disponibilidade

    // erro, cancela envio
    const hasError =
      this.emailError || this.emailAlreadyUsed ||
      this.usernameFormatError || this.usernameSpaceError ||
      this.usernameLengthError || this.usernameMaxLengthError || this.usernameAlreadyUsed ||
      this.nameLengthError || this.nameMaxLengthError ||
      this.passwordError || this.confirmPasswordError ||
      !this.email || !this.name || !this.username || !this.password || !this.confirmPassword; //verifica se os campos estão preenchidos

    this.formValid.emit(!hasError); //emite true se NÃO houver erros
  }


  clearAvailabilityErrors() {
    this.emailAlreadyUsed = false;
    this.usernameAlreadyUsed = false;
  }

  //vai emitir os dados do formulário se eles forem validos
  async emitFormDataIfValid() {
    //garante que todas as validações (incluindo as assíncronas) sejam executadas antes de emitir
    await this.onValidationChange();

    //re-avalia a validade baseada nos estados ATUAIS de erro
    const isFormCurrentlyValid = !(
      this.emailError || this.emailAlreadyUsed ||
      this.usernameFormatError || this.usernameSpaceError ||
      this.usernameLengthError || this.usernameMaxLengthError || this.usernameAlreadyUsed ||
      this.nameLengthError || this.nameMaxLengthError ||
      this.passwordError || this.confirmPasswordError ||
      !this.email || !this.name || !this.username || !this.password || !this.confirmPassword //verifica se os campos estão preenchidos
    );

    if (isFormCurrentlyValid) {
      const data = {
        name: this.name,
        email: this.email,
        username: this.username,
        password: this.password
      };
      this.formDataReady.emit(data);
    } else {
      console.log('Formulário inválido, não emitindo dados.');
      this.messageService.add({ severity: 'warn', summary: 'Preencha todos os campos!' });
    }
    this.formValid.emit(isFormCurrentlyValid); //garante que o SingInComponent tenha o status mais recente
  }
}
