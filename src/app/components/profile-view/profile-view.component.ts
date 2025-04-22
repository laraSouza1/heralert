import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule, NgFor } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { ProfileUserViewComponent } from '../profile-user-view/profile-user-view.component';
import { PostComponent } from '../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-profile-view',
  providers: [MessageService, ConfirmationService],
  imports: [RightSideComponent,
    LeftSideComponent,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ButtonModule,
    MenubarModule,
    CommonModule,
    ProfileUserViewComponent,
    PostComponent,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css'
})
export class ProfileViewComponent implements OnInit {

  user: any;
  userPosts: any[] = [];

  constructor(private messageService: MessageService, private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.loadUser(username);
      }
    });
  }

  loadUser(username: string): void {
    this.http.get<any>(`http://localhost:8085/api/users/username/${username}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.user = res.data;

          const date = new Date(this.user.created_at);
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          this.user.memberSince = `Membro desde ${meses[date.getMonth()]} ${date.getFullYear()}`;

          this.loadUserPosts(this.user.id);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
      }
    });
  }

  loadUserPosts(userId: string): void {
    this.http.get<any>(`http://localhost:8085/api/posts/user/${userId}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.userPosts = res.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar posts do usuário:', err);
      }
    });
  }

}
