import { Component, inject, signal } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { OverviewComponent } from './components/overview/overview.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { ReportsComponent } from './components/reports/reports.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LoginComponent,
    SidebarComponent,
    OverviewComponent,
    InventoryComponent,
    ReportsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly authService = inject(AuthService);
  
  // Navigation active state
  readonly activeTab = signal<string>('overview');

  onTabChanged(tab: string): void {
    this.activeTab.set(tab);
  }
}
