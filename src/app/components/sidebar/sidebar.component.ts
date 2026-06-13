import { Component, inject, input, output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: `
    <!-- Mobile Navigation Bar -->
    <div class="mobile-header">
      <div class="mobile-brand">
        <span class="material-symbols-rounded brand-icon">medical_services</span>
        <span class="mobile-title">Aetheris</span>
      </div>
      <button 
        class="mobile-menu-toggle" 
        (click)="toggleMobileMenu()" 
        aria-label="Toggle Navigation Menu"
      >
        <span class="material-symbols-rounded">
          {{ isMobileMenuOpen() ? 'close' : 'menu' }}
        </span>
      </button>
    </div>

    <!-- Mobile Dropdown Menu -->
    @if (isMobileMenuOpen()) {
      <div class="mobile-menu-overlay fade-in" (click)="toggleMobileMenu()"></div>
      <div class="mobile-dropdown-menu slide-in">
        <div class="mobile-profile-summary">
          <div class="avatar">
            <span>{{ getUserInitials() }}</span>
          </div>
          <div>
            <h4>{{ authService.currentUser()?.username }}</h4>
            <p>{{ authService.currentUser()?.role }}</p>
          </div>
        </div>

        <nav class="mobile-nav-links">
          <button 
            [class.active]="activeTab() === 'overview'" 
            (click)="selectTab('overview')"
          >
            <span class="material-symbols-rounded">dashboard</span> Overview
          </button>
          
          <button 
            [class.active]="activeTab() === 'inventory'" 
            (click)="selectTab('inventory')"
          >
            <span class="material-symbols-rounded">inventory</span> Manage Inventory
          </button>

          <button 
            [class.active]="activeTab() === 'reports'" 
            (click)="selectTab('reports')"
          >
            <span class="material-symbols-rounded">description</span> Reports Module
          </button>
        </nav>

        <div class="mobile-footer">
          <button class="btn btn-outline logout-btn" (click)="onLogout()">
            <span class="material-symbols-rounded">logout</span> Sign Out
          </button>
        </div>
      </div>
    }

    <!-- Desktop Sidebar -->
    <aside class="desktop-sidebar">
      <div class="brand-section">
        <span class="material-symbols-rounded brand-logo">medical_services</span>
        <div>
          <h3>AETHERIS</h3>
          <p>Medical Shop System</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button 
          [class.active]="activeTab() === 'overview'" 
          (click)="selectTab('overview')"
          class="nav-link"
        >
          <span class="material-symbols-rounded">dashboard</span>
          <span>Overview</span>
        </button>

        <button 
          [class.active]="activeTab() === 'inventory'" 
          (click)="selectTab('inventory')"
          class="nav-link"
        >
          <span class="material-symbols-rounded">inventory</span>
          <span>Manage Inventory</span>
        </button>

        <button 
          [class.active]="activeTab() === 'reports'" 
          (click)="selectTab('reports')"
          class="nav-link"
        >
          <span class="material-symbols-rounded">description</span>
          <span>Reports & Analytics</span>
        </button>
      </nav>

      <div class="profile-section">
        <div class="profile-card">
          <div class="profile-avatar">
            <span>{{ getUserInitials() }}</span>
          </div>
          <div class="profile-info">
            <h4 class="profile-name">{{ authService.currentUser()?.username }}</h4>
            <span class="profile-role">{{ authService.currentUser()?.role }}</span>
          </div>
        </div>

        <button class="btn logout-btn" (click)="onLogout()">
          <span class="material-symbols-rounded">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    /* Desktop Sidebar Styles */
    .desktop-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background-color: var(--bg-sidebar);
      color: white;
      display: flex;
      flex-direction: column;
      padding: 2rem 1.5rem;
      z-index: 100;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 3rem;
      padding-left: 0.5rem;
    }

    .brand-logo {
      font-size: 2.25rem;
      color: var(--secondary);
      background: rgba(26, 188, 156, 0.15);
      padding: 0.5rem;
      border-radius: var(--radius-sm);
    }

    .brand-section h3 {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: white;
    }

    .brand-section p {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.25rem;
      color: rgba(255, 255, 255, 0.6);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      font-size: 0.95rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      width: 100%;
    }

    .nav-link span {
      display: inline-block;
    }

    .nav-link:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.05);
    }

    .nav-link.active {
      color: white;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      box-shadow: 0 4px 12px rgba(26, 188, 156, 0.15);
      font-weight: 600;
    }

    .profile-section {
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
    }

    .profile-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--secondary), var(--primary));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      border: 2px solid rgba(255, 255, 255, 0.15);
    }

    .profile-info {
      overflow: hidden;
    }

    .profile-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-role {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      display: block;
    }

    .logout-btn {
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.65rem;
      font-size: 0.85rem;
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.2);
    }

    /* Mobile Header & Navbar Styles */
    .mobile-header {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 60px;
      background-color: var(--bg-sidebar);
      color: white;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      z-index: 101;
      box-shadow: var(--shadow-sm);
    }

    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mobile-brand .brand-icon {
      color: var(--secondary);
      font-size: 1.75rem;
    }

    .mobile-title {
      font-weight: 700;
      letter-spacing: 0.05em;
      font-size: 1.1rem;
    }

    .mobile-menu-toggle {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mobile-menu-toggle span {
      font-size: 1.75rem;
    }

    .mobile-menu-overlay {
      position: fixed;
      top: 60px;
      left: 0;
      width: 100vw;
      height: calc(100vh - 60px);
      background-color: rgba(18, 30, 54, 0.5);
      z-index: 99;
      backdrop-filter: blur(4px);
    }

    .mobile-dropdown-menu {
      position: fixed;
      top: 60px;
      left: 0;
      width: 100%;
      background-color: var(--bg-sidebar);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 100;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-height: calc(100vh - 60px);
      overflow-y: auto;
    }

    .mobile-profile-summary {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
    }

    .mobile-profile-summary .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.85rem;
    }

    .mobile-profile-summary h4 {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .mobile-profile-summary p {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mobile-nav-links button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.6);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      font-size: 0.95rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      width: 100%;
    }

    .mobile-nav-links button:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.03);
    }

    .mobile-nav-links button.active {
      color: white;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
    }

    .mobile-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1rem;
    }

    .mobile-footer .logout-btn {
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.2);
    }

    /* Responsiveness Rules for Menu Toggling */
    @media (max-width: 1024px) {
      .desktop-sidebar {
        display: none;
      }
      
      .mobile-header {
        display: flex;
      }
    }
  `]
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  
  // Signal inputs and outputs
  readonly activeTab = input<string>('overview');
  readonly tabChanged = output<string>();

  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  selectTab(tab: string): void {
    this.tabChanged.emit(tab);
    this.isMobileMenuOpen.set(false);
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'MD';
    return user.username
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
