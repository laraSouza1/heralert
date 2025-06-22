import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { CommonModule, NgIf } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { BlockService } from '../../../services/block/block.service';
import { TooltipModule } from 'primeng/tooltip';
import { LinkifyPipe } from '../../../pipes/linkify/linkify.pipe';
import { MentionPipe } from '../../../pipes/mention/mention.pipe';

interface ChatUser {
  userId: number;
  username: string;
  name: string;
  profile_pic?: string;
  lastMessageContent: string;
  lastMessageSenderId?: number;
  role?: number;
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
    TableModule, CommonModule, InputTextModule, TextareaModule, IconFieldModule,
    InputIconModule, CommonModule, NgIf, FormsModule, ButtonModule, TruncateWordsPipe, MenuModule,
    ToastModule, ConfirmDialogModule, DialogModule, TooltipModule, LinkifyPipe, MentionPipe
  ],
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.css'],
})
export class RightSideComponent implements OnInit {

  users!: ChatUser[];
  selectedUser: ChatUser | null = null;
  tableHeight = '520px';
  isExpanded = false;
  expandedUser: ChatUser | null = null;
  chatMessages: Message[] = [];
  newMessageContent: string = '';
  originalUsers: ChatUser[] = [];
  activeOptionsUserId: number | null = null;
  showChatHeaderOptions = false;

  @ViewChild('dt2') dt2!: Table;

  //obtém o ID do usuário logado do localStorage
  loggedInUserId: number | undefined = JSON.parse(localStorage.getItem('user') || '{}').id;

  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private blockService: BlockService
  ) { }

  ngOnInit() {
    //carrega os usuários com quem o usuário logado tem conversas
    this.loadChatUsers();

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
          role: userToChatWith.role,
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
        lastMessageContent: existingChatUser?.lastMessageContent || 'Novo chat',
        role: userToChatWith.role
      });
    });

    //para recomeçar um chat depois de excluí-lo (recupera as mensagens existentes)
    this.chatService.startedChat$.subscribe(user => {
      const exists = this.users.some(u => u.userId === user.userId);
      if (!exists) {
        this.users.unshift({
          userId: user.userId,
          name: user.name || user.username,
          username: user.username,
          profile_pic: user.profile_pic || '',
          lastMessageContent: 'chat vazio',
          lastMessageSenderId: undefined
        });
      }
      this.onRowClick({
        userId: user.userId,
        name: user.name || user.username,
        username: user.username,
        profile_pic: user.profile_pic || '',
        lastMessageContent: 'chat vazio'
      });
    });

    this.blockService.blockAction$.subscribe(() => {
      this.loadChatUsers();
    });

  }

  //carrega a lista de usuários com chats
  loadChatUsers(): void {
    if (typeof this.loggedInUserId === 'undefined') return;

    this.blockService.refreshBlockedUsers(this.loggedInUserId).then(() => {
      const blockedSet = new Set(this.blockService['blockedUsers']);
      const blockedBySet = new Set(this.blockService['usersWhoBlockedMe']);


      this.http.get<any>(`http://localhost:8085/api/chats/${this.loggedInUserId}`).subscribe({
        next: response => {
          if (response.status) {
            //mapeia a resposta para o formato ChatUser
            this.users = response.data
              .filter((user: any) =>
                !blockedSet.has(user.userId) &&
                !blockedBySet.has(user.userId)
              )
              .map((user: any) => ({
                userId: user.userId,
                username: user.username,
                name: user.name,
                profile_pic: user.profile_pic,
                lastMessageContent: user.lastMessageContent,
                lastMessageSenderId: user.lastMessageSenderId,
                role: user.role
              }));
            this.originalUsers = [...this.users];
          } else {
            console.error(response.message);
          }
        },
        error: error => {
          console.error(error);
        }
      });
    });
  }

  //para navegar ao perfil ao clicar num @ na mensagem
  handleMentionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mention')) {
      const mentionedUsername = target.getAttribute('data-username');

      if (!mentionedUsername) {
        return;
      }

      //navega até o perfil do user mencionado
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (mentionedUsername === currentUser.username) {
        this.router.navigate(['/profile']);
        //se for o user logado no localstorage, mostra o perfil dele
      } else {
        this.router.navigate(['/profile-view', mentionedUsername]);
      }
    }
  }

  //filtra usuários por nome ou username
  filterByNameOrUsername(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.users = this.originalUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm)
    );
  }

  //para quando clicar numa linha da tabela de chats
  onRowClick(user: ChatUser): void {
    this.expandedUser = user; //define o usuário do chat expandido
    this.isExpanded = true; //abre a visualização do chat
    this.tableHeight = '0px';
    this.loadChatMessages(user.userId); //carrega as mensagens do chat selecionado
  }

  //carrega as mensagens de um chat específico
  loadChatMessages(otherUserId: number): void {
    if (typeof this.loggedInUserId === 'undefined') {
      return;
    }

    this.http.get<any>(`http://localhost:8085/api/messages/${this.loggedInUserId}/${otherUserId}`).subscribe({
      next: response => {
        if (response.status) {
          this.chatMessages = response.data; //atribui as mensagens carregadas
          this.scrollToChatBottom(); //rola para o final do chat
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
    this.tableHeight = '100%';
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
          this.scrollToChatBottom(); //rola para a última mensagem
        } else {
          console.error('Falha ao enviar mensagem:', response.message);
        }
      },
      error: error => {
        console.error('Erros enviando mensagem:', error);
      }
    });
  }

  //vai dar scroll para o final do chat
  scrollToChatBottom(): void {
    setTimeout(() => {
      const chatDiv = document.querySelector('.chat');
      if (chatDiv) { //verifica se o elemento existe
        chatDiv.scrollTo({ top: chatDiv.scrollHeight, behavior: 'smooth' });
      }
    }, 100); //atraso para garantir que o DOM foi atualizado
  }

  //handle exclusão de uma mensagem
  handleDeleteMessage(messageId: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir essa<br>mensagem?`,
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
              //remove a mensagem
              this.chatMessages = this.chatMessages.filter(msg => msg.id !== messageId);

              //atualiza preview na lista de usuários
              if (this.expandedUser) {
                const userId = this.expandedUser.userId;
                const remainingMessages = [...this.chatMessages];

                const lastMessage = remainingMessages[remainingMessages.length - 1];
                const index = this.users.findIndex(u => u.userId === userId);

                if (index !== -1) {
                  if (lastMessage) {
                    this.users[index].lastMessageContent = lastMessage.content;
                    this.users[index].lastMessageSenderId = lastMessage.sender_id;
                  } else {
                    this.users[index].lastMessageContent = 'chat vazio';
                    this.users[index].lastMessageSenderId = undefined;
                  }
                }
              }
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
    input.accept = 'image/*'; //aceita apenas arquivos de imagem
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadChatImage(file); //chama a função de upload se um arquivo for selecionado
      }
    };
    input.click(); //simula o clique no input de arquivo
  }

  //envia uma imagem para o servidor
  uploadChatImage(file: File) {
    const formData = new FormData();
    formData.append('image', file); //adiciona o arquivo à FormData

    this.http.post('http://localhost:8085/api/upload', formData).subscribe({
      next: (res: any) => {
        const imageUrl = res.url; //obtém o URL da imagem da resposta
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

  //exibição de informações de mensagem na lista de chat
  getPreviewWithSender(user: any): string {
    const content = user.lastMessageContent;

    //se não tiver nenhuma mensagem, mostra "chat vazio"
    if (!content || content.trim() === '') {
      return 'chat vazio';
    }

    //se for imagem, mostra como "[imagem]"
    const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(content);
    const displayContent = isImage ? '[imagem]' : content;

    //prefixo de quem enviou a última mensagem
    const senderId = user.lastMessageSenderId;
    const prefix = senderId === this.loggedInUserId ? 'eu' : user.username;

    return `${prefix}: ${displayContent}`;
  }

  //alterna a exibição das opções de um usuário
  toggleOptions(userId: number): void {
    this.activeOptionsUserId = this.activeOptionsUserId === userId ? null : userId;
  }

  //para deletar o chat
  deleteChat(user: ChatUser): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja deletar este chat?<br>Não se preocupe, as mensagens deste chat não<br>serão apagadas se voltar.',
      header: 'Deletar chat',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Deletar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-confirm-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        if (!this.loggedInUserId) return;

        this.http.post<any>('http://localhost:8085/api/deleted-chats', {
          user_id: this.loggedInUserId,
          other_user_id: user.userId
        }).subscribe({
          next: res => {
            if (res.status) {
              this.users = this.users.filter(u => u.userId !== user.userId); //remove o chat da lista
              this.originalUsers = [...this.users]; //atualiza a lista original
              this.messageService.add({ severity: 'success', summary: 'Chat excluído com sucesso!' });
            } else {
              //--
            }
          },
          error: err => {
            console.error(err);
          }
        });

        this.activeOptionsUserId = null; //esconde as opções após a ação
      }
    });
  }

  //alterna a visibilidade das opções do cabeçalho do chat
  toggleChatHeaderOptions(): void {
    this.showChatHeaderOptions = !this.showChatHeaderOptions;
  }

  //exclui todas as mensagens de um chat
  deleteAllMessages(otherUserId: number): void {
    if (!this.loggedInUserId) return;

    this.confirmationService.confirm({
      message: 'Tem certeza que deseja apagar todas<br>as mensagens nesse chat?<br><b><i>Essa ação é irreversível.</b></i>',
      header: 'Deletar todas as mensagens',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Deletar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-confirm-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.http.post<any>('http://localhost:8085/api/delete-messages-only', {
          user_id: this.loggedInUserId,
          other_user_id: otherUserId
        }).subscribe({
          next: res => {
            if (res.status) {
              this.chatMessages = []; //limpa as mensagens exibidas no chat

              const userIndex = this.users.findIndex(u => u.userId === otherUserId);
              if (userIndex !== -1) {
                this.users[userIndex].lastMessageContent = 'chat vazio'; //atualiza a última mensagem na lista de chats
                this.users[userIndex].lastMessageSenderId = undefined;
              }

              this.messageService.add({ severity: 'success', summary: 'Mensagens apagadas!' });
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: res.message });
            }
          },
          error: err => {
            console.error(err);
          }
        });

        this.showChatHeaderOptions = false; //esconde as opções do cabeçalho
      }
    });
  }

  //fecha opções e menu ao clicar em qualquer lugar do documento
  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeOptionsUserId = null;
    this.showChatHeaderOptions = false;
  }

}
