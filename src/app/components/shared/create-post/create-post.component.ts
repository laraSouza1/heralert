import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Validators } from '@angular/forms';

interface Comunity {
  name: string;
  code: string;
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    EditorModule, ReactiveFormsModule, InputTextModule, FormsModule,
    ButtonModule, PasswordModule, MessageModule, CommonModule, TagModule, SelectModule
  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css',
})
export class CreatePostComponent {

  private http = inject(HttpClient);

  title: string = '';
  tags: string[] = [];
  newTag: string = '';
  formGroup: FormGroup | any;
  comunities: Comunity[] | undefined;
  selectedComunity: Comunity | undefined;
  editMode: boolean = false;
  editingPostId: number | null = null;

  ngOnInit() {
    this.formGroup = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(60)]),
      text: new FormControl('', [Validators.required]),
      community: new FormControl('', [Validators.required])
    });

    this.comunities = [
      { name: 'Recomendações de Locais', code: 'Recomendações de Locais' },
      { name: 'Autocuidados Gerais', code: 'Autocuidados Gerais' },
      { name: 'Autocuidados Íntimos Femininos', code: 'Autocuidados Íntimos Femininos' },
      { name: 'Dicas de Autodefesa', code: 'Dicas de Autodefesa' },
      { name: 'Assuntos Gerais', code: 'Assuntos Gerais' }
    ];
  }

  setEditPost(post: any) {
    this.editMode = true;
    this.editingPostId = post.id;
    this.formGroup.patchValue({
      title: post.title,
      text: post.content,
      community: this.comunities?.find(c => c.code === post.community) || null
    });
    this.tags = [...post.tags];
    this.newTag = '';
  }

  resetForm() {
    this.editMode = false;
    this.editingPostId = null;
    this.title = '';
    this.tags = [];
    this.newTag = '';
    this.selectedComunity = undefined;
    this.formGroup?.reset();
  }

  addTag(event: Event) {
    event.preventDefault();
    if (this.newTag.trim() && this.tags.length < 20) {
      const formattedTag = this.newTag.trim().toLowerCase();
      if (!this.tags.includes(formattedTag)) {
        this.tags.push(formattedTag);
      }
    }
    this.newTag = '';
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }
}
