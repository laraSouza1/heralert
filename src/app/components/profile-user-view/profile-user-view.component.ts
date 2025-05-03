import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { FollowButtonComponent } from '../shared/follow-button/follow-button.component';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FollowService } from '../../services/services/follow.service';
import { BlockService } from '../../services/block/block.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-profile-user-view',
  providers: [MessageService, ConfirmationService],
  imports: [
    ButtonModule, DialogModule, MenuModule, ToastModule,
    FollowButtonComponent, NgIf, CommonModule, ConfirmDialogModule
  ],
  templateUrl: './profile-user-view.component.html',
  styleUrls: ['./profile-user-view.component.css']
})
export class ProfileUserViewComponent implements OnInit, OnChanges {

  @Input() user: any;

  @Output() openFollowersModal = new EventEmitter<number>();
  @Output() openFollowingModal = new EventEmitter<number>();

  @ViewChild(FollowButtonComponent) followButtonComponent!: FollowButtonComponent;

  items: MenuItem[] | undefined;
  followingCount = 0;
  followersCount = 0;
  isBlocked = false;

  constructor(
    private http: HttpClient,
    private followService: FollowService,
    private confirmationService: ConfirmationService,
    private blockService: BlockService
  ) { }

  ngOnInit() {

    this.loadCounts();

    this.followService.getFollowerCountChanged().subscribe(() => {
      this.loadCounts();
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.blockService.refreshBlockedUsers(user.id).then(() => {
      this.isBlocked = this.blockService.isBlocked(this.user.id);
      this.setupMenuItems();
    });

    this.followService.getFollowerCountChanged().subscribe(() => {
      this.loadCounts();
    });
  }

  setupMenuItems() {
    this.items = [
      {
        items: [
          {
            label: this.isBlocked ? 'Desbloquear usuário' : 'Bloquear usuário',
            icon: this.isBlocked ? 'pi pi-user-plus' : 'pi pi-user-minus',
            command: () => this.confirmToggleBlock()
          },
          { label: 'Denunciar usuário', icon: 'pi pi-flag' }
        ]
      }
    ];
  }

  confirmToggleBlock() {
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
    const action = this.isBlocked ? 'desbloquear' : 'bloquear';
    const header = this.isBlocked ? 'Confirmar Desbloqueio' : 'Confirmar Bloqueio';
    const icon = this.isBlocked ? 'pi pi-face-smile' : 'pi pi-exclamation-circle';
    const username = this.user.username;

    const message = `Deseja ${action} @${username}?`;

    this.confirmationService.confirm({
      message,
      header,
      icon,
      acceptLabel: this.isBlocked ? 'Desbloquear' : 'Bloquear',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: this.isBlocked ? 'my-unblock-button' : 'my-block-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        if (this.isBlocked) {
          this.blockService.unblockUser(currentUserId, this.user.id).subscribe(() => {
            this.blockService.clear();
            this.refreshBlockStatus(); //atualizar tudo
          });
        } else {
          this.blockService.blockUser(currentUserId, this.user.id).subscribe(() => {
            this.unfollowIfFollowing(currentUserId, this.user.id);
            this.blockService.clear();
            this.refreshBlockStatus();
          });
        }
      }
    });
  }

  unfollowIfFollowing(currentUserId: number, targetUserId: number) {
    this.http.get<any>('http://localhost:8085/api/follows/check', {
      params: { follower_id: currentUserId, following_id: targetUserId }
    }).subscribe(res => {
      if (res.status && res.following) {
        this.http.delete('http://localhost:8085/api/follows', {
          params: { follower_id: currentUserId, following_id: targetUserId }
        }).subscribe(() => {
          this.followService.clearFollowings(); //limpa cache local de seguidores/seguidos
          this.followService.refreshFollowings(currentUserId); // atualiza novamente
          this.followService.getFollowerCountChanged(); //notifica componentes
        });
      }
    });
  }

  refreshBlockStatus() {
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
    this.blockService.refreshBlockedUsers(currentUserId).then(() => {
      this.isBlocked = this.blockService.isBlocked(this.user.id);
      this.setupMenuItems(); //atualiza o texto-menu de bloquear>desbloquear
    });

    // também notifica o botão
    this.followButtonComponent?.updateBlockedState?.();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user?.id) {
      this.loadCounts();

      this.followService.getFollowerCountChanged().subscribe(() => {
        this.loadCounts();
      });
    }
  }

  //para abrir e fechar modais de seguindo e seguidores
  abrirFollowing() {
    this.openFollowingModal.emit(this.user.id);
  }

  abrirFollowers() {
    this.openFollowersModal.emit(this.user.id);
  }

  //vai buscar o nuemro se seguidores
  loadCounts(): void {
    this.http.get<any>(`http://localhost:8085/api/follows/followers-users/${this.user.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.user.followersCount = res.data.length;
        }
      }
    });
  }

}
