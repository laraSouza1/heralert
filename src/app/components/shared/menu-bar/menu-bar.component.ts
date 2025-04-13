import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-bar',
  imports: [ButtonModule, MenubarModule],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent {

  items: MenuItem[] | undefined;

  constructor(private router: Router) {}

  ngOnInit() {

    //itens menu
    this.items = [
      {
        label: 'Home',
        command: () => this.navigateToHome()
      },
      {
        label: 'Log-in',
        command: () => this.navigateToLogin()
      },
      {
        label: 'Cadastre-se',
        command: () => this.navigateToSignIn()
      },
      /*{
        label: 'Suporte',
        command: () => this.navigateToSupport()
      },*/
    ];
  }

  //navegação de menu ------------------------------
  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }

  navigateToSupport() {
    this.router.navigate(['/support']);
  }
}
