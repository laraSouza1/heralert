import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tags',
  imports: [
    InputIconModule, IconFieldModule, InputText,
    CommonModule
  ],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})
export class TagsComponent implements OnInit {

  tags: { tag: string, count: number }[] = [];
  searchTerm = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadTags();
  }

  //pesquisar
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadTags();
  }

  //encaminha para a tag clicada
  goToTag(tag: string): void {
    this.router.navigate(['/post-tag'], { queryParams: { tag } });
  }

  //fetch todas as tags
  loadTags(): void {
    this.http.get<any>('http://localhost:8085/api/tags', {
      params: { search: this.searchTerm }
    }).subscribe({
      next: (res) => {
        if (res.status) {
          this.tags = res.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar tags:', err);
      }
    });
  }
}
