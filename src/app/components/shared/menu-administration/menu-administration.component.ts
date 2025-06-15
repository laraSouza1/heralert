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
        label: 'Gerenciamente de usuárias',
        items: [
          {
            label: 'Lista de usuárias',
            icon: 'pi pi-users',
            command: () => this.navigateToUsersList(),
          },
          {
            label: 'Usuárias a banir',
            icon: 'pi pi-flag',
            command: () => this.navigateToUsersToBan(),
          },
          {
            label: 'Usuárias banidas',
            icon: 'pi pi-ban',
            command: () => this.navigateToBannnedUsers(),
          },
        ]
      },
      {
        label: 'Gerenciamente de denúncias',
        items: [
          {
            label: 'Denúncias de usuárias',
            icon: 'pi pi-users',
            command: () => this.navigateToUsersReports(),
          },
          {
            label: 'Denúncias de posts',
            icon: 'pi pi-file',
            command: () => this.navigateToPostsReports(),
          },
          {
            label: 'Denúncias de comentários',
            icon: 'pi pi-comment',
            command: () => this.navigateToCommentsReports(),
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

  navigateToBannnedUsers() {
    this.router.navigate(['/banned-users-list']);
  }

  navigateToCommentsReports() {
    this.router.navigate(['/comments-reports']);
  }

  navigateToPostsReports() {
    this.router.navigate(['/posts-reports']);
  }

  navigateToUsersReports() {
    this.router.navigate(['/users-reports']);
  }

  navigateToUsersToBan() {
    this.router.navigate(['/users-to-ban-list']);
  }

}
