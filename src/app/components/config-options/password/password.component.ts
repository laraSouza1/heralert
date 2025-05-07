import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule, Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MenuBarComponent } from '../../shared/menu-bar/menu-bar.component';

@Component({
  selector: 'app-password',
  imports: [
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule,
    MessageModule, Message, CommonModule, NgIf
  ],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css'
})
export class PasswordComponent implements OnInit, OnChanges {

  @Input() user: any;
  @Output() onUpdate = new EventEmitter<void>();

  password = '';
  confirmPassword = '';
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  passwordError = false;
  confirmPasswordError = false;
  passwordMasked = '';
  isCurrentPasswordVisible = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    //pega dados do user do localstorage
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.passwordMasked = '*'.repeat(this.user.password?.length || 0); //pega palavra-passe e transforma a length em *
  }

  //para mudança no user quando att palavra-passe
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.resetFields(); //reseta campos
    }
  }

  //olho de visibilidade dos campos de senha
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  //validação para palavra-passe
  validatePassword() {
    this.passwordError = this.password.length < 8;
  }

  //validação para confirmação da palavra-passe
  validateConfirmPassword() {
    this.confirmPasswordError = this.password !== this.confirmPassword;
  }

  //para atualização de palavra-passe
  updatePassword() {

    this.validatePassword();
    this.validateConfirmPassword();
    if (this.passwordError || this.confirmPasswordError) return;

    const updatedUser = { ...this.user, password: this.password };

    this.http.put(`http://localhost:8085/api/users/${this.user.id}`, updatedUser).subscribe({
      next: () => {
        //atualiza localstorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
        this.passwordMasked = '*'.repeat(this.password.length);
        this.onUpdate.emit();
      },
      error: () => alert('Erro ao atualizar palavra-passe')
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
    this.isCurrentPasswordVisible = false;
  }

}
