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
import { ProfileUserViewComponent } from '../profile-user-view/profile-user-view.component';
import { PostComponent } from '../../../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FollowingUserViewComponent } from '../../../followers/following-user-view/following-user-view.component';
import { FollowersUserViewComponent } from '../../../followers/followers-user-view/followers-user-view.component';
import { BlockService } from '../../../../services/block/block.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-profile-view',
  providers: [MessageService, ConfirmationService],
  imports: [
    DialogModule, ConfirmDialogModule, ToastModule,
    ButtonModule, MenubarModule, CommonModule, ProfileUserViewComponent, PostComponent,
    IconFieldModule, InputIconModule, InputTextModule, FollowingUserViewComponent,
    FollowersUserViewComponent, TooltipModule
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
  resetFollowersComponent = false;
  isBlocked = false;
  currentUser: any;
  username!: string;

  @ViewChild(ProfileUserViewComponent) profileUserViewComponent!: ProfileUserViewComponent;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private blockService: BlockService
  ) { }

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    this.blockService.getBlockedUsersChanges().subscribe(blockedSet => {
      if (this.user?.id) {
        const wasBlocked = this.isBlocked;
        this.isBlocked = blockedSet.has(this.user.id);

        if (wasBlocked && !this.isBlocked) {
          //desbloqueou > recarrega os posts
          this.loadUserPosts(this.user.id);
        }

        if (!wasBlocked && this.isBlocked) {
          //bloqueou > limpa os posts
          this.userPosts = [];
        }
      }
    });

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
    this.selectedUserId = userId;
    this.showFollowersModal = true;
  }

  onCloseFollowersModal() {
    this.resetFollowersComponent = true;
    setTimeout(() => {
      this.resetFollowersComponent = false;
    });
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

          this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');

          this.blockService.refreshBlockedUsers(this.currentUser.id).then(() => {
            if (!this.blockService.isBlocked(this.user.id)) {
              this.loadUserPosts(this.user.id);
            }
          });

          const date = new Date(this.user.created_at);
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          this.user.memberSince = `Membro desde ${meses[date.getMonth()]} ${date.getFullYear()}`;
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

  //ao bloquear user, att profile-user-view, esconde os posts e mostra opção de desbloqueio
  onUserBlocked(): void {
    this.blockService.refreshBlockedUsers(this.currentUser.id).then(() => {
      if (this.user?.id) {
        this.isBlocked = this.blockService.isBlocked(this.user.id);
        if (this.isBlocked) {
          this.userPosts = [];
        }

        this.profileUserViewComponent?.refreshBlockedState();
      }
    });
  }

}
