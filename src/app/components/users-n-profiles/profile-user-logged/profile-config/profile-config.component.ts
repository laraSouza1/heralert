import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmailComponent } from '../config-options/email/email.component';
import { PasswordComponent } from '../config-options/password/password.component';
import { MyComplaintsComponent } from '../config-options/my-complaints/my-complaints.component';
import { ApiResponse } from '../../../shared/models/ApiResponse';

@Component({
  selector: 'app-profile-config',
  providers: [MessageService, ConfirmationService, DialogService],
  imports: [
    ButtonModule, ConfirmDialogModule, DialogModule,
    MenuModule, ToastModule, BlockedUsersComponent, CommonModule, EmailComponent, PasswordComponent,
    DynamicDialogModule, MyComplaintsComponent
  ],
  templateUrl: './profile-config.component.html',
  styleUrl: './profile-config.component.css'
})
export class ProfileConfigComponent implements OnInit {

  user: any;
  showBlockedDialog = false;
  blockedCount = 0;
  passwordMasked = '';
  showEmailDialog = false;
  showPasswordDialog = false;
  showComplaintsDialog = false;
  emailComponentVisible = true; newUpdatesAvailable = false;
  totalComplaintsCount: number = 0;

  @ViewChild(PasswordComponent) passwordComponent!: PasswordComponent;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    //recupera o user logado no localstorage
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.passwordMasked = '*'.repeat(this.user.password?.length || 0);
    this.loadBlockedCount(); //fetch nos users bloqueados
    this.loadComplaintCounts();
  }

  //para contagem de número de denúncias
  loadComplaintCounts(): void {
    if (!this.user?.id) return;

    //pega todas as denúncias feitas pelo user
    this.http.get<any>(`http://localhost:8085/api/reports/by-reporter/${this.user.id}`).subscribe({
      next: response => {
        if (response.status) {
          this.totalComplaintsCount = response.data.reports.length;
        } else {
          this.totalComplaintsCount = 0;
        }
      },
      error: error => {
        this.totalComplaintsCount = 0;
      }
    });

    //pega nova atualização de contagem
    this.http.get<any>(`http://localhost:8085/api/reports/unseen-updates/count/${this.user.id}`).subscribe({
      next: response => {
        if (response.status) {
          this.newUpdatesAvailable = response.data.newUpdatesCount > 0;
        } else {
          console.error(response.message);
          this.newUpdatesAvailable = false;
        }
      },
      error: error => {
        console.error(error);
        this.newUpdatesAvailable = false;
      }
    });
  }


  //navegações do menu ------------------------------------
  navigateToMyComplaints() {
    this.router.navigate(['/my-complaints']);
  }

  //modais -----------------------------------

  //modal de minhas denúncias
  abrirComplaints(): void {
    this.showComplaintsDialog = true;
    if (this.user?.id && this.newUpdatesAvailable) {
      //se houver novas atualizações, marca como vistas quando o modal for aberto
      this.http.put<ApiResponse>(`http://localhost:8085/api/reports/mark-seen/${this.user.id}`, {}).subscribe({
        next: (res: ApiResponse) => {
          if (res.status) {
            this.newUpdatesAvailable = false;
          } else {
            console.error(res.message);
          }
        },
        error: error => {
          console.error(error);
        }
      });
    }
  }

  //modal de users bloqueados
  abrirBlocked(): void {
    this.showBlockedDialog = true;
  }

  //modal email
  abrirEmail(): void {
    this.emailComponentVisible = true;
    this.showEmailDialog = true;
  }

  fecharEmail(email?: string) {
    this.emailComponentVisible = true;
    if (email) {
      this.user.email = email; //att somente se foi enviado um novo e-mail
    }
    this.showEmailDialog = false;
  }

  resetEmailComponent(): void {
    this.emailComponentVisible = false;
  }

  //modal palavra-passe
  abrirPassword(): void {
    this.showPasswordDialog = true;
  }

  //reset nos campos do componente password
  onPasswordDialogHide(): void {
    this.passwordComponent.resetFields();
  }

  //att senha e seu comprimento para exibição
  onPasswordUpdated(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}'); //atualiza o user do localStorage
    this.passwordMasked = '*'.repeat(this.user.password?.length || 0);
    this.showPasswordDialog = false;
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
