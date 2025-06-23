import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

interface Report {
  report_id: number;
  report_created_at: string;
  report_reason: string;
  report_status: 'em_avaliacao' | 'nao_justificado' | 'justificado';
  status_reason_text: string | null;
  target_type: 'user' | 'post' | 'comment';
  target_id: number;
  reported_username: string;
  reported_name: string;
  post_title?: string;
  comment_text?: string;
  comment_post_id?: number;
  action_taken_message?: string;
}

@Component({
  selector: 'app-my-complaints',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, NgIf, ToastModule, MessageModule, DialogModule, ConfirmDialogModule, ButtonModule
  ],
  templateUrl: './my-complaints.component.html',
  styleUrl: './my-complaints.component.css'
})
export class MyComplaintsComponent implements OnInit {
  @Input() loggedInUserId: number | undefined;
  reports: Report[] = [];

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    //verifica se o ID do usuário logado existe antes de carregar as denúncias
    if (this.loggedInUserId) {
      this.loadMyReports(); //carrega as denúncias do usuário logado
    }
  }

  loadMyReports(): void {
    //faz uma requisição GET para buscar as denúncias do usuário pelo ID
    this.http.get<any>(`http://localhost:8085/api/reports/by-reporter/${this.loggedInUserId}`).subscribe({
      next: response => {
        //verifica se a requisição foi bem-sucedida
        if (response.status) {
          this.reports = response.data.reports; //atribui as denúncias recebidas ao array
        } else {
          this.messageService.add({ severity: 'error', summary: 'Falha ao carregar suas denúncias.' });
        }
      },
      error: error => {
        this.messageService.add({ severity: 'error', summary: 'Erro ao conectar com o servidor para carregar denúncias.' });
      }
    });
  }

  //retorna a string de exibição do tipo de denúncia
  getTypeDisplay(type: 'user' | 'post' | 'comment'): string {
    switch (type) {
      case 'user': return 'Denúncia de usuário';
      case 'post': return 'Denúncia de postagem';
      case 'comment': return 'Denúncia de comentário';
      default: return '';
    }
  }

  deleteReport(reportId: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover esta denúncia da sua lista?<br>Você não poderá depois conferir seus detalhes de atualizações!',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Deletar',
      rejectLabel: 'Cancelar',
      //estilização dos btn do diálogo
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //chama o endpoint para marcar a denúncia como deletada pelo usuário
        this.http.put<any>(`http://localhost:8085/api/reports/mark-deleted-by-reporter/${reportId}`, {}).subscribe({
          next: response => {
            //verifica se a operação foi bem-sucedida
            if (response.status) {
              //remove a denúncia do array local imediatamente
              this.reports = this.reports.filter(r => r.report_id !== reportId);
              this.messageService.add({ severity: 'success', summary: 'Denúncia removida da sua lista.' });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Falha ao remover denúncia da sua lista.' });
            }
          },
          error: error => {
            this.messageService.add({ severity: 'error', summary: 'Erro ao conectar com o servidor para remover denúncia.' });
          }
        });
      }
    });
  }

  //navega até o perfil do usuário em uma nova aba
  goToProfile(username: string): void {
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString(); //cria a URL do perfil
    window.open(profileUrl, '_blank'); //abre a URL em uma nova aba
  }
}
