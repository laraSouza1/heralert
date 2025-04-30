import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CreatePostComponent } from '../../shared/create-post/create-post.component';
import { LeftSideComponent } from '../../shared/left-side/left-side.component';
import { PostComponent } from '../../shared/post/post.component';
import { RightSideComponent } from '../../shared/right-side/right-side.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-communities',
  providers: [MessageService, ConfirmationService],
    imports: [
      LeftSideComponent, RightSideComponent, ButtonModule, IconFieldModule, InputTextModule,
      DialogModule, ConfirmDialogModule, ToastModule, RippleModule,
      CommonModule, TooltipModule, SelectModule, FormsModule
    ],
  templateUrl: './communities.component.html',
  styleUrl: './communities.component.css'
})
export class CommunitiesComponent {


  constructor(private router: Router) { }

  navigateToAG() {
    this.router.navigate(['/assuntos-gerais']);
  }

  navigateToAF() {
    this.router.navigate(['/autocuidados-femininos']);
  }

  navigateToDA() {
    this.router.navigate(['/dicas-defesa']);
  }

  navigateToRL() {
    this.router.navigate(['/reco-locais']);
  }

  navigateToAIF() {
    this.router.navigate(['/autocuidados-if']);
  }

}
