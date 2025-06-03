import { EventEmitter, Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //evento será emitido quando o chat de um usuário for aberto
  openChatEmitter = new EventEmitter<any>(); //muda para any

  constructor() { }

  openChatWithUser(user: any): void { //muda para any
    this.openChatEmitter.emit(user);
  }
}
