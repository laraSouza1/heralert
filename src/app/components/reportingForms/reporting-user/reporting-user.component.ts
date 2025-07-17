import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reporting-user',
  standalone: true,
  providers: [MessageService],
  imports: [
    ReactiveFormsModule, InputTextModule, ButtonModule, CommonModule, ToastModule, MessageModule,
    SelectModule, TextareaModule
  ],
  templateUrl: './reporting-user.component.html',
  styleUrl: './reporting-user.component.css'
})
export class ReportingUserComponent implements OnInit {

  @Input() user: any;
  formGroup: FormGroup;
  reasons: any[];
  showOtherReasonTextarea: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    //inicializa as opções de motivos para denúncia
    this.reasons = [
      { label: 'Postagens indevidas', value: 'Conteúdo indevido' },
      { label: 'Bullying/mensagens de ódio', value: 'Bullying/mensagens de ódio' },
      { label: 'Enviou chats de spam/assédio', value: 'Enviou chats de spam/assédio' },
      { label: 'Outro', value: 'Outro' }
    ];

    //inicializa o formulário com os campos 'selectedReason' e 'otherReason'
    this.formGroup = this.fb.group({
      selectedReason: ['', Validators.required],
      otherReason: ['']
    });
  }

  ngOnInit() {
    //monitora mudanças no campo 'selectedReason'
    this.formGroup.get('selectedReason')?.valueChanges.subscribe((value: any) => {
      //determina o valor selecionado
      const selectedValue = typeof value === 'string' ? value : value?.value;

      //define se o campo de texto para 'outro' motivo deve ser exibido
      this.showOtherReasonTextarea = selectedValue === 'Outro';

      //obtém o controle do campo 'otherReason'
      const otherReasonControl = this.formGroup.get('otherReason');
      if (this.showOtherReasonTextarea) {
        //adiciona validadores se 'outro' motivo for selecionado
        otherReasonControl?.setValidators([Validators.required, Validators.maxLength(360)]);
      } else {
        //remove validadores e limpa o valor se 'outro' motivo não for selecionado
        otherReasonControl?.clearValidators();
        otherReasonControl?.setValue('');
      }
      //atualiza a validação do campo 'otherReason'
      otherReasonControl?.updateValueAndValidity();
    });
  }

  //envia a denúncia de usuário
  submitReport() {

    //verifica se o formulário é válido e se o user existe
    if (this.formGroup.valid && this.user) {
      //define o motivo da denúncia
      const selectedReason = this.formGroup.value.selectedReason;
      const reason = this.showOtherReasonTextarea
        ? this.formGroup.value.otherReason
        : (typeof selectedReason === 'object' ? selectedReason.value : selectedReason);

      //obtém o usuário logado do localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      //verifica se o usuário está autenticado
      if (!currentUser || !currentUser.id) {
        return;
      }

      //prepara os dados da denúncia
      const reportData = {
        reporter_id: currentUser.id,
        reported_user_id: this.user.id,
        target_type: 'user',
        target_id: this.user.id,
        reason: reason
      };

      //envia a denúncia para a API
      this.http.post('http://localhost:8085/api/reports', reportData).subscribe({
        //verifica o status da resposta da API
        next: (response: any) => {
          if (response.status) {
            //exibe mensagem de sucesso e reinicia o formulário
            this.messageService.add({ severity: 'success', summary: 'Denúncia enviada com sucesso!' });
            this.formGroup.reset();
            this.showOtherReasonTextarea = false;
            this.formGroup.get('selectedReason')?.setValue('');
          } else {
            this.messageService.add({ severity: 'error', summary: response.message || 'Erro ao enviar denúncia.' });
          }
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Erro de conexão ao enviar denúncia.' });
        }
      });
    } else {
      //marca todos os campos do formulário como 'touched' para exibir erros de validação
      this.formGroup.markAllAsTouched();
    }
  }

  //navega para o perfil de um usuário
  goToProfile(userId: number, username: string): void {
    //constrói a URL completa para navegar para o perfil
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    //abre a URL em uma nova aba
    window.open(profileUrl, '_blank');
  }

}
