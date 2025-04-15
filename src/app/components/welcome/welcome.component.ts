import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuBarComponent } from "../shared/menu-bar/menu-bar.component";
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-welcome',
  imports: [ButtonModule, MenubarModule, SkeletonModule, MenuBarComponent, FooterComponent],
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  constructor(private router: Router) {}

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }

}
