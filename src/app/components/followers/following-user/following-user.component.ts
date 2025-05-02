import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FollowButtonComponent } from '../../shared/follow-button/follow-button.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FollowersUserComponent } from '../followers-user/followers-user.component';

export interface User {
  id: number;
  username: string;
  name: string;
  profile_pic?: string;
}

@Component({
  selector: 'app-following-user',
  imports: [
    IconFieldModule, InputIconModule, InputTextModule,
    TableModule, CommonModule, ButtonModule, FollowButtonComponent
  ],
  templateUrl: './following-user.component.html',
  styleUrl: './following-user.component.css'
})
export class FollowingUserComponent implements OnInit {

  @ViewChild('followingUser') followingUserComponent!: FollowingUserComponent;
  @ViewChild('followersUser') followersUserComponent!: FollowersUserComponent;

  users: User[] = [];
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  //fetch todos os users
  loadUsers(): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.http.get<any>(`http://localhost:8085/api/follows/following-users/${currentUser.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.users = (res.data as User[]).filter((user: User) =>
            user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
        }
      },
      error: (err) => {
        console.error('Erro ao carregar usuários seguindo:', err);
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