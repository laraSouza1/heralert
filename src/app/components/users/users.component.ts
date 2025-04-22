import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
    CommonModule,
    ButtonModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: any[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  //ver perfil user selecionado
  goToProfile(userId: number, username: string): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id === userId) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/profile-view', username]);
    }
  }

  //puxa todos os users
  loadUsers(): void {
    this.http.get<any>('http://localhost:8085/api/users').subscribe({
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
}
