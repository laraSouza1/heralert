import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { CommonModule, NgIf } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import {ContextMenuModule } from 'primeng/contextmenu';
import { TextareaModule } from 'primeng/textarea';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../../services/chat/chat.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TruncateWordsPipe } from '../../../pipes/truncateWords/truncate-words.pipe';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';


interface ChatUser {
  userId: number;
  username: string;
  name: string;
  profile_pic?: string;
  lastMessageContent: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

@Component({
  selector: 'app-right-side',
  providers: [MessageService, ConfirmationService],
  imports: [
    TableModule, CommonModule, InputTextModule, TextareaModule, IconFieldModule, ContextMenuModule,
    InputIconModule, CommonModule, NgIf, FormsModule, ButtonModule, TruncateWordsPipe, MenuModule,
    ToastModule, ConfirmDialogModule, DialogModule
  ],
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.css'],
})
export class RightSideComponent implements OnInit {

  users!: ChatUser[];
  items: MenuItem[] | undefined;
  selectedUser: ChatUser | null = null;
  tableHeight = '520px';
  isExpanded = false;
  expandedUser: ChatUser | null = null;
  chatMessages: Message[] = [];
  newMessageContent: string = '';
  originalUsers: ChatUser[] = [];

  @ViewChild('dt2') dt2!: Table;

  //obtém o ID do usuário logado do localStorage
  loggedInUserId: number | undefined = JSON.parse(localStorage.getItem('user') || '{}').id;

  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    //carrega os usuários com quem o usuário logado tem conversas
    this.loadChatUsers();

    //itens do menu
    this.items = [
      { label: 'Bloquear', icon: 'pi pi-trash' },
      { label: 'Denunciar', icon: 'pi pi-alert' }
    ];

    //observa o evento para abrir um novo chat
    this.chatService.openChatEmitter.subscribe((userToChatWith: any) => {
      if (!userToChatWith || !userToChatWith.id) {
        return;
      }

      //verifica se o usuário já existe na lista de chats
      const existingChatUser = this.users.find(u => u.userId === userToChatWith.id);
      if (!existingChatUser) {
        //adiciona um novo usuário à lista de chats se não existir
        this.users = [{
          userId: userToChatWith.id,
          name: userToChatWith.name,
          username: userToChatWith.username,
          profile_pic: userToChatWith.profile_pic || '',
          lastMessageContent: 'Novo chat'
        }, ...this.users];
      }

      if (existingChatUser) {
        //move o chat existente para o topo da lista
        this.users = [existingChatUser, ...this.users.filter(u => u.userId !== userToChatWith.id)];
      }

      //atualiza a última mensagem do chat expandido
      const index = this.users.findIndex(u => u.userId === this.expandedUser?.userId);
      if (index !== -1) {
        this.users[index].lastMessageContent = this.newMessageContent.trim();
      }

      //abre o chat com o usuário selecionado
      this.onRowClick({
        userId: userToChatWith.id,
        name: userToChatWith.name,
        username: userToChatWith.username,
        profile_pic: userToChatWith.profile_pic || '',
        lastMessageContent: existingChatUser?.lastMessageContent || 'Novo chat'
      });
    });
  }

  //carrega a lista de usuários com chats
  loadChatUsers(): void {
    if (typeof this.loggedInUserId === 'undefined') {
      return;
    }

    this.http.get<any>(`http://localhost:8085/api/chats/${this.loggedInUserId}`).subscribe({
      next: response => {
        if (response.status) {
          //mapeia a resposta para o formato ChatUser
          this.users = response.data.map((user: any) => ({
            userId: user.userId,
            username: user.username,
            name: user.name,
            profile_pic: user.profile_pic,
            lastMessageContent: user.lastMessageContent
          }));
          this.originalUsers = [...this.users]; //clona os dados originais para filtragem
        } else {
          console.error('Falha ao carregar chats do user:', response.message);
        }
      },
      error: error => {
        console.error('Erro ao carregar chats dos users:', error);
      }
    });
  }

  //filtra usuários por nome ou username
  filterByNameOrUsername(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.users = this.originalUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm)
    );
  }

  //filtra usuários pela última mensagem
  filterByMessage(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.users = this.originalUsers.filter(user =>
      user.lastMessageContent?.toLowerCase().includes(searchTerm)
    );
  }

  //para quando clicar numa linha da tabela de chats
  onRowClick(user: ChatUser): void {
    this.expandedUser = user;
    this.isExpanded = true;
    this.tableHeight = '0px'; //esconde a tabela de chats
    this.loadChatMessages(user.userId);
  }

  //carrega as mensagens de um chat específico
  loadChatMessages(otherUserId: number): void {
    if (typeof this.loggedInUserId === 'undefined') {
      return;
    }

    this.http.get<any>(`http://localhost:8085/api/messages/${this.loggedInUserId}/${otherUserId}`).subscribe({
      next: response => {
        if (response.status) {
          this.chatMessages = response.data;
        } else {
          console.error('Falha ao carregar mensagens do chat:', response.message);
        }
      },
      error: error => {
        console.error('Erro puxando mensagens do chat:', error);
      }
    });
    //rola para o final do chat após carregar as mensagens
    setTimeout(() => {
      const chatDiv = document.querySelector('.chat');
      chatDiv?.scrollTo({ top: chatDiv.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  //fecha a div do chat expandido
  closeDiv(): void {
    this.isExpanded = false;
    this.tableHeight = '100%'; //restaura a altura da tabela de chats
    this.expandedUser = null;
    this.chatMessages = [];
    this.newMessageContent = '';
  }

  //envia uma nova mensagem
  sendMessage(): void {
    if (!this.newMessageContent.trim() || !this.expandedUser || typeof this.loggedInUserId === 'undefined') {
      return;
    }

    const message = {
      sender_id: this.loggedInUserId,
      receiver_id: this.expandedUser.userId,
      content: this.newMessageContent.trim()
    };

    this.http.post<any>('http://localhost:8085/api/messages', message).subscribe({
      next: response => {
        if (response.status) {
          //adiciona a nova mensagem à lista de mensagens do chat
          this.chatMessages.push({
            id: response.data.id,
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            content: message.content,
            created_at: new Date().toISOString()
          });
          this.newMessageContent = ''; //limpa o campo de nova mensagem
          this.loadChatUsers(); //atualiza a lista de chats para refletir a nova mensagem
        } else {
          console.error('Falha ao enviar mensagem:', response.message);
        }
      },
      error: error => {
        console.error('Erros enviando mensagem:', error);
      }
    });
  }

  //handle exclusão de uma mensagem
  handleDeleteMessage(messageId: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir essa mensagem?`,
      header: 'Excluir mensagem',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.http.delete<any>(`http://localhost:8085/api/messages/${messageId}`).subscribe({
          next: response => {
            if (response.status) {
              //remove a mensagem excluída da lista
              this.chatMessages = this.chatMessages.filter(msg => msg.id !== messageId);
            } else {
              console.error('Falha ao deletar mensagem:', response.message);
            }
          },
          error: error => {
            console.error('Erro ao deletar mensagem:', error);
          }
        });
      }
    });
  }

  //navega para o perfil de um usuário
  goToProfile(userId: number, username: string): void {
    this.router.navigate(['/profile-view', username]);
  }

  //abre o seletor de arquivos para upload de imagem no chat
  onUploadClickForChat() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadChatImage(file);
      }
    };
    input.click();
  }

  //envia uma imagem para o servidor
  uploadChatImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    this.http.post('http://localhost:8085/api/upload', formData).subscribe({
      next: (res: any) => {
        const imageUrl = res.url;
        this.newMessageContent = imageUrl; //define o URL da imagem como conteúdo da mensagem
        this.sendMessage(); //envia a mensagem com o URL da imagem
      },
      error: (err) => {
        console.error('Erro ao enviar imagem:', err);
      }
    });
  }

  //verifica se o conteúdo da mensagem é uma imagem
  isImage(content: string): boolean {
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(content);
  }
}
