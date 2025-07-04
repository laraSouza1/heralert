import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { HttpClient } from '@angular/common/http';
import { BlockService } from '../../../services/block/block.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PostComponent } from '../../shared/post/post.component';

@Component({
  selector: 'app-posts-fy',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PostComponent, IconFieldModule, InputTextModule,
    ButtonModule, InputIcon, SelectModule, ConfirmDialogModule
  ],
  templateUrl: './posts-fy.component.html',
  styleUrls: ['./posts-fy.component.css']
})
export class PostsFYComponent {

  @Input() posts: any[] = [];
  @Input() currentUserId: any;
  searchTerm = '';
  isLoading = false;

  constructor(private http: HttpClient, private blockService: BlockService) { }

  ngOnInit(): void {

    //recupera informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
        this.loadPosts();
      });
    }
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadPosts();
  }

  //fetch de todos os posts
  loadPosts() {

    this.isLoading = true;

    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      const blockedUsers = this.blockService['blockedUsers'];
      const usersWhoBlockedMe = this.blockService['usersWhoBlockedMe'];

      this.http.get<any>(`http://localhost:8085/api/posts`, {
        params: {
          userId: this.currentUserId.toString(),
          search: this.searchTerm
        }
      }).subscribe({
        next: (response) => {
          if (response.status) {
            this.posts = response.data.filter((post: any) =>
              !blockedUsers.has(post.user_id) && !usersWhoBlockedMe.has(post.user_id)
            );
          }
        },
        error: (err) => {
          console.error('Erro ao carregar posts:', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    });
  }

  //att os bloqueios e recarrega postagens
  onUserBlocked() {
    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      this.loadPosts();
    });
  }
}
