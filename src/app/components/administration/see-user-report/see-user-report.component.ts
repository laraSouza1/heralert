import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-see-user-report',
  imports: [
    CommonModule, NgIf
  ],
  templateUrl: './see-user-report.component.html',
  styleUrl: './see-user-report.component.css'
})
export class SeeUserReportComponent {

  @Input() report: any;

  constructor(private router: Router) { }

  //converte o role para texto
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

  //navega para o perfil numa nova aba
  goToProfile(userId: number, username: string): void {
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank');
  }

}
