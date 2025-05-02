import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule, NgFor } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { ProfileUserViewComponent } from '../profile-user-view/profile-user-view.component';
import { PostComponent } from '../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FollowingUserViewComponent } from '../followers/following-user-view/following-user-view.component';
import { FollowersUserViewComponent } from '../followers/followers-user-view/followers-user-view.component';

@Component({
  selector: 'app-profile-view',
  providers: [MessageService, ConfirmationService],
  imports: [
    RightSideComponent, LeftSideComponent, DialogModule, ConfirmDialogModule, ToastModule,
    ButtonModule, MenubarModule, CommonModule, ProfileUserViewComponent, PostComponent,
    IconFieldModule, InputIconModule, InputTextModule, FollowingUserViewComponent,
    FollowersUserViewComponent
  ],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css'
})
export class ProfileViewComponent implements OnInit {

  user: any;
  userPosts: any[] = [];
  searchTerm = '';
  showFollowingModal = false;
  showFollowersModal = false;
  selectedUserId: number | null = null;
  
  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.loadUser(username);
      }
    });
  }

  //abrir modais de ver seguidores/seguindo do user visualizado
  onOpenFollowingModal(userId: number) {
    this.selectedUserId = userId;
    this.showFollowingModal = true;
  }
  
  onOpenFollowersModal(userId: number) {
    this.selectedUserId = null;
    this.showFollowersModal = true;
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    if (this.user?.id) {
      this.loadUserPosts(this.user.id);
    }
  }

  //fetch das infos do usuário
  loadUser(username: string): void {
    this.http.get<any>(`http://localhost:8085/api/users/username/${username}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.user = res.data;

          const date = new Date(this.user.created_at);
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          this.user.memberSince = `Membro desde ${meses[date.getMonth()]} ${date.getFullYear()}`;

          this.loadUserPosts(this.user.id);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
      }
    });
  }

  //fetch dos posts do usuário
  loadUserPosts(userId: string): void {
    this.http.get<any>(`http://localhost:8085/api/posts/user/${userId}`, {
      params: { search: this.searchTerm }
    }).subscribe({
      next: (res) => {
        if (res.status) {
          this.userPosts = res.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar posts do usuário:', err);
      }
    });
  }
}
