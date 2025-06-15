import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { ApiResponse } from '../../shared/models/ApiResponse';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-see-post-report-detail',
  imports: [
    CommonModule, NgIf
  ],
  templateUrl: './see-post-report-detail.component.html',
  styleUrl: './see-post-report-detail.component.css'
})
export class SeePostReportDetailComponent {

  @Input() report: any;

  constructor(
    private router: Router
  ) { }

  //detecta mudanças na propriedade report e mostra o valor atual
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report'] && changes['report'].currentValue) {
      console.log('Denúncia recebida:', this.report);
    }
  }

  //para link do post
  getPostLink(): string {
    if (!this.report || !this.report.post_id || !this.report.post_title) return '#';
    const slugTitle = this.slugify(this.report.post_title); //converte o título em um formato de url
    return `${window.location.origin}/view-post/${this.report.post_id}-${slugTitle}`; //constrói url
  }

  slugify(text: string): string {
    // Converte uma string em um slug (url)
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  //navega para a página de perfil do usuário em uma nova aba
  goToProfile(userId: number, username: string): void {
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank');
  }
}