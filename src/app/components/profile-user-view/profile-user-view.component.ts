import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { FollowButtonComponent } from '../shared/follow-button/follow-button.component';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FollowService } from '../../services/services/follow.service';

@Component({
  selector: 'app-profile-user-view',
  imports: [
    ButtonModule, DialogModule, MenuModule, ToastModule,
    FollowButtonComponent, NgIf, CommonModule
  ],
  templateUrl: './profile-user-view.component.html',
  styleUrls: ['./profile-user-view.component.css']
})
export class ProfileUserViewComponent implements OnInit {
  
  @Input() user: any;
  
  @Output() openFollowersModal = new EventEmitter<number>();
  @Output() openFollowingModal = new EventEmitter<number>();

  items: MenuItem[] | undefined;
  followingCount = 0;
  followersCount = 0;

  constructor(private http: HttpClient, private followService: FollowService) {}
  
  ngOnInit() {
    this.items = [
      {
        items: [
          { label: 'Bloquear usuário', icon: 'pi pi-user-minus' },
          { label: 'Denunciar usuário', icon: 'pi pi-flag' }
        ]
      }
    ];
  }

  //para abrir e fechar modais de seguindo e seguidores
  abrirFollowing() {
    this.openFollowingModal.emit(this.user.id);
  }
  
  abrirFollowers() {
    this.openFollowersModal.emit(this.user.id);
  }

}
