import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { TextareaModule } from 'primeng/textarea';

export interface User {
  photo: any;
  name: string;
  text: string;
}

@Component({
  selector: 'app-right-side',
  standalone: true,
  imports: [TableModule, CommonModule, IconField, InputIcon, InputTextModule, ContextMenu, TextareaModule],
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.css'],
})
export class RightSideComponent implements OnInit {

  users!: User[];
  items: MenuItem[] | undefined;
  selectedUser: User | null = null;
  tableHeight = '80%';
  isExpanded = false;
  expandedUser: User | null = null;

  @ViewChild('dt2') dt2!: Table;

  ngOnInit() {
    this.getUsersMini().then((data) => {
      this.users = data;
    });

    this.items = [
      { label: 'Copy', icon: 'pi pi-copy' },
      { label: 'Rename', icon: 'pi pi-file-edit' }
    ];
  }

  getUsersMini(): Promise<User[]> {
    return Promise.resolve([
      { photo: 'https://imgur.com/ryhUuwt.jpg', name: 'Lara Souza', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/eVQoJev.jpg', name: 'Marta Vieira', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/sUneSpB.jpg', name: 'Laura Ribeiro', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/Y2CBEhe.jpg', name: 'Vanda Emir', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/TehLC05.jpg', name: 'Roberta Carla', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/mIEx7f6.jpg', name: 'Priscila Silva', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/ryhUuwt.jpg', name: 'Lara Souza', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/eVQoJev.jpg', name: 'Marta Vieira', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
      { photo: 'https://imgur.com/sUneSpB.jpg', name: 'Laura Ribeiro', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
    ]);
  }

  onRowClick(user: User): void {
    this.expandedUser = user;
    this.isExpanded = true;
    this.tableHeight = '20%';
  }

  closeDiv(): void {
    this.isExpanded = false;
    this.tableHeight = '80%';
    this.expandedUser = null;
  }

  filterUsers(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.dt2) {
      this.dt2.filterGlobal(input.value, 'contains');
    }
  }
}
