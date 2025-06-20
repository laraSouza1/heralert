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
  selector: 'app-adms-notifications',
  providers: [MessageService, ConfirmationService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, ButtonModule, CommonModule,
    NgIf, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './adms-notifications.component.html',
  styleUrl: './adms-notifications.component.css'
})
export class AdmsNotificationsComponent {

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
        this.notifications = res.data.filter(
          (n: any) => n.type === 'post_deleted_admin' || n.type === 'report_outcome_admin' || n.type === 'content_deleted_by_report' || n.type === 'report_outcome_user_admin'
        );
        this.filteredNotifications = [...this.notifications];
      }
    });
  }
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

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();

    this.filteredNotifications = this.notifications.filter(n =>
      (n.username && n.username.toLowerCase().includes(this.searchTerm)) ||
      (n.message && n.message.toLowerCase().includes(this.searchTerm)) ||
      (n.post_title && n.post_title.toLowerCase().includes(this.searchTerm))
    );
  }

  getNotificationTitle(type: string): string {
    switch (type) {
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
