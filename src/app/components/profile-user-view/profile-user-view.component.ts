import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-user-view',
  imports: [],
  templateUrl: './profile-user-view.component.html',
  styleUrl: './profile-user-view.component.css'
})
export class ProfileUserViewComponent {
  @Input() user: any;
}
