import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-tags-administration',
  providers: [ConfirmationService, MessageService],
  imports: [
    IconFieldModule, InputIconModule, InputTextModule, TableModule, CommonModule, ButtonModule, PaginatorModule,
    ToastModule, ConfirmDialogModule
  ],
  templateUrl: './tags-administration.component.html',
  styleUrl: './tags-administration.component.css'
})
export class TagsAdministrationComponent implements OnInit {

  tags: { tag: string, count: number }[] = [];
  searchTerm = '';
  page = 1;
  first = 0;
  limit = 9;
  totalTags = 0;
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

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
    this.isLoading = true;

    let params = new HttpParams()
      .set('search', this.searchTerm)
      .set('page', this.page.toString())
      .set('limit', this.limit.toString());

    this.http.get<any>('http://localhost:8085/api/tags', { params }).subscribe({
      next: (res) => {
        if (res.status) {
          this.tags = res.data;
          this.totalTags = res.total;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar tags:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.limit = event.rows;
    this.page = (event.first / event.rows) + 1;

    this.loadTags();
  }

  onSearchChange(): void {
    this.page = 1;
    this.first = 0;
    this.loadTags();
  }

  //handle para deletar uma tag
  handleDeleteTag(tagToDelete: string): void {
    this.confirmationService.confirm({
      //header + mensagem + icon
      message: `Tem certeza que deseja excluir a tag "<span class="font-medium text-red-500">${tagToDelete}</span>"?<br>Isso removerá a tag de todos os posts associados.<br><br><b><i><span class="font-medium text-red-500">Apenas delete a tag caso ela contenha conteúdo<br>ofensivo ou inapropriado!</span></i></b>`,
      header: 'Excluir Tag',
      icon: 'pi pi-exclamation-triangle',
      //btns
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      //style dos btns
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      //em caso de aceitação, deleta no back
      accept: () => {
        this.http.delete<any>(`http://localhost:8085/api/tags/${tagToDelete}`).subscribe({
          next: response => {
            if (response.status) {
              this.messageService.add({ severity: 'success', summary: `Tag "${tagToDelete}" excluída com sucesso!` });
              this.loadTags();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Erro ao excluir tag' });
            }
          },
          error: error => {
            console.error('Erro ao excluir tag', error);
            this.messageService.add({ severity: 'error', summary: 'Erro ao excluir tag' });
          }
        });
      }
    });
  }

}
