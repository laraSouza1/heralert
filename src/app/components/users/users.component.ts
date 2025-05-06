import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { FollowButtonComponent } from '../shared/follow-button/follow-button.component';

@Component({
  selector: 'app-users',
  imports: [
    IconFieldModule, InputIconModule, InputTextModule,
    TableModule, CommonModule, ButtonModule, FollowButtonComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  currentUserId: number = 0;
  users: any[] = [];
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    //pega dados do user no localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.loadUsers();
    }
  }

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  //fetch todos os users
  loadUsers(): void {
    this.http.get<any>('http://localhost:8085/api/users', {
      params: {
        search: this.searchTerm,
        currentUserId: this.currentUserId.toString()
      }
    }).subscribe({
      next: (res) => {
        if (res.status) {
          this.users = res.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
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
