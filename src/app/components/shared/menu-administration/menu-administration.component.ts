import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-menu-administration',
  imports: [ButtonModule, MenuModule],
  templateUrl: './menu-administration.component.html',
  styleUrl: './menu-administration.component.css'
})
export class MenuAdministrationComponent {

  items: any[] | undefined;

  ngOnInit() {
    //itens do menu
    this.items = [
      {
        label: 'Gerenciamente de usuários',
        items: [
          {
            label: 'Lista de usuários',
            icon: 'pi pi-users',
            command: () => this.navigateToUsersList(),
          },
          {
            label: 'Usuários banidos',
            icon: 'pi pi-ban',
          },
        ]
      },
      {
        label: 'Gerenciamente de denúncias',
        items: [
          {
            label: 'Denúncias de posts',
            icon: 'pi pi-file',
          },
          {
            label: 'Denúncias de comentários',
            icon: 'pi pi-comment',
          },
        ]
      },
      {
        label: 'Outros',
        items: [
          {
            label: 'Gerenciamento de tags',
            icon: 'pi pi-hashtag',
            command: () => this.navigateToTagsList(),
          },
        ]
      },
    ];

  }

  constructor(
    private router: Router,
    private http: HttpClient,
  ) { }

  //navegações do menu ------------------------------------
  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  navigateToUsersList() {
    this.router.navigate(['/users-list']);
  }

  navigateToTagsList() {
    this.router.navigate(['/tags-administration']);
  }

}
