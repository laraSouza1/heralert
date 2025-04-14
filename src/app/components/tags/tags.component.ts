import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-tags',
  imports: [
    InputIconModule,
    IconFieldModule,
    InputText,
    CommonModule
  ],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})
export class TagsComponent implements OnInit {
  tags: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadTags();
  }

  //puxa tags
  loadTags(): void {
    this.http.get<any>('http://localhost:8085/api/tags').subscribe({
      next: (res) => {
        if (res.status) {
          this.tags = res.data.map((t: any) => t.tag);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar tags:', err);
      }
    });
  }
}
