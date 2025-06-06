import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../services/notification/notification.service';
import { LikesNotificationsComponent } from '../likes-notifications/likes-notifications.component';
import { CommentsNotificationsComponent } from '../comments-notifications/comments-notifications.component';
import { FollowerNotificationsComponent } from '../follower-notifications/follower-notifications.component';
import { AllNotificationsComponent } from '../all-notifications/all-notifications.component';

@Component({
  selector: 'app-notifications',
  providers: [MessageService, ConfirmationService],
  imports: [
    ButtonModule, CommonModule, NgIf, ToastModule, LikesNotificationsComponent,
    CommentsNotificationsComponent, FollowerNotificationsComponent, AllNotificationsComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

  constructor(
    private notificationService: NotificationService
  ) { }

  totalNotifications: number = 0;
  userId!: number;
  activeTab: 'all' | 'lk' | 'ct' | 'fl' = 'all';

  ngOnInit() {

    //vai salvar a tab atual para não sair dela quando dar reload na página
    const savedTab = localStorage.getItem('activeTab') as 'all' | 'lk' | 'ct' | 'fl' | null;
    if (savedTab && ['all', 'lk', 'ct', 'mr'].includes(savedTab)) {
      this.activeTab = savedTab;
    }

    //pega user logado do localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.userId = user.id;

      //inscrição para acompanhar mudanças
      this.notificationService.totalNotifications$.subscribe(count => {
        this.totalNotifications = count;
      });

      //carrega a contagem de notificações atual do backend
      this.notificationService.loadNotificationCount(this.userId);
    }
  }

  //tabs de conteudo
  setActiveTab(tab: 'all' | 'lk' | 'ct' | 'fl'): void {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }

}
