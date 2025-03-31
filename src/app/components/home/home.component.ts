import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuBarComponent } from "../shared/menu-bar/menu-bar.component";
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, MenubarModule, SkeletonModule, MenuBarComponent, FooterComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) {}

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }

}
