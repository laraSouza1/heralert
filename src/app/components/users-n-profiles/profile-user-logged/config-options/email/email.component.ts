import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIcon, InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message, MessageModule } from 'primeng/message';
import { StepsModule } from 'primeng/steps';
import { ConfirmationEmailComponent } from '../../../../shared/confirmation-email/confirmation-email.component';
import { Toast, ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-email',
  providers: [MessageService],
  imports: [
    MessageModule, InputTextModule, InputIconModule, CommonModule, NgIf, IconFieldModule,
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, Message, StepsModule,
    ConfirmationEmailComponent, ToastModule, MessageModule
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.css'
})
export class EmailComponent implements OnInit, OnChanges {

  @Input() user: any;
  @Output() onUpdate = new EventEmitter<string>();
  @ViewChild('confirmationEmailComponent') confirmationEmailComponent!: ConfirmationEmailComponent;

  items: MenuItem[] = [];
  activeStep: number = 0;
  email: string = '';
  emailError: boolean = false;
  emailAlreadyUsed: boolean = false;
  newEmailToVerify: string | null = null;
  isSubmitting: boolean = false;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.email = this.user?.email || '';
    this.items = [{ label: '1' }, { label: '2' }];
  }

  //para mudança no user quando att email
  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.email = this.user.email;
      this.emailError = false;
      this.emailAlreadyUsed = false;
      this.activeStep = 0;
    }
  }

  //valida o formato
  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.email);

    if (!this.emailError && this.email !== this.user.email) {
      this.checkEmailAvailability();
    } else {
      this.emailAlreadyUsed = false; //reseta caso email seja igual ao atual
    }
  }

  //verifica no backend se o e-mail já está em uso
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

  //handle para o btn "Próximo" do step 1
  initiateEmailUpdateVerification() {
    //valida os erros
    this.validateEmail();
    if (this.emailError || this.emailAlreadyUsed || this.email === this.user.email) {
      if (this.email === this.user.email) {
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'O novo e-mail é igual ao e-mail atual.' });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, corrija os erros no e-mail.' });
      }
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    //vai inicializar a requisição de verificação de email no backend
    this.http.post("http://localhost:8085/api/initiate-email-update-verification", { userId: this.user.id, newEmail: this.email })
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            this.newEmailToVerify = this.email;
            this.activeStep = 1; //vai para o step de verificação
            this.messageService.add({ severity: 'info', summary: 'Código enviado!' });
            this.cdr.detectChanges();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
        },
        error: (error) => {
          console.error('Erro ao iniciar verificação de e-mail:', error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao tentar enviar código de verificação. Por favor, tente novamente.' });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  //handle para quando o user submete o código de verificação
  onSubmitVerification(verificationCode: string) {
    if (!this.newEmailToVerify || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.http.post("http://localhost:8085/api/complete-email-update-verification", { userId: this.user.id, email: this.newEmailToVerify, code: verificationCode })
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            this.messageService.add({ severity: 'success', summary: 'E-mail atualizado!', detail: 'Seu e-mail foi atualizado com sucesso.' });
            localStorage.setItem('user', JSON.stringify(response.user)); //atualiza local storage
            this.onUpdate.emit(response.user.email); //emite o email atualizado
            this.onCancel(); //reseta o componente depois de atualização ser feita
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
        },
        error: (error) => {
          console.error('Erro ao verificar código ou atualizar e-mail:', error);
          const errorMessage = error.error?.message || 'Erro ao verificar código. Por favor, tente novamente.';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  //para voltar ao step anterior
  goToPreviousStep() {
    this.activeStep = 0;
    this.emailError = false;
    this.emailAlreadyUsed = false;
    this.cdr.detectChanges();
  }

  //para reenviar um novo código
  resendVerificationCode() {
    if (!this.newEmailToVerify || this.isSubmitting) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Não foi possível reenviar o código. Tente novamente.' });
      return;
    }

    this.isSubmitting = true;

    this.http.post("http://localhost:8085/api/initiate-email-update-verification", { userId: this.user.id, newEmail: this.newEmailToVerify })
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            this.messageService.add({ severity: 'info', summary: 'Novo código enviado!' });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
        },
        error: (error) => {
          console.error('Erro ao reenviar código de verificação:', error);
          this.messageService.add({ severity: 'error', summary: 'Erro de Rede', detail: 'Erro ao reenviar o código. Verifique sua conexão.' });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  onCancel() {
    this.email = this.user?.email || '';
    this.emailError = false;
    this.emailAlreadyUsed = false;
    this.activeStep = 0;
    this.newEmailToVerify = null;
    this.onUpdate.emit();
  }
}
