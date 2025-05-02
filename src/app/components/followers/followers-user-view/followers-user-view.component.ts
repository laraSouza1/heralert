import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FollowButtonComponent } from '../../shared/follow-button/follow-button.component';

export interface User {
  id: number;
  username: string;
  name: string;
  profile_pic?: string;
}

@Component({
  selector: 'app-followers-user-view',
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule,
    FollowButtonComponent
  ],
  templateUrl: './followers-user-view.component.html',
  styleUrl: './followers-user-view.component.css'
})

export class FollowersUserViewComponent implements OnChanges {

  @Input() userId: number | null = null;
  users: User[] = [];
  searchTerm = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && this.userId !== null) {
      this.loadUsers();
    }
  }  

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  //fetch nos seguidores do user visualizado
  loadUsers(): void {
    this.http.get<any>(`http://localhost:8085/api/follows/followers-users/${this.userId}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.users = (res.data as User[]).filter(user =>
            user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
        }
      },
      error: (err) => console.error('Erro ao carregar seguidores:', err)
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
