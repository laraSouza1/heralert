import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { HttpClient } from '@angular/common/http';

interface Comunity {
  name: string;
  code: string;
}

@Component({
  selector: 'app-posts-fy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PostComponent,
    IconFieldModule,
    InputTextModule,
    ButtonModule,
    InputIcon,
    SelectModule
  ],
  templateUrl: './posts-fy.component.html',
  styleUrls: ['./posts-fy.component.css']
})
export class PostsFYComponent {
  @Input() posts: any[] = [];
  @Input() currentUserId: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
    }

    this.http.get<any>('http://localhost:8085/api/posts', {
      params: { userId: this.currentUserId }
    }).subscribe(response => {
      if (response.status) {
        this.posts = response.data;
      }
    });

  }

}
