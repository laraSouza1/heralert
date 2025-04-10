import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [TableModule, ButtonModule, TagModule, MenuModule, ToastModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {

  tag: string = 'tag';
  isFavorite = false;
  likes = 876;
  isComment = false;
  comments = 37;
  isSave = false;
  items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                items: [
                    {
                        label: 'Bloquear usuário',
                        icon: 'pi pi-refresh'
                    },
                    {
                        label: 'Denunciar postagem',
                        icon: 'pi pi-upload'
                    },
                    {
                        label: 'Denunciar postagem',
                        icon: 'pi pi-upload'
                    }
                ]
            }
        ];
    }

toggleFavorite() {
  this.isFavorite = !this.isFavorite;
  this.likes += this.isFavorite ? 1 : -1;
}

toggleComment() {
  this.isComment = !this.isComment;
  this.comments += this.isComment ? 1 : -1;
}

toggleSave() {
  this.isSave = !this.isSave;
}
}
