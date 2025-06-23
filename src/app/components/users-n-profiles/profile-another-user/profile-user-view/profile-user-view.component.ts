import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { FollowButtonComponent } from '../../../shared/follow-button/follow-button.component';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FollowService } from '../../../../services/follow/follow.service';
import { BlockService } from '../../../../services/block/block.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { ChatService } from '../../../../services/chat/chat.service';
import { ReportingUserComponent } from '../../../reportingForms/reporting-user/reporting-user.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-profile-user-view',
  providers: [MessageService, ConfirmationService],
  imports: [
    ButtonModule, DialogModule, MenuModule, ToastModule, FollowButtonComponent, NgIf, CommonModule,
    ConfirmDialogModule, ReportingUserComponent, TooltipModule
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
  @ViewChild(ReportingUserComponent) reportingUserComponent!: ReportingUserComponent;

  items: MenuItem[] | undefined;
  followingCount = 0;
  followersCount = 0;
  isBlocked = false;
  showUserReportModal: boolean = false;

  constructor(
    private http: HttpClient,
    private followService: FollowService,
    private confirmationService: ConfirmationService,
    private blockService: BlockService,
    private clipboard: Clipboard,
    private messageService: MessageService,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit() {
    //pega dados do user logado no localstorage
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!loggedInUser?.id || !this.user?.id) {
      return;
    }

    this.blockService.refreshBlockedUsers(loggedInUser.id).then(() => {
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
          {
            label: 'Denunciar usuário',
            icon: 'pi pi-flag',
            command: () => { this.showUserReportModal = true; }
          }
        ]
      }
    ];
  }

  closeUserReportingModal() {
    this.showUserReportModal = false;
    if (this.reportingUserComponent) {
      //reseta o form após submissão
      this.reportingUserComponent.formGroup.reset();
      this.reportingUserComponent.showOtherReasonTextarea = false;
    }
  }

  //para enviar o form de denuncia de post
  submitUserReportForm() {
    if (this.reportingUserComponent) {
      this.reportingUserComponent.submitReport();
      setTimeout(() => {
        this.showUserReportModal = false;
      }, 2000); //fecha modal após envio
    }
  }

  //confere validade do form para desativar/ativar btn de envio
  isUserReportFormValid(): boolean {
    return this.reportingUserComponent?.formGroup?.valid ?? false;
  }

  //vai começar um novo chat
  startChat(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (this.user && this.user.id && this.user.username && loggedInUser?.id) {
      //remove o chat da tabela deleted_chats, se existir
      this.http.post('http://localhost:8085/api/unhide-chat', {
        user_id: loggedInUser.id,
        other_user_id: this.user.id
      }).subscribe({
        next: () => {
          //emite a abertura do chat
          this.chatService.openChatWithUser({
            userId: this.user.id,
            username: this.user.username,
            name: this.user.name,
            profile_pic: this.user.profile_pic
          });
        },
        error: err => {
          console.error('Erro ao restaurar chat:', err);
          //ainda abre o chat mesmo se a requisição falhar
          this.chatService.openChatWithUser({
            userId: this.user.id,
            username: this.user.username,
            name: this.user.name,
            profile_pic: this.user.profile_pic
          });
        }
      });
    }
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
            this.setupMenuItems();
          });
        } else {
          //bloqueia user
          this.blockService.blockUser(currentUserId, this.user.id).subscribe(() => {
            this.unfollowIfFollowing(currentUserId, this.user.id);
            this.blockService.clear();
            this.refreshBlockStatus();
            this.setupMenuItems();
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
    //vê users bloqueado
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
