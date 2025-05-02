import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { FollowService } from '../../../services/services/follow.service';

@Component({
  selector: 'app-left-side',
  providers: [MessageService, ConfirmationService],
  imports: [ImageModule, ButtonModule, MenuModule, ToastModule, DialogModule, ConfirmDialogModule,],
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css']
})
export class LeftSideComponent {

  items: any[] | undefined;
  user: any;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private followService: FollowService
  ) {}

  ngOnInit() {
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
        icon: 'pi pi-bell'
      },
    ];
  }

  //btns de navegação
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToComm() {
    this.router.navigate(['/communities']);
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
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => {
        localStorage.removeItem('user');
        this.followService.clearFollowings();
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
