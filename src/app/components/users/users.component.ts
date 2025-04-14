import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-users',
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
    CommonModule,
    ButtonModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  //puxa todos os users
  loadUsers(): void {
    this.http.get<any>('http://localhost:8085/api/users').subscribe({
      next: (res) => {
        if (res.status) {
          this.users = res.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
  }
}
