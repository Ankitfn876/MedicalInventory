import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glow-sphere sphere-1"></div>
      <div class="glow-sphere sphere-2"></div>
      
      <div class="glass-card login-card slide-in">
        <div class="brand-header">
          <span class="material-symbols-rounded brand-icon">medical_services</span>
          <h2>Aetheris Medical</h2>
          <p>Inventory Control Portal</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <div class="input-wrapper">
              <span class="material-symbols-rounded input-icon">person</span>
              <input 
                type="text" 
                id="username" 
                name="username" 
                class="form-control field-with-icon" 
                placeholder="Enter username"
                [(ngModel)]="username"
                autocomplete="off"
                aria-label="Username field"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="input-wrapper">
              <span class="material-symbols-rounded input-icon">lock</span>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control field-with-icon" 
                placeholder="Enter password"
                [(ngModel)]="password"
                aria-label="Password field"
              />
            </div>
          </div>

          <div class="info-note">
            <span class="material-symbols-rounded info-note-icon">info</span>
            <span>Demo Mode: You can leave fields blank and click Login.</span>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block submit-btn"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span> Logging in...
            } @else {
              <span class="material-symbols-rounded">login</span> Login to System
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle at 10% 20%, hsl(220, 40%, 12%) 0%, hsl(220, 45%, 8%) 90%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: var(--font-family);
    }

    /* Ambient glow elements */
    .glow-sphere {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.15;
      z-index: 1;
    }
    .sphere-1 {
      width: 400px;
      height: 400px;
      background-color: var(--primary);
      top: -100px;
      left: -100px;
    }
    .sphere-2 {
      width: 500px;
      height: 500px;
      background-color: var(--secondary);
      bottom: -150px;
      right: -150px;
    }

    .login-card {
      width: 90%;
      max-width: 420px;
      padding: 2.5rem;
      z-index: 10;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border-radius: var(--radius-lg);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-icon {
      font-size: 2.5rem;
      color: var(--secondary);
      background: rgba(26, 188, 156, 0.1);
      padding: 0.75rem;
      border-radius: 50%;
      margin-bottom: 0.75rem;
      display: inline-block;
      box-shadow: 0 0 15px rgba(26, 188, 156, 0.2);
    }

    .brand-header h2 {
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: -0.02em;
    }

    .brand-header p {
      color: var(--text-light);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      color: rgba(255, 255, 255, 0.8) !important;
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.25rem;
    }

    .field-with-icon {
      padding-left: 2.75rem !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: white !important;
      width: 100%;
    }
    .field-with-icon::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    .field-with-icon:focus {
      border-color: var(--secondary) !important;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.25) !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }

    .info-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.15);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
      color: #93c5fd;
    }

    .info-note-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .btn-block {
      width: 100%;
    }

    .submit-btn {
      padding: 0.85rem;
      font-size: 0.95rem;
      letter-spacing: 0.01em;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  username = '';
  password = '';
  isLoading = signal(false);

  onSubmit(): void {
    this.isLoading.set(true);
    // Mimic API delay for dynamic visual polish
    setTimeout(() => {
      this.authService.login(this.username, this.password);
      this.isLoading.set(false);
    }, 600);
  }
}
