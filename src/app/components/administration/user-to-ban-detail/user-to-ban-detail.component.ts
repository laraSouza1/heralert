import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../shared/models/ApiResponse';

@Component({
  selector: 'app-user-to-ban-detail',
  imports: [
    CommonModule, NgIf
  ],
  templateUrl: './user-to-ban-detail.component.html',
  styleUrl: './user-to-ban-detail.component.css'
})
export class UserToBanDetailComponent implements OnChanges {
  @Input() user: any;
  validReportsDetails: any[] = [];
  isLoadingDetails = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.validReportsDetails = []; //limpa detalhes anteriores
      this.loadValidReportDetails(this.user.user_id);
    }
  }

  //fetch nas denúncias válidas
  loadValidReportDetails(userId: number): void {
    this.isLoadingDetails = true;
    this.http.get<ApiResponse>(`http://localhost:8085/api/users/${userId}/valid-reports-details`)
      .subscribe({
        next: (res: ApiResponse) => {
          if (res.status) {
            this.validReportsDetails = res.data.validReports;
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: res.message || 'Nenhum detalhe de denúncia válida encontrado.',
            });
            this.validReportsDetails = [];
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar detalhes das denúncias válidas.',
          });
          this.validReportsDetails = [];
        },
        complete: () => {
          this.isLoadingDetails = false;
        },
      });
  }

  //converte role para texto
  getRoleName(role: number): string {
    switch (role) {
      case 2:
        return 'Criadora';
      case 1:
        return 'Administradora';
      case 0:
        return 'Usuária';
      default:
        return 'Desconhecido';
    }
  }

  //retorna o texto formatado para o status da denúncia
  getReportStatusText(status: string): string {
    switch (status) {
      case 'em_avaliacao':
        return 'Em avaliação';
      case 'nao_justificado':
        return 'Não válida';
      case 'justificado':
        return 'Válida';
      default:
        return status;
    }
  }

  //navega até perfil numa nova aba
  goToProfile(userId: number, username: string): void {
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank');
  }
}
