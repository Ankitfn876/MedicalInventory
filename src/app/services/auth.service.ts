import { Injectable, signal, computed } from '@angular/core';

export interface User {
  username: string;
  role: string;
  loginTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'med_shop_auth_session';

  // Signal holding current logged-in user state
  private readonly _currentUser = signal<User | null>(null);
  
  // Public read-only signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  constructor() {
    // Check sessionStorage on initialization
    try {
      const savedSession = sessionStorage.getItem(this.STORAGE_KEY);
      if (savedSession) {
        this._currentUser.set(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error('Failed to parse saved auth session from sessionStorage', e);
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Log the user in.
   * In this demo, credentials are blank by default, and validation is bypassed.
   */
  login(username?: string, password?: string): boolean {
    const defaultUser: User = {
      username: (username && username.trim()) ? username.trim() : 'Chief Pharmacist',
      role: 'Administrator',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUser));
      this._currentUser.set(defaultUser);
      return true;
    } catch (e) {
      console.error('Failed to write auth session to sessionStorage', e);
      return false;
    }
  }

  /**
   * Log the user out and clear the session storage.
   */
  logout(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth session from sessionStorage', e);
    }
    this._currentUser.set(null);
  }
}
