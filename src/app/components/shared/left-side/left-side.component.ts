import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-left-side',
  imports: [ImageModule, ButtonModule, MenuModule, ConfirmDialogModule, ToastModule],
  templateUrl: './left-side.component.html',
  styleUrl: './left-side.component.css',
  providers: [ConfirmationService, MessageService]
})
export class LeftSideComponent {

  items: MenuItem[] | undefined;
  user: any;

  constructor(private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    //itens menu
    this.items = [
      {
        label: 'Início',
        icon: 'pi pi-home',
        command: () => this.navigateToFY()
      },
      {
        label: 'Comunidades',
        icon: 'pi pi-users'
      },
      {
        label: 'Notificações',
        icon: 'pi pi-bell'
      },
    ];
  }

  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  confirm(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Realmente deseja realizar log-out?',
        header: 'Sair da conta',
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-sign-out',
        rejectButtonProps: {
            label: 'Cancelar',
            severity: "secondary",
            variant: "outlined"
        },
        acceptButtonProps: {
          label: 'Sair',
          severity: "danger",
          command: () => {
            localStorage.removeItem('user');
            this.navigateToHome();
          }
      },
    });
}

}
