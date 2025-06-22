import { CommonModule, NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-see-comment-report-detail',
  imports: [
    CommonModule, NgIf
  ],
  templateUrl: './see-comment-report-detail.component.html',
  styleUrl: './see-comment-report-detail.component.css'
})
export class SeeCommentReportDetailComponent implements OnChanges {
  @Input() report: any;

  constructor(private router: Router) { }

  //detecta mudanças na propriedade report e mostra o valor atual
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report'] && changes['report'].currentValue) {
      console.log('Denúncia de comentário recebida:', this.report);
    }
  }

  //para link do post
  getPostLink(): string {
    if (!this.report || !this.report.post_id || !this.report.post_title) return '#';
    const slugTitle = this.slugify(this.report.post_title); //converte o título em um formato de url
    return `${window.location.origin}/view-post/${this.report.post_id}-${slugTitle}`; //constrói url
  }

  slugify(text: string): string {
    //converte uma string em um slug (url)
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  //navega até perfil numa nova aba
  goToProfile(userId: number, username: string): void {
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank');
  }
}
