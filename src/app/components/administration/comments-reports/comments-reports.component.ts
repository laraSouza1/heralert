import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ApiResponse } from '../../shared/models/ApiResponse';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { StatusCommentComponent } from '../status-comment/status-comment.component';
import { SeeCommentReportDetailComponent } from '../see-comment-report-detail/see-comment-report-detail.component';

@Component({
  selector: 'app-comments-reports',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule,
    TabsModule, ToastModule, ConfirmDialogModule, DialogModule, NgFor, TabViewModule,
    MessageModule, SeeCommentReportDetailComponent, StatusCommentComponent
  ],
  templateUrl: './comments-reports.component.html',
  styleUrl: './comments-reports.component.css'
})
export class CommentsReportsComponent implements OnInit {

  searchTerm = '';
  page = 1;
  first = 0;
  limit = 6;
  isLoading = false;
  reports: any[] = [];
  totalReports = 0;
  selectedTabIndex: number = 0;
  displayStatusDialog: boolean = false;
  displayReportDetailDialog: boolean = false;
  selectedReport: any = null;
  statusMap: string[] = ['em_avaliacao', 'nao_justificado', 'justificado'];

  @ViewChild(StatusCommentComponent) statusCommentComponent!: StatusCommentComponent;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    //carrega as denúncias ao inicializar o componente
    this.loadReports();
  }

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.page = 1;
    this.first = 0;
    this.loadReports();
  }

  //atualiza a aba selecionada e reinicia a paginação e os dados
  onTabChange(event: any): void {
    this.selectedTabIndex = Number(event.index);
    this.page = 1;
    this.first = 0;
    this.reports = [];
    this.totalReports = 0;
    this.loadReports();
  }

  //fetch nas denúncias de comentários
  loadReports(): void {
    //define o estado de carregamento como verdadeiro
    this.isLoading = true;
    //obtém o status da denúncia com base na aba selecionada
    const statusParam = this.statusMap[this.selectedTabIndex];
    //faz a requisição HTTP para buscar as denúncias
    this.http
      .get<ApiResponse>('http://localhost:8085/api/reports', {
        params: {
          search: this.searchTerm,
          status: statusParam,
          limit: this.limit.toString(),
          offset: ((this.page - 1) * this.limit).toString(),
          targetType: 'comment',
        },
      })
      .subscribe({
        next: (res: ApiResponse) => {
          //se a requisição for bem-sucedida, atualiza a lista de denúncias
          if (res.status) {
            this.reports = res.data.reports;
            this.totalReports = res.data.total;
          } else {
            //caso contrário, exibe uma mensagem de aviso e limpa os dados
            this.messageService.add({
              severity: 'warn',
              summary: res.message || 'Nenhuma denúncia de comentário encontrada.',
            });
            this.reports = [];
            this.totalReports = 0;
          }
        },
        error: (err) => {
          //em caso de erro, exibe uma mensagem de erro e limpa os dados
          console.error('Erro ao carregar denúncias de comentários:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar denúncias de comentários.',
          });
          this.reports = [];
          this.totalReports = 0;
        },
        complete: () => {
          //finaliza o estado de carregamento e detecta mudanças
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }
  //retorna o texto formatado para o status da denúncia
  getReportStatusText(status: string): string {
    switch (status) {
      case 'em_avaliacao':
        return 'Em avaliação';
      case 'nao_justificado':
        return 'Não válida';
      case 'justificado':
        return 'Válida';
      default:
        return status;
    }
  }

  //chama o método submitStatusUpdate do componente filho
  submitStatusUpdateFromChild(): void {
    this.statusCommentComponent?.submitStatusUpdate();
  }

  //handle para excluir comentário + denúncias relacionadas
  handleDeleteComment(report: any) {
    //exibe um diálogo de confirmação antes de excluir o comentário
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o comentário "${report.comment_text}"?<br>Isso também irá excluir todas as denúncias referentes a este comentário!`,
      header: 'Excluir Comentário',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //esyilização dos btns
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //faz a requisição HTTP para deletar o comentário
        this.http.delete<ApiResponse>(`http://localhost:8085/api/comments/${report.target_id}`).subscribe({
          next: (res: ApiResponse) => {
            //se a requisição for bem-sucedida, exibe mensagem de sucesso e recarrega as denúncias
            if (res.status) {
              this.messageService.add({ severity: 'success', summary: 'Comentário e denúncias deletadas com sucesso!' });
              this.loadReports();
            } else {
              //caso contrário, exibe mensagem de erro
              this.messageService.add({ severity: 'error', summary: res.message || 'Erro ao deletar comentário.' });
            }
          },
          error: (err) => {
            //em caso de erro, exibe mensagem de erro
            this.messageService.add({ severity: 'error', summary: 'Erro interno ao deletar comentário.' });
          }
        });
      }
    });
  }

  //handle para excluir denuncia não válida
  handleDeleteReport(report: any): void {
    //exibe um diálogo de confirmação antes de excluir a denúncia
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir esta denúncia referente ao comentário<br>"${report.comment_text}"?
      <br><br>
      <br><strong>Data da denúncia:</strong> ${report.report_created_at}
      <br><strong>Usuária:</strong> ${report.reported_username}
      <br><strong>Motivo da denúncia:</strong> ${report.report_reason}
      <br><br><strong>Estado atual da denúncia:</strong> ${report.report_status}
      <br><strong>Motivo do estado:</strong> ${report.status_reason_text}
      <br><br>Essa ação não irá excluir o comentário.`,
      header: 'Excluir Denúncia de Comentário',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //estilização dos btns
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //faz a requisição HTTP para deletar a denúncia
        this.http.delete<ApiResponse>(`http://localhost:8085/api/reports/${report.report_id}`).subscribe({
          next: (res: ApiResponse) => {
            //se a requisição for bem-sucedida, exibe mensagem de sucesso e recarrega as denúncias
            if (res.status) {
              this.messageService.add({
                severity: 'success',
                summary: res.message || 'Denúncia de comentário deletada com sucesso!'
              });
              this.loadReports();
            } else {
              //caso contrário, exibe mensagem de erro
              this.messageService.add({
                severity: 'error',
                summary: res.message || 'Erro ao deletar denúncia de comentário.'
              });
            }
          },
          error: (err) => {
            //em caso de erro, exibe mensagem de erro
            this.messageService.add({ severity: 'error', summary: 'Erro interno ao deletar denúncia de comentário.' });
          }
        });
      }
    });
  }

  //stualiza a página e o índice do primeiro item ao mudar de página
  onPageChange(event: any): void {
    this.page = Math.floor(event.first / this.limit) + 1;
    this.first = event.first;
    this.loadReports();
  }

  //navega até a postagem selecionada
  goToPostDetail(postId: number, postTitle: string, event: MouseEvent): void {
    //impede a propagação do evento
    event.stopPropagation();
    //gera um slug a partir do título do post
    const slugTitle = this.slugify(postTitle);
    //cria a URL para o detalhe do post e abre em uma nova aba
    const postUrl = this.router.createUrlTree([`/view-post/${postId}-${slugTitle}`]).toString();
    window.open(postUrl, '_blank');
  }

  //navega até o perfil do usuário
  goToProfile(userId: number, username: string, event: MouseEvent): void {
    //impede a propagação do evento
    event.stopPropagation();
    //cria a URL para o perfil do usuário e abre em uma nova aba
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank');
  }

  //converte o texto para um formato de slug (URL amigável)
  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  updateReportStatus(updatedStatus: { status: string; reason: string }): void {
    //verifica se uma denúncia foi selecionada e se o status é válido
    if (!this.selectedReport || !updatedStatus.status) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhuma denúncia selecionada ou status inválido.',
      });
      return;
    }

    //faz a requisição HTTP para atualizar o status da denúncia
    this.http
      .put<ApiResponse>(`http://localhost:8085/api/reports/${this.selectedReport.report_id}/status`, {
        status: updatedStatus.status,
        reason: updatedStatus.reason,
      })
      .subscribe({
        next: (res: ApiResponse) => {
          //se a requisição for bem-sucedida, exibe mensagem de sucesso, fecha o diálogo e recarrega as denúncias
          if (res.status) {
            this.messageService.add({
              severity: 'success',
              summary: 'Estado da denúncia de comentário atualizado com sucesso!',
            });
            this.closeStatusDialog();
            this.loadReports();
          } else {
            //caso contrário, exibe mensagem de erro
            this.messageService.add({
              severity: 'error',
              summary: res.message || 'Erro ao atualizar status da denúncia de comentário.',
            });
          }
        },
        error: (err) => {
          //em caso de erro, exibe mensagem de erro
          this.messageService.add({
            severity: 'error',
            summary: 'Erro interno ao atualizar status da denúncia de comentário.',
          });
        },
      });
  }

  //abre o modal para alterar o status da denúncia e seleciona a denúncia
  openStatusDialog(report: any): void {
    this.selectedReport = { ...report };
    this.displayStatusDialog = true;
  }

  //fecha o diálogo de status e limpa a denúncia selecionada
  closeStatusDialog(): void {
    this.displayStatusDialog = false;
    this.selectedReport = null;
  }

  //abre o modal de detalhes da denúncia, evitando cliques em ícones específicos
  openReportDetailDialog(report: any, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'I' || target.closest('td[class="trash"]') || target.closest('td[class="pi-pencil"]')) {
      return;
    }
    this.selectedReport = report;
    this.displayReportDetailDialog = true;
  }
}
