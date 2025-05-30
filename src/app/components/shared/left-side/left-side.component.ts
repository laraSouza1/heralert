import { Component } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-left-side',
  providers: [MessageService, ConfirmationService],
  imports: [ImageModule, ButtonModule, MenuModule, ToastModule, DialogModule, ConfirmDialogModule],
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css']
})
export class LeftSideComponent {

  items: any[] | undefined;
  user: any;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private followService: FollowService,
    private blockService: BlockService,
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  notifications: any[] = [];
  totalNotifications: number = 0;

  ngOnInit() {

    //service de notification para fazer a contagem de notificações
    if (!this.notificationService) return;
    this.notificationService.totalNotifications$.subscribe(count => {
      this.totalNotifications = count;
    });

    this.loadUser(); //chama dados do user

    window.addEventListener('user-updated', () => {
      this.loadUser();
    }); //recarrega caso perfil seja editado

    //itens do menu
    this.items = [
      {
        label: 'Início',
        icon: 'pi pi-home',
        command: () => this.navigateToFY()
      },
      {
        label: 'Comunidades',
        icon: 'pi pi-users',
        command: () => this.navigateToComm()
      },
      {
        label: 'Notificações',
        icon: 'pi pi-bell',
        command: () => this.navigateToNotifications()
      },
    ];

    this.notificationService.totalNotifications$.subscribe(count => {
      this.totalNotifications = count;
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.notificationService.loadNotificationCount(user.id);
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

  //chama dados do user
  loadUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }
}
