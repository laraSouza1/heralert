import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-left-side',
  imports: [ImageModule, ButtonModule, MenuModule, ToastModule],
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css']
})
export class LeftSideComponent {

  items: any[] | undefined;
  user: any;

  constructor(private router: Router) {}

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
        icon: 'pi pi-users'
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

  navigateToWelcome() {
    this.router.navigate(['/welcome']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  //logout e limpa o user
  logout() {
    localStorage.removeItem('user');
    this.navigateToWelcome();
  }

  //chama dados do user
  loadUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }
}
