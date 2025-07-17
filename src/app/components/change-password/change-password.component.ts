import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule, Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { StepsModule } from 'primeng/steps';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuBarComponent } from '../shared/menu-bar/menu-bar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-change-password',
  providers: [MessageService],
  imports: [
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule,
    MessageModule, Message, CommonModule, NgIf, StepsModule, ProgressSpinnerModule, MenuBarComponent,
    FooterComponent
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {

  @Output() onUpdate = new EventEmitter<void>();

  items: MenuItem[] = [];
  activeStep: number = 0;
  password = '';
  confirmPassword = '';
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  passwordError = false;
  confirmPasswordError = false;
  isTokenValid: boolean = false;
  userId: string | null = null;
  token: string | null = null;
  isLoading: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.items = [{ label: '1' }, { label: '2' }];

    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId');
      this.token = params.get('token');
      this.validatePasswordResetToken();
    });
  }

  //vai verificar se o link é válido no back
  validatePasswordResetToken(): void {
    if (!this.userId || !this.token) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Link de redefinição de senha inválido ou incompleto.' });
      this.isTokenValid = false;
      this.isLoading = false;
      return;
    }

    this.http.get(`http://localhost:8085/api/verify-password-reset-token/${this.userId}/${this.token}`)
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            this.isTokenValid = true;
            this.activeStep = 0;
          } else {
            this.isTokenValid = false;
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao validar token:', error);
          this.isTokenValid = false;
          const errorMessage = error.error?.message || 'Erro ao validar o link. Pode ter expirado ou ser inválido.';
          this.isLoading = false;
        }
      });
  }

  //olho de visibilidade dos campos de senha ------------------
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  //validação para palavra-passe
  validatePassword() {
    this.passwordError = this.password.length < 8;
    this.validateConfirmPassword();
  }

  //validação para confirmação da palavra-passe
  validateConfirmPassword() {
    this.confirmPasswordError = this.password.length > 0 &&
      this.confirmPassword.length > 0 &&
      this.password !== this.confirmPassword;

    if (this.password === this.confirmPassword && this.password.length > 0) {
      this.confirmPasswordError = false;
    }
  }

  //para atualização de palavra-passe
  updatePassword() {
    this.validatePassword();
    this.validateConfirmPassword();

    if (!this.isTokenValid || this.passwordError || this.confirmPasswordError) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, corrija os erros e insira uma senha válida.' });
      return;
    }

    const resetData = {
      userId: this.userId,
      token: this.token,
      newPassword: this.password
    };

    this.http.post("http://localhost:8085/api/reset-password", resetData).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.activeStep = 1;
          this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: response.message });
          this.resetFields();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Erro ao tentar atualizar a senha. Tente novamente.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
      }
    });
  }

  //para resets nos campos
  resetFields(): void {
    this.password = '';
    this.confirmPassword = '';
    this.isPasswordVisible = false;
    this.isConfirmPasswordVisible = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
  }

  //navegações dos btns do form ----------------
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
