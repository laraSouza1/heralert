import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MentionPipe } from '../../../pipes/mention/mention.pipe';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-notifications',
  providers: [MessageService, ConfirmationService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, ButtonModule, CommonModule,
    NgIf, MentionPipe, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './all-notifications.component.html',
  styleUrl: './all-notifications.component.css'
})
export class AllNotificationsComponent {

  constructor(
    private router: Router, private http: HttpClient, private messageService: MessageService,
    private notificationService: NotificationService
  ) { }

  notifications: any[] = [];
  notification: number = 0;
  userId!: number;
  searchTerm: string = '';
  filteredNotifications: any[] = [];

  ngOnInit() {

    //pega user logado do localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.userId = user.id;
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
        //filtra as notificações para remover a excluída
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        //att filteredNotifications após a mudança em notifications
        this.filteredNotifications = [...this.notifications];

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

  //Para título/tipo de notificação
  getNotificationTitle(type: string): string {
    switch (type) {
      case 'like':
        return 'Nova curtida em';
      case 'comment':
        return 'Novo comentário em';
      case 'follow':
        return 'Novo seguidor';
      case 'post_deleted_admin':
        return 'Administração: Postagem excluída';
      case 'report_outcome_admin':
        return 'Administração: Resultado de sua denúncia';
      case 'content_deleted_by_report':
        return 'Administração: Comentário excluído';
      case 'report_outcome_user_admin':
        return 'Administração: Denúncia de Usuário';
      default:
        return 'Notificação';
    }
  }

}
