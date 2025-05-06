import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { BlockedUsersComponent } from '../config-options/blocked-users/blocked-users.component';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-profile-config',
  providers: [MessageService, ConfirmationService],
  imports: [
    LeftSideComponent, RightSideComponent, ButtonModule, ConfirmDialogModule, DialogModule,
    MenuModule, ToastModule, BlockedUsersComponent, CommonModule
  ],
  templateUrl: './profile-config.component.html',
  styleUrl: './profile-config.component.css'
})
export class ProfileConfigComponent implements OnInit {

  user: any;
  showBlockedDialog = false;
  blockedCount = 0;
  passwordMasked = '';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    //recupera o user logado no localstorage
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.passwordMasked = '*'.repeat(this.user.password?.length || 0);
    this.loadBlockedCount(); //fetch nos users bloqueados
  }

  //abre modal de users bloqueados
  abrirBlocked(): void {
    this.showBlockedDialog = true;
  }

  //fwtch users bloqueados
  loadBlockedCount(): void {
    //recupera o user logado no localstorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    //busca users bloqueados
    this.http.get<any>(`http://localhost:8085/api/blocks/${currentUser.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.blockedCount = res.data.length;
        }
      },
      error: (err) => console.error('Erro ao carregar contagem de bloqueados:', err)
    });
  }

  //confirmdialog para excluir conta
  handleDeleteAccount(): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir sua conta?<br><b>Essa ação é <i>irreversível.</i></b>`,
      header: 'Excluir conta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //style dos btns do modal
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        //recupera o user logado no localstorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        //delete do user em caso de accept
        this.http.delete(`http://localhost:8085/api/users/${currentUser.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Conta excluída com sucesso!' });
            localStorage.clear(); //limpa localstorage
            setTimeout(() => this.router.navigate(['/welcome']), 1000); //volta para o welcome da app
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro ao excluir conta.' });
          }
        });
      }
    });
  }
}
