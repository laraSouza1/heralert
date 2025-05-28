import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private totalNotificationsSubject = new BehaviorSubject<number>(0);
  totalNotifications$ = this.totalNotificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  //fetch de numero de notificações
  loadNotificationCount(userId: number) {
    this.http.get<any>(`http://localhost:8085/api/notifications/count/${userId}`).subscribe(res => {
      if (res.status) {
        this.totalNotificationsSubject.next(res.total);
      }
    });
  }

  //para atualizar contagem caso uma notificação seja apagada
  decrement() {
    const current = this.totalNotificationsSubject.getValue();
    this.totalNotificationsSubject.next(current - 1);
  }
}
