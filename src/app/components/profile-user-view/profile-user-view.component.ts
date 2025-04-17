import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile-user-view',
  imports: [
    ButtonModule,
    DialogModule,
    MenuModule,
    ToastModule
  ],
  templateUrl: './profile-user-view.component.html',
  styleUrl: './profile-user-view.component.css'
})
export class ProfileUserViewComponent implements OnInit {
  @Input() user: any;
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        items: [
          { label: 'Bloquear usuário', icon: 'pi pi-user-minus' }
        ]
      }
    ];
  }

}
