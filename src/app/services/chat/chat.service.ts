import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //evento será emitido quando o chat de um usuário for aberto
  openChatEmitter = new EventEmitter<any>(); //muda para any

  constructor() { }

  private startedChatSource = new Subject<any>();
  startedChat$ = this.startedChatSource.asObservable();

  openChatWithUser(user: any) {
    this.startedChatSource.next(user); //notifica outros componentes
  }
}
