import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FollowButtonComponent } from '../../shared/follow-button/follow-button.component';

export interface User {
  id: number;
  role: number;
  username: string;
  name: string;
  profile_pic?: string;
}

@Component({
  selector: 'app-following-user-view',
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule,
    FollowButtonComponent
  ],
  templateUrl: './following-user-view.component.html',
  styleUrl: './following-user-view.component.css'
})
export class FollowingUserViewComponent implements OnChanges {

  @Input() userId: number | null = null;
  users: User[] = [];
  searchTerm = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnChanges(): void {
    if (this.userId !== null) {
      this.loadUsers();
    }
  }  

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  //fetch de usuários que o user visualizado segue
  loadUsers(): void {
    this.http.get<any>(`http://localhost:8085/api/follows/following-users/${this.userId}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.users = (res.data as User[]).filter(user =>
            user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
        }
      },
      error: (err) => console.error('Erro ao carregar seguindo:', err)
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