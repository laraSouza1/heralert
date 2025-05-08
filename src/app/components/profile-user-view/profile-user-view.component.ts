import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { FollowButtonComponent } from '../shared/follow-button/follow-button.component';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FollowService } from '../../services/services/follow.service';
import { BlockService } from '../../services/block/block.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Clipboard } from '@angular/cdk/clipboard';

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
  @ViewChild('menuRef') menu!: Menu;

  items: MenuItem[] | undefined;
  followingCount = 0;
  followersCount = 0;
  isBlocked = false;

  constructor(
    private http: HttpClient,
    private followService: FollowService,
    private confirmationService: ConfirmationService,
    private blockService: BlockService,
    private clipboard: Clipboard,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    //pega dados do user logado no localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    //verifica se o user que está sendo visualizado é bloqueado ou não
    if (!user?.id || !this.user?.id) return;

    this.blockService.refreshBlockedUsers(user.id).then(() => {
      this.isBlocked = this.blockService.isBlocked(this.user!.id);
      this.setupMenuItems();
    });

    this.loadCounts();

    this.followService.getFollowerCountChanged().subscribe(() => {
      this.loadCounts();
    });
  }

  //menu
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

  toggleMenu(event: Event) {
    if (this.menu) {
      this.menu.toggle(event);
    }
  }

  confirmToggleBlock() {
    //pega dados do user logado no localstorage
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
      //style dos btns do modal
      acceptButtonStyleClass: this.isBlocked ? 'my-unblock-button' : 'my-block-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //desbloqueia user
        if (this.isBlocked) {
          this.blockService.unblockUser(currentUserId, this.user.id).subscribe(() => {
            this.blockService.clear();
            this.refreshBlockStatus(); //atualizar tudo
          });
        } else {
          //bloqueia user
          this.blockService.blockUser(currentUserId, this.user.id).subscribe(() => {
            this.unfollowIfFollowing(currentUserId, this.user.id);
            this.blockService.clear();
            this.refreshBlockStatus();
          });
        }
      }
    });
  }

  //se bloquear um user que segue, vai parar de segui-lo
  unfollowIfFollowing(currentUserId: number, targetUserId: number) {

    //verifica se segue
    this.http.get<any>('http://localhost:8085/api/follows/check', {
      params: {
        follower_id: currentUserId,
        following_id: targetUserId
      }
    }).subscribe(res => {
      if (res.status && res.following) {
        //vai parar de seguir caso sim
        this.http.delete('http://localhost:8085/api/follows', {
          params: {
            follower_id: currentUserId,
            following_id: targetUserId
          }
        }).subscribe(() => {
          this.followService.clearFollowings();
          this.followService.refreshFollowings(currentUserId); //atualiza novamente
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

    //notifica o botão
    this.followButtonComponent?.updateBlockedState?.();
  }

  //vai att o setupitemsmenu em profile-view
  refreshBlockedState() {
    //pega dados o user logado no localstorage
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
    //vê user bloqueado
    this.blockService.refreshBlockedUsers(currentUserId).then(() => {
      //user bloqueado > mostra opção para desbloquear
      this.isBlocked = this.blockService.isBlocked(this.user.id);
      this.setupMenuItems();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user?.id) {
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      this.isBlocked = this.blockService.isBlocked(this.user.id);
      this.setupMenuItems();

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
    if (!this.user?.id) return;

    this.http.get<any>(`http://localhost:8085/api/follows/followers-users/${this.user.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.user.followersCount = res.data.length;
        }
      }
    });
  }

  //função para copiar link do perfil
  copyProfileLink() {
    const link = `${window.location.origin}/profile-view/${this.user.username}`;
    this.clipboard.copy(link);
    this.linkCopied();
  }

  linkCopied() {
    this.messageService.add({ severity: 'success', summary: 'Link copiado!' });
  }

}
