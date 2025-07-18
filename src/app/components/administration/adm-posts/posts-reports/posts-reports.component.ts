import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TabsModule } from 'primeng/tabs';
import { StatusPostComponent } from '../status-post/status-post.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ApiResponse } from '../../../shared/models/ApiResponse';
import { TabViewModule } from 'primeng/tabview';
import { MessageModule } from 'primeng/message';
import { SeePostReportDetailComponent } from '../see-post-report-detail/see-post-report-detail.component';

@Component({
  selector: 'app-posts-reports',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule,
    TabsModule, StatusPostComponent, ToastModule, ConfirmDialogModule, DialogModule, NgFor, TabViewModule,
    MessageModule, SeePostReportDetailComponent
  ],
  templateUrl: './posts-reports.component.html',
  styleUrl: './posts-reports.component.css'
})
export class PostsReportsComponent implements OnInit {
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
  currentUser: any = null;

  @ViewChild(StatusPostComponent) statusPostComponent!: StatusPostComponent; //acesso ao componente filho

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    this.loadReports();
  }

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.page = 1;
    this.first = 0;
    this.loadReports();
  }

  //para mudança de abas
  onTabChange(event: any): void {
    this.selectedTabIndex = Number(event.index); //atualiza o índice da aba selecionada
    this.page = 1;
    this.first = 0;
    this.reports = [];
    this.totalReports = 0;
    this.loadReports();
  }

  //para fazer fetch nas denuncias de posts
  loadReports(): void {
    this.isLoading = true;
    const statusParam = this.statusMap[this.selectedTabIndex]; //obtém o status com base na aba selecionada

    this.http
      .get<ApiResponse>('http://localhost:8085/api/reports', {
        params: {
          search: this.searchTerm,
          status: statusParam,
          limit: this.limit.toString(),
          offset: ((this.page - 1) * this.limit).toString(),
        },
      })
      .subscribe({
        next: (res: ApiResponse) => {
          if (res.status) {
            this.reports = res.data.reports; //atribui as denúncias recebidos
            this.totalReports = res.data.total;
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: res.message || 'Nenhuma denúncia encontrado.',
            });
            this.reports = [];
            this.totalReports = 0;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar denúncias.',
          });
          this.reports = [];
          this.totalReports = 0;
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges(); //força a detecção de mudanças
        },
      });
  }

  getReportStatusText(status: string): string {
    //retorna o texto do estado das denúncias
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

  //para submeter a atualização de status do componente filho
  submitStatusUpdateFromChild(): void {
    this.statusPostComponent?.submitStatusUpdate();
  }

  //handle para delete do post + denúncias relacionadas
  handleDeletePost(report: any) {

    if (this.currentUser.role < 2 && report.reported_user_role >= this.currentUser.role) {
      this.messageService.add({
        severity: 'error',
        summary: 'Você não tem permissão para excluir esta postagem. Apenas a criadora pode gerenciar denúncias referentes a administradores',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a postagem "${report.post_title}"?
      <br><br>
      <br><strong>Data da denúncia:</strong> ${report.report_created_at}
      <br><strong>Usuária:</strong> ${report.reported_username}
      <br><strong>Motivo da denúncia:</strong> ${report.report_reason}
      <br><br><strong>Estado atual da denúncia:</strong> ${report.report_status}
      <br><strong>Motivo do estado:</strong> ${report.status_reason_text}
      <br><br>Isso também irá excluir todas as denuncias referentes a esse post!`,
      header: 'Excluir postagem',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //estilização dos btns do modal
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //requisição para deletar a postagem + denúncias relacionadas
        this.http.delete<ApiResponse>(`http://localhost:8085/api/posts/${report.post_id}`).subscribe({
          next: (res: ApiResponse) => {
            if (res.status) {
              this.messageService.add({ severity: 'success', summary: 'Postagem e denúncias deletadas com sucesso!' });
              this.loadReports(); //recarrega denúncias após a exclusão
            } else {
              this.messageService.add({ severity: 'error', summary: res.message || 'Erro ao deletar post.' });
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro interno ao deletar post.' });
          }
        });
      }
    });
  }

  //handle para deletar apenas uma denúncia por id
  handleDeleteReport(report: any): void {
    if (this.currentUser.role < 2 && report.reported_user_role >= this.currentUser.role) {
      this.messageService.add({
        severity: 'error',
        summary: 'Você não tem permissão para limpar esta denúncia. Apenas a criadora pode gerenciar denúncias referentes a administradores',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja limpar está denúncia referente ao post "${report.post_title}"?
      <br><br>
      <br><strong>Data da denúncia:</strong> ${report.report_created_at}
      <br><strong>Usuária:</strong> ${report.reported_username}
      <br><strong>Motivo da denúncia:</strong> ${report.report_reason}
      <br><br><strong>Estado atual da denúncia:</strong> ${report.report_status}
      <br><strong>Motivo do estado:</strong> ${report.status_reason_text}
      <br><br>Essa ação não irá excluir a postagem.`,
      header: 'Excluir Denúncia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //estilização dos btns do modal
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //envia requisição para deletar denúncia
        this.http.delete<ApiResponse>(`http://localhost:8085/api/reports/${report.report_id}`).subscribe({
          next: (res: ApiResponse) => {
            if (res.status) {
              this.messageService.add({
                severity: 'success',
                summary: res.message || 'Denúncia deletada com sucesso!'
              });
              this.loadReports(); //recarrega denúncias após a exclusão
            } else {
              this.messageService.add({
                severity: 'error',
                summary: res.message || 'Erro ao deletar denúncia.'
              });
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro interno ao deletar denúncia.' });
          }
        });
      }
    });
  }

  //para mudança de página
  onPageChange(event: any): void {
    this.page = Math.floor(event.first / this.limit) + 1; //calcula a nova página
    this.first = event.first; //atualiza o índice do primeiro item
    this.loadReports();
  }

  //para navegar a postagem
  goToPostDetail(postId: number, postTitle: string, event: MouseEvent): void {
    event.stopPropagation();
    const slugTitle = this.slugify(postTitle); //cria um "slug" do título
    const postUrl = this.router.createUrlTree([`/view-post/${postId}-${slugTitle}`]).toString(); //constrói a url do post
    window.open(postUrl, '_blank'); //abre numa nova aba
  }

  //para navegar ao perfil
  goToProfile(userId: number, username: string, event: MouseEvent): void {
    event.stopPropagation();
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString(); //constrói a url do perfil
    window.open(profileUrl, '_blank'); //abre numa nova aba
  }

  slugify(text: string): string {
    //texto para um formato de "slug" (url)
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  //para att uma denúncia
  updateReportStatus(updatedStatus: { status: string; reason: string }): void {
    if (!this.selectedReport || !updatedStatus.status) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhuma denúncia selecionada ou status inválido.',
      });
      return;
    }

    //permissão: apenas criadora pode avaliar denúncias de adms/criadora
    const reportedUserRole = this.selectedReport.reported_user_role;
    if (this.currentUser.role < 2 && reportedUserRole >= this.currentUser.role) {
      this.messageService.add({
        severity: 'error',
        summary: 'Você não tem permissão para atualizar esta denúncia. Apenas a criadora pode gerenciar denúncias referentes a administradores.',
      });
      return;
    }

    //verifica se há uma denúncia selecionado e um status válido
    if (!this.selectedReport || !updatedStatus.status) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhuma denúncia selecionada ou status inválido.',
      });
      return;
    }

    //envia requisição para atualizar o status da denúncia
    this.http
      .put<ApiResponse>(`http://localhost:8085/api/reports/${this.selectedReport.report_id}/status`, {
        status: updatedStatus.status,
        reason: updatedStatus.reason,
      })
      .subscribe({
        next: (res: ApiResponse) => {
          if (res.status) {
            this.messageService.add({
              severity: 'success',
              summary: 'Estado da denúncia atualizado com sucesso!',
            });
            this.closeStatusDialog(); //fecha  após o sucesso
            this.loadReports();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: res.message || 'Erro ao atualizar status da denúncia.',
            });
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro interno ao atualizar status da denúncia.',
          });
        },
      });
  }

  //para abrir modal de atualização de estado de denúncia
  openStatusDialog(report: any): void {
    this.selectedReport = { ...report }; //copia denúncia selecionada para o diálogo
    this.displayStatusDialog = true;
  }

  //para fechar modal
  closeStatusDialog(): void {
    this.displayStatusDialog = false;
    this.selectedReport = null;
  }

  //abre modal com detalhes de uma denúncia
  openReportDetailDialog(report: any, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'I' || target.closest('td[class="trash"]') || target.closest('td[class="pi-pencil"]')) {
      return;
    }
    this.selectedReport = report; //define denúncia selecionada para detalhes
    this.displayReportDetailDialog = true;
  }
}
