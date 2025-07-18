import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MenuBarComponent } from '../../shared/menu-bar/menu-bar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { StepsModule } from 'primeng/steps';
import { MenuItem, MessageService } from 'primeng/api';
import { ConfirmationEmailComponent } from '../../shared/confirmation-email/confirmation-email.component';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { FormSigninComponent } from '../form-signin/form-signin.component';

@Component({
  selector: 'app-sing-in',
  providers: [MessageService],
  imports: [
  CommonModule, ButtonModule, StepsModule, MenuBarComponent, FooterComponent,
  ConfirmationEmailComponent, FormSigninComponent, MessageModule, ToastModule
],
  templateUrl: './sing-in.component.html',
  styleUrls: ['./sing-in.component.css']
})
export class SingInComponent implements OnInit {

  @ViewChild('formSignin') formSignin!: FormSigninComponent;
  @ViewChild('confirmationEmail') confirmationEmail!: ConfirmationEmailComponent;

  items: MenuItem[] = [];
  activeStep: number = 0;
  isStepValid: boolean = false;
  formData: any = null;
  isSubmitting: boolean = false;
  userEmailToVerify: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  ngOnInit() {

    //items do step
    this.items = [
      { label: '1' }, //step dados da conta
      { label: '2' } //step verificação de código + cadastro
    ];
  }

  handleFormValidity(valid: boolean) {
    this.isStepValid = valid;
  }

  //é chamado FormSigninComponent emite dados do form validos
  //envia o email com o código
  receiveFormData(data: any) {
    this.formData = data;
    if (this.isStepValid) {
      this.initiateRegistrationAndSendEmail();
    }
  }

  //vai para o próximo step
  goToNextStep() {
    if (this.activeStep === 0) {
      if (this.formSignin) {
        this.formSignin.emitFormDataIfValid();
      }
    }
  }

  //volta para o step 1
  goToPreviousStep() {
    this.activeStep--;
    this.isStepValid = true; //assume que os dados preenchidos no form anteriormente são válidos ao voltar
  }

  //navegações -----------------------------------
  //navega para o login
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  //navega para o for you page
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  //vai inicializar o cadastro (sem que vá para a bd) e envia o email
  async initiateRegistrationAndSendEmail() {
  if (this.isSubmitting || !this.formData) {
    return;
  }

  this.isSubmitting = true;

  //inicia cadasttro e envia email
  this.http.post("http://localhost:8085/api/initiate-registration", this.formData)
    .subscribe({
      next: (response: any) => {
        if (response.status) {
          this.userEmailToVerify = response.email; //pega o email inserido no form para enviar o cod
          this.activeStep = 1;
          this.cdr.detectChanges();
          this.messageService.add({ severity: 'info', summary: 'Código enviado para seu e-mail!'});
        } else {
          console.error(response.message);
          //trata mensagem de email banido
          if (response.field === 'email' && response.message.includes('banida')) {
            this.messageService.add({
              severity: 'error',
              summary: 'Registro Negado',
              detail: response.message,
              life: 5000
            });
            this.formSignin.email = '';
            this.formSignin.emailBannedError = true;
            this.formSignin.onValidationChange();
            this.activeStep = 0; //garante que volta para o primeiro passo
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erro ao tentar iniciar cadastro' });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
}

  //quando enviar o codigo
  async onSubmitVerification(verificationCode: string) {
    if (!this.userEmailToVerify || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    //vai verificar o codigo e, caso esteja correto, cria o novo user
    this.http.post("http://localhost:8085/api/verify-email-code", { email: this.userEmailToVerify, code: verificationCode })
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            const userData = response.user;
            localStorage.setItem('user', JSON.stringify(userData));
            this.messageService.add({ severity: 'success', summary: 'Conta criada com sucesso!'});
            setTimeout(() => this.router.navigate(['/for-you']), 1000);
          } else {
            console.error(response.message);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Erro ao verificar código. Por favor, tente novamente.';
          this.messageService.add({ severity: 'error', summary: 'Erro ao verificar código. Por favor, tente novamente.'});
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  //para reenviar o código
  resendVerificationEmail() {
    if (!this.formData || !this.formData.email || this.isSubmitting) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Não foi possível reenviar o código. Tente novamente.' });
      return;
    }
    this.isSubmitting = true;
    this.http.post("http://localhost:8085/api/initiate-registration", this.formData) //vai re-usar a inicialização de cadastro
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            this.messageService.add({ severity: 'info', summary: 'Novo código enviado!'});
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro ao reenviar o código'});
          }
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Erro de Rede ao reenviar o código.' });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }
}
