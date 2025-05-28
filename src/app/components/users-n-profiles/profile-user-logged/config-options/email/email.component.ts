import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIcon, InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message, MessageModule } from 'primeng/message';

@Component({
  selector: 'app-email',
  imports: [
    MessageModule, InputTextModule, InputIconModule, CommonModule, NgIf, IconFieldModule,
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, Message
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.css'
})
export class EmailComponent implements OnInit, OnChanges {

  @Input() user: any;
  @Output() onUpdate = new EventEmitter<string>();

  email: string = '';
  emailError: boolean = false;
  emailAlreadyUsed: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.email = this.user?.email || '';
  }

  //para mudança no user quando att email
  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.email = this.user.email;
      this.emailError = false;
      this.emailAlreadyUsed = false;
    }
  }

  // Valida o formato e dispara verificação de duplicidade
  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.email);

    if (!this.emailError && this.email !== this.user.email) {
      this.checkEmailAvailability();
    } else {
      this.emailAlreadyUsed = false; //reseta caso email seja igual ao atual
    }
  }

  // Verifica no backend se o e-mail já está em uso
  checkEmailAvailability() {
    this.http.get(`http://localhost:8085/api/users/check-email?email=${encodeURIComponent(this.email)}`)
      .subscribe({
        next: (response: any) => {
          this.emailAlreadyUsed = response.exists;
        },
        error: () => {
          this.emailAlreadyUsed = false;
        }
      });
  }

  //para update do email
  updateEmail() {
    //valida os erros
    this.validateEmail();
    if (this.emailError || this.emailAlreadyUsed) return;

    const updatedUser = { ...this.user, email: this.email };

    this.http.put(`http://localhost:8085/api/users/${this.user.id}`, updatedUser).subscribe({
      next: () => this.onUpdate.emit(this.email),
      error: () => alert('Erro ao atualizar e-mail')
    });
  }

  //fecha modal
  onCancel() {
    this.email = this.user?.email || '';
    this.onUpdate.emit();
  }
}
