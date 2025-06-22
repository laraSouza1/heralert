import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiResponse } from '../../../shared/models/ApiResponse';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-users-list',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule,
    ToastModule, ConfirmDialogModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {

  currentUserId: number = 0;
  currentUserRole: number = 0;
  users: any[] = [];
  searchTerm = '';
  page = 1;
  first = 0;
  limit = 9;
  totalUsers = 0;
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    //busca dados do user no localstorage para filtração e role
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.currentUserId = parsedUser.id;
      this.currentUserRole = parsedUser.role; //busca o role atual
    }

    this.loadUsers();
  }

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  //fetch todos os users
  loadUsers(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('search', this.searchTerm)
      .set('currentUserId', this.currentUserId.toString())
      .set('limit', this.limit.toString())
      .set('offset', ((this.page - 1) * this.limit).toString());

    this.http
      .get<ApiResponse<any>>('http://localhost:8085/api/users', { params })
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.users = res.data.users;
            this.totalUsers = res.data.total;
          } else {
            this.messageService.add({ severity: 'warn', summary: res.message || 'Nenhum usuário encontrado.' });
            this.users = [];
            this.totalUsers = 0;
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erro ao carregar usuárias.' });
          this.users = [];
          this.totalUsers = 0;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  //para nome de função
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

  //handle para mudar o role de um usuário
  handleRoleChange(user: any): void {
    //previne para a ação não ser possível se o nível não for 2 (criadora)
    if (this.currentUserRole !== 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Você não tem permissão para alterar cargos de usuárias.'
      });
      return;
    }

    //vaso a criadora tente mudar o próprio role
    if (user.id === this.currentUserId) {
      this.messageService.add({
        severity: 'info',
        summary: 'Você é a criadora. Seu cargo só pode ser alterado diretamente no banco de dados.'
      });
      return;
    }

    //previne que um criador faça a ação em outro criador
    if (user.role === 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Você não pode alterar o cargo de outra criadora.'
      });
      return;
    }

    const targetRole = user.role === 1 ? 0 : 1; //se ID = 1 (admin), então passa a 0 (user); senão (ID = 0), passa a 1 (admin)
    const actionText = user.role === 1 ? 'rebaixar a' : 'promover a';
    const newRoleText = user.role === 1 ? 'usuária' : 'administradora';

    const confirmationMessage = `Tem certeza que deseja ${actionText} usuária "${user.username}" para <b>${newRoleText}</b>?`;

    this.confirmationService.confirm({
      message: confirmationMessage,
      header: 'Confirmar Alteração de Cargo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: actionText === 'rebaixar a' ? 'Rebaixar' : 'Promover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: actionText === 'rebaixar a' ? 'my-remove-button' : 'my-promove-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.http.put<ApiResponse>(`http://localhost:8085/api/users/${user.id}/role`, { newRole: targetRole, currentUserId: this.currentUserId, currentUserRole: this.currentUserRole })
          .subscribe({
            next: (res: ApiResponse) => {
              if (res.status) {
                this.messageService.add({ severity: 'success', summary: res.message });
                this.loadUsers(); //dá fetch na lista de users após sucesso
              } else {
                this.messageService.add({ severity: 'error', summary: res.message || 'Erro ao alterar cargo da usuária.' });
              }
            },
            error: (err) => {
              console.error("Erro ao alterar cargo do usuário:", err);
              this.messageService.add({ severity: 'error', summary: 'Erro interno ao alterar cargo da usuária.' });
            }
          });
      }
    });
  }

  //sempre que passar de página, vai dar load nos users
  onPageChange(event: any): void {
    this.page = Math.floor(event.first / this.limit) + 1;
    this.first = event.first;
    this.loadUsers();
  }

  //ver perfil user selecionado
  goToProfile(userId: number, username: string): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id === userId) {
      this.router.navigate(['/profile']);
      //se for o user logado no localstorage, mostra o perfil dele
    } else {
      this.router.navigate(['/profile-view', username]);
    }
  }

}
