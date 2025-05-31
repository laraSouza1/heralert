import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-confirmation-email',
  providers: [MessageService],
  imports: [ButtonModule, InputOtpModule, CommonModule, FormsModule, MessageModule],
  templateUrl: './confirmation-email.component.html',
  styleUrl: './confirmation-email.component.css'
})
export class ConfirmationEmailComponent {

  @Input() email: string | null = null;
  @Output() submitVerification = new EventEmitter<string>();
  @Output() goBack = new EventEmitter<void>();
  @Output() resendCode = new EventEmitter<void>();

  verificationCode: string = '';

  constructor(private messageService: MessageService) { }

  //verificação do código
  onSubmitCode() {
    if (this.verificationCode && this.verificationCode.length === 6) {
      this.submitVerification.emit(this.verificationCode);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Insira um código de verificação válido de 6 dígitos'});
    }
  }

  //vaii voltar ao step anterior
  onGoBackClick() {
    this.goBack.emit();
  }

  //para reenviar um novo código
  onResendCodeClick() {
    this.resendCode.emit();
  }
}
