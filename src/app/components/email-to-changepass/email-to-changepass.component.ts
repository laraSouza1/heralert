import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule, Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { StepsModule } from 'primeng/steps';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MenuBarComponent } from '../shared/menu-bar/menu-bar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-email-to-changepass',
  providers: [MessageService],
  imports: [
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule,
    MessageModule, Message, CommonModule, NgIf, StepsModule, ToastModule, MessageModule,
    MenuBarComponent, FooterComponent
  ],
  templateUrl: './email-to-changepass.component.html',
  styleUrl: './email-to-changepass.component.css'
})
export class EmailToChangepassComponent implements OnInit {

  items: MenuItem[] = [];
  activeStep: number = 0;
  email: string = '';
  emailError: boolean = false;
  backendError: string | null = null;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.items = [{ label: '1' }, { label: '2' }];
  }

  //para validar o email inserido
  validateEmail(): void {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.email);
    this.backendError = null;
  }

  //para enviar um link para mudança de palavra-passe
  sendResetEmail(): void {
    this.validateEmail();
    if (this.emailError) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, insira um e-mail válido.' });
      return;
    }

    this.http.post("http://localhost:8085/api/password-reset-request", { email: this.email })
      .subscribe({
        next: (response: any) => {
          if (response.status) {
            this.activeStep = 1; //vai para o step 2 sse estiver certo
            this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: response.message });
          } else {
            this.backendError = response.message;
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: response.message });
          }
        },
        error: (error) => {
          console.error('Erro ao solicitar reset de senha:', error);
          this.backendError = error.error?.message || 'Erro ao tentar solicitar a recuperação de senha. Tente novamente.';
          this.messageService.add({ severity: 'error', summary: 'Erro' });
        }
      });
  }

  //para navegar ao login
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}

