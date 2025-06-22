import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { FollowService } from '../../../services/follow/follow.service';
import { BlockService } from '../../../services/block/block.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-left-side',
  providers: [MessageService, ConfirmationService],
  imports: [
    ImageModule, ButtonModule, MenuModule, ToastModule, DialogModule, ConfirmDialogModule, TooltipModule,
    CommonModule, NgIf
  ],
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css']
})
export class LeftSideComponent implements OnInit {

  items: any[] | undefined;
  user: any;
  notifications: any[] = [];
  totalNotifications: number = 0;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private followService: FollowService,
    private blockService: BlockService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.loadUser();

    //service de notification para fazer a contagem de notificações
    this.notificationService.totalNotifications$.subscribe(count => {
      this.totalNotifications = count;
    });

    window.addEventListener('user-updated', () => {
      this.loadUser(); //recarrega caso perfil seja editado
      this.updateMenuItems(); 
    });

    this.updateMenuItems();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.notificationService.loadNotificationCount(user.id);
    }
  }

  //fetch nas infos do user do local storage
  loadUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    } else {
      this.user = null;
    }
  }

  //itens de menu baseados no role
  updateMenuItems() {
    const baseItems = [
      {
        label: 'Início',
        icon: 'pi pi-home',
        command: () => this.navigateToFY(),
      },
      {
        label: 'Comunidades',
        icon: 'pi pi-users',
        command: () => this.navigateToComm(),
      },
      {
        label: 'Notificações',
        icon: 'pi pi-bell',
        command: () => this.navigateToNotifications(),
      },
    ];

    if (this.user && (this.user.role === 1 || this.user.role === 2)) {
      this.items = [
        ...baseItems,
        {
          label: 'Administração',
          icon: 'pi pi-cog',
          command: () => this.navigateToUsersList(),
        },
      ];
    } else {
      this.items = baseItems;
    }
  }

  //btns de navegação
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToComm() {
    this.router.navigate(['/communities']);
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  navigateToWelcome() {
    this.router.navigate(['/welcome']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToUsersList() {
    this.router.navigate(['/users-list']);
  }

  //logout e limpa o user
  logout() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja sair?',
      header: 'Confirmar Logout',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Sair',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-out-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        localStorage.removeItem('user');
        this.followService.clearFollowings();
        this.blockService.clear();
        this.navigateToWelcome();
      }
    });
  }
}
