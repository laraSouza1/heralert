import { Component } from '@angular/core';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ButtonIcon, ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MentionPipe } from '../../pipes/mention/mention.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-notifications',
  providers: [MessageService, ConfirmationService],
  imports: [
    LeftSideComponent, IconFieldModule, InputIconModule, InputTextModule, ButtonModule, CommonModule,
    NgIf, MentionPipe, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

  constructor(
    private router: Router, private http: HttpClient, private messageService: MessageService,
    private notificationService: NotificationService
  ) { }

  notifications: any[] = [];
  totalNotifications: number = 0;
  notification: number = 0;
  userId!: number;
  searchTerm: string = '';
  filteredNotifications: any[] = [];

  ngOnInit() {

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

      //fetch notificações
      this.http.get<any>(`http://localhost:8085/api/notifications/${this.userId}`).subscribe(res => {
        if (res.status) {
          this.notifications = res.data;
          this.filteredNotifications = [...this.notifications];
        }
      });
    }
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();

    this.filteredNotifications = this.notifications.filter(n =>
      (n.username && n.username.toLowerCase().includes(this.searchTerm)) ||
      (n.message && n.message.toLowerCase().includes(this.searchTerm)) ||
      (n.post_title && n.post_title.toLowerCase().includes(this.searchTerm))
    );
  }

  //navega para a postagem do favorito/comentário
  goToPost(postId: number, title: string) {
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate([`/view-post/${postId}-${slug}`]);
  }

  //vai para o perfil do novo seguidor
  goToUserProfile(userId: number, username: string) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser?.id === userId) this.router.navigate(['/profile']);
    else this.router.navigate(['/profile-view', username]);
  }

  //para deletar uma notificação
  handleDeleteNotification(notificationId: number) {

    this.http.delete(`http://localhost:8085/api/notifications/${notificationId}`).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.notificationService.decrement();
        this.messageService.add({ severity: 'success', summary: 'Notificação excluída com sucesso!' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro ao excluir notificação.' });
      }
    });
  }

  //marcação de user por @ pipe mention
  handleMentionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mention')) {
      const mentionedUsername = target.getAttribute('data-username');
      if (!mentionedUsername) return;

      //navega até o perfil do user mencionado
      if (mentionedUsername) {
        this.router.navigate(['/profile-view', mentionedUsername]);
      }
    }
  }

}
