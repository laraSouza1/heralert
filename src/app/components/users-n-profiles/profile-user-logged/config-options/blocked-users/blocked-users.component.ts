import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FollowButtonComponent } from '../../../../shared/follow-button/follow-button.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FollowersUserComponent } from '../../../../followers/followers-user/followers-user.component';
import { FollowingUserComponent } from '../../../../followers/following-user/following-user.component';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  name: string;
  profile_pic?: string;
}

@Component({
  selector: 'app-blocked-users',
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule,
    FollowButtonComponent
  ],
  templateUrl: './blocked-users.component.html',
  styleUrl: './blocked-users.component.css'
})
export class BlockedUsersComponent {

  users: User[] = [];
  searchTerm = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  //pesquisa
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadUsers();
  }

  //fetch usuários que segue o user logado
  loadUsers(): void {

    //busca dados user logado no localstorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    //buscas users bloqueados pelo user logado
    this.http.get<any>(`http://localhost:8085/api/blocks/${currentUser.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          const blockedIds: number[] = res.data.map((b: any) => b.blocked_id);
          if (blockedIds.length === 0) {
            this.users = [];
            return;
          }

          const params = new HttpParams()
            .set('ids', blockedIds.join(','))
            .set('search', this.searchTerm);

          //busca as informações do bloqueados
          this.http.get<any>(`http://localhost:8085/api/users/by-ids`, { params }).subscribe({
            next: (userRes) => {
              if (userRes.status) {
                this.users = userRes.data;
              }
            },
            error: (err) => console.error('Erro ao buscar usuários bloqueados:', err)
          });
        }
      },
      error: (err) => console.error('Erro ao buscar bloqueios:', err)
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
