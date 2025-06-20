import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { SeeUserReportComponent } from '../see-user-report/see-user-report.component';
import { StatusUserComponent } from '../status-user/status-user.component';
import { ApiResponse } from '../../shared/models/ApiResponse';

@Component({
  selector: 'app-users-reports',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule,
    TabsModule, ToastModule, ConfirmDialogModule, DialogModule, NgFor, TabViewModule,
    MessageModule, SeeUserReportComponent, StatusUserComponent
  ],
  templateUrl: './users-reports.component.html',
  styleUrl: './users-reports.component.css'
})
export class UsersReportsComponent implements OnInit {
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

  @ViewChild(StatusUserComponent) statusUserComponent!: StatusUserComponent; //acesso ao componente filho

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReports(); //carrega as denúncias
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

  //para fazer fetch nas denuncias de usuarias
  loadReports(): void {
    this.isLoading = true;
    const statusParam = this.statusMap[this.selectedTabIndex]; //obtém o status com base na aba selecionada

    let params = new HttpParams()
      .set('search', this.searchTerm)
      .set('status', statusParam)
      .set('limit', this.limit.toString())
      .set('offset', ((this.page - 1) * this.limit).toString());

    this.http.get<ApiResponse>('http://localhost:8085/api/user-reports', { params })
      .subscribe({
        next: (res: ApiResponse) => {
          if (res.status) {
            this.reports = res.data.reports; //atribui as denúncias recebidos
            this.totalReports = res.data.total;
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: res.message || 'Nenhuma denúncia de usuário encontrada.',
            });
            this.reports = [];
            this.totalReports = 0;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar denúncias de usuários.',
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

  //converte role em texto
  getRoleName(role: number): string {
    switch (role) {
      case 2:
        return 'Criadora';
      case 1:
        return 'Administradora';
      case 0:
        return 'Usuária';
      default:
        return 'Desconhecido';
    }
  }

  //para submeter a atualização de status do componente filho
  submitStatusUpdateFromChild(): void {
    if (this.statusUserComponent) {
      this.statusUserComponent.submitStatusUpdate();
    }
  }

  //handle para deletar apenas uma denúncia por id
  handleDeleteReport(report: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir esta denúncia referente ao usuário<br>"${report.reported_username}"?`,
      header: 'Excluir Denúncia de Usuário',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //estilização dos btn
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //envia requisição para deletar denúncia
        this.http.delete<ApiResponse>(`http://localhost:8085/api/reports/${report.report_id}`).subscribe({
          next: (res: ApiResponse) => {
            if (res.status) {
              this.messageService.add({
                severity: 'success',
                summary: res.message || 'Denúncia de usuário deletada com sucesso!'
              });
              this.loadReports(); //recarrega a lista
            } else {
              this.messageService.add({
                severity: 'error',
                summary: res.message || 'Erro ao deletar denúncia de usuário.'
              });
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro interno ao deletar denúncia de usuário.' });
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

  //para att uma denúncia
  updateReportStatus(updatedStatus: { status: string; reason: string }): void {
    //verifica se há uma denúncia selecionado e um status válido
    if (!this.selectedReport || !updatedStatus.status) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhuma denúncia selecionada ou status inválido.',
      });
      return;
    }

    //envia requisição para atualizar o status da denúncia
    this.http.put<ApiResponse>(`http://localhost:8085/api/user-reports/${this.selectedReport.report_id}/status`, {
      status: updatedStatus.status,
      reason: updatedStatus.reason,
    }).subscribe({
      next: (res: ApiResponse) => {
        if (res.status) {
          this.messageService.add({
            severity: 'success',
            summary: 'Estado da denúncia de usuário atualizado com sucesso!',
          });
          this.closeStatusDialog(); //fecha  após o sucesso
          this.loadReports(); //recarrega a lista
        } else {
          this.messageService.add({
            severity: 'error',
            summary: res.message || 'Erro ao atualizar status da denúncia de usuário.',
          });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro interno ao atualizar status da denúncia de usuário.',
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
    if (target.tagName === 'I' || target.closest('td[class*="trash"]') || target.closest('td[class*="pi-pencil"]')) {
      return;
    }
    this.selectedReport = report; //define denúncia selecionada para detalhes
    this.displayReportDetailDialog = true;
  }

  //para navegar a postagem
  goToPostDetail(postId: number, postTitle: string, event: MouseEvent): void {
    event.stopPropagation();
    const slugTitle = this.slugify(postTitle); //cria um "slug" do título
    const postUrl = this.router.createUrlTree([`/view-post/${postId}-${slugTitle}`]).toString(); //constrói a url do post
    window.open(postUrl, '_blank'); //abre numa nova aba
  }

  //navega para o perfil numa nova aba
  goToProfile(userId: number, username: string, event: MouseEvent): void {
    event.stopPropagation();
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
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

}
