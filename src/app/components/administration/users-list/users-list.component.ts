import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-users-list',
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent {

  currentUserId: number = 0;
  users: any[] = [];
  searchTerm = '';
  page = 1;
  first = 0;
  limit = 9;
  totalUsers = 0;
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {

    //busca dados do user no localstorage para filtração
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserId = JSON.parse(storedUser).id;
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
    this.http
      .get<any>('http://localhost:8085/api/users', {
        params: {
          search: this.searchTerm,
          currentUserId: this.currentUserId.toString(),
          limit: this.limit.toString(),
          offset: (this.page - 1) * this.limit,
        },
      })
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.users = res.data.users;
            this.totalUsers = res.data.total;
          }
        },
        error: (err) => {
          console.error('Erro ao carregar usuárias:', err);
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
