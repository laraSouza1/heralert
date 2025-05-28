import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificationService } from '../../../services/notification/notification.service';
import { CommonModule, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MentionPipe } from '../../../pipes/mention/mention.pipe';

@Component({
  selector: 'app-likes-notifications',
  providers: [MessageService, ConfirmationService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, ButtonModule, CommonModule,
    NgIf, MentionPipe, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './likes-notifications.component.html',
  styleUrl: './likes-notifications.component.css'
})
export class LikesNotificationsComponent {

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private notificationService: NotificationService
  ) { }

  notifications: any[] = [];
  notification: number = 0;
  userId!: number;
  searchTerm: string = '';
  filteredNotifications: any[] = [];

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.userId = user.id;
      this.http.get<any>(`http://localhost:8085/api/notifications/${this.userId}`).subscribe(res => {
        if (res.status) {
          this.notifications = res.data.filter((n: any) => n.type === 'like');
          this.filteredNotifications = [...this.notifications];
        }
      });
    }
  }

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

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();

    this.filteredNotifications = this.notifications.filter(n =>
      (n.username && n.username.toLowerCase().includes(this.searchTerm)) ||
      (n.message && n.message.toLowerCase().includes(this.searchTerm)) ||
      (n.post_title && n.post_title.toLowerCase().includes(this.searchTerm))
    );
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
