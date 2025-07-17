import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiResponse } from '../../../shared/models/ApiResponse';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { UserToBanDetailComponent } from '../user-to-ban-detail/user-to-ban-detail.component';
import { MessageModule } from 'primeng/message';

interface UsersToBanData {
  users: any[];
  total: number;
}

@Component({
  selector: 'app-users-to-ban-list',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule,
    ToastModule, ConfirmDialogModule, DialogModule, UserToBanDetailComponent, MessageModule
  ],
  templateUrl: './users-to-ban-list.component.html',
  styleUrl: './users-to-ban-list.component.css'
})
export class UsersToBanListComponent implements OnInit {

  isLoading = false;
  usersToBan: any[] = [];
  totalUsers = 0;
  page = 1;
  first = 0;
  limit = 9;
  searchTerm: string = '';
  displayUserDetailDialog: boolean = false;
  selectedUserForDetail: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadUsersToBan(); //carrega users a banir
  }

  //para fazer fetch de usuárias a banir (com 3 ou mais denúncias válidas)
  loadUsersToBan(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('limit', this.limit.toString())
      .set('offset', ((this.page - 1) * this.limit).toString());

    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }
    this.http.get<ApiResponse<UsersToBanData>>('http://localhost:8085/api/users-to-ban', { params })
      .subscribe({
        next: (res: ApiResponse<UsersToBanData>) => {
          if (res.status) {
            this.usersToBan = res.data.users;
            this.totalUsers = res.data.total;
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: res.message || 'Nenhuma usuária com 3 ou mais denúncias válidas encontrada.',
            });
            this.usersToBan = [];
            this.totalUsers = 0;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar usuários para banir.',
          });
          this.usersToBan = [];
          this.totalUsers = 0;
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
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

  //handle para banir user
  handleBanUser(userToBan: any): void {
    const currentUserRole = this.getCurrentUserRole();
    const currentUserId = this.getCurrentUserId();

    //previne auto-banimento caso o ID do user atual seja o mesmo para o ban imento
    if (currentUserId === userToBan.user_id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Você não pode banir sua própria conta.',
      });
      return;
    }

    //sistema de banimento para adms: nível 1 (adm) podem apenas banir users nível 0 (usuárias).
    //nível 2 pode banir todos os tipos de user
    if (currentUserRole <= userToBan.role) {
      let message = '';
      if (currentUserRole === 1 && userToBan.role === 1) {
        message = `Como administradora, você não pode banir outras administradoras.`;
      } else if (currentUserRole === 1 && userToBan.role === 2) {
        message = `Como administradora, você não pode banir a criadora.`;
      } else if (currentUserRole === 0) {
        message = `Como usuária, você não tem permissão para banir outras usuárias.`;
      } else {
        message = `Você não tem permissão para banir esta usuária devido ao seu nível de privilégio.`;
      }

      this.messageService.add({
        severity: 'warn',
        summary: message,
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja banir a usuária "${userToBan.username}"?<br><b><i>Esta ação é irreversível e excluirá todos os seus dados e conteúdo.</i></b>
        <br><br>Antes de banir, na tabela clique em "Nº Denúncias Válidas" na<br>linha da usuária para conferir todas as denúncias válidas dessa usuária.`,
      header: 'Banir Usuária',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Banir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.http.put<ApiResponse>(`http://localhost:8085/api/users/${userToBan.user_id}/ban`, { currentUserRole: currentUserRole, currentUserId: currentUserId }) //para o user ID atual para o back
          .subscribe({
            next: (res: ApiResponse) => {
              if (res.status) {
                this.messageService.add({ severity: 'success', summary: res.message });
                this.loadUsersToBan(); //recarrega a lista após o banimento
              } else {
                this.messageService.add({ severity: 'error', summary: res.message || 'Erro ao banir usuária.' });
              }
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Erro interno ao banir usuária.' });
            }
          });
      }
    });
  }

  //busca o role do user atual pelo localstorage
  private getCurrentUserRole(): number {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.role || 0;
    }
    return 0;
  }

  //para pegar o ID user atual do localstorage
  private getCurrentUserId(): number | null {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.id || null;
    }
    return null;
  }

  //para mudança de página
  onPageChange(event: any): void {
    this.page = Math.floor(event.first / this.limit) + 1; //calcula a nova página
    this.first = event.first; //atualiza o índice do primeiro item
    this.loadUsersToBan();
  }

  //navega para o perfil numa nova aba
  goToProfile(userId: number, username: string, event: MouseEvent): void {
    event.stopPropagation();
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank'); //abre numa nova aba
  }

  //abre modal com detalhes de uma denúncia
  openUserDetailDialog(user: any, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'I' || target.closest('button')) {
      return;
    }
    this.selectedUserForDetail = user; //define denúncia selecionada para detalhes
    this.displayUserDetailDialog = true;
  }

  //para fechar modal
  closeUserDetailDialog(): void {
    this.displayUserDetailDialog = false;
    this.selectedUserForDetail = null;
  }

  //pesquisa
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value.trim();
    this.page = 1;
    this.first = 0;
    this.loadUsersToBan();
  }
}
