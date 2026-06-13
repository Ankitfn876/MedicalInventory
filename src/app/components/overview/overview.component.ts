import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryItem } from '../../services/inventory.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container fade-in">
      <div class="header-section">
        <h1>Dashboard Overview</h1>
        <p>Aetheris Medical shop real-time telemetry and inventory statistics.</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <!-- Card 1: Total Items -->
        <div class="glass-card stat-card border-primary">
          <div class="stat-icon-wrapper bg-primary-light">
            <span class="material-symbols-rounded color-primary">inventory</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total SKUs</span>
            <h2 class="stat-value">{{ inventoryService.totalItems() }}</h2>
            <span class="stat-trend trend-neutral">Unique medical items</span>
          </div>
        </div>

        <!-- Card 2: Total Inventory Value -->
        <div class="glass-card stat-card border-secondary">
          <div class="stat-icon-wrapper bg-secondary-light">
            <span class="material-symbols-rounded color-secondary">payments</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Value</span>
            <h2 class="stat-value">\${{ inventoryService.totalValue() | number:'1.2-2' }}</h2>
            <span class="stat-trend trend-up">Current valuation</span>
          </div>
        </div>

        <!-- Card 3: Low Stock Alerts -->
        <div class="glass-card stat-card border-warning">
          <div class="stat-icon-wrapper bg-warning-light">
            <span class="material-symbols-rounded color-warning">warning</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">Low Stock Alerts</span>
            <h2 class="stat-value text-warning">{{ inventoryService.lowStockCount() }}</h2>
            <span class="stat-trend trend-down">Quantity under 20 units</span>
          </div>
        </div>

        <!-- Card 4: Expired Items -->
        <div class="glass-card stat-card border-danger">
          <div class="stat-icon-wrapper bg-danger-light">
            <span class="material-symbols-rounded color-danger">error</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">Expired Batches</span>
            <h2 class="stat-value text-danger">{{ inventoryService.expiredCount() }}</h2>
            <span class="stat-trend trend-danger">Requires immediate removal</span>
          </div>
        </div>
      </div>

      <!-- Action Panel & Critical Stock Alerts -->
      <div class="overview-body-grid">
        <!-- Critical Warnings Section -->
        <div class="glass-card body-card">
          <div class="card-header">
            <h3>Critical System Alerts</h3>
            <span class="badge badge-warning">{{ getAlertsCount() }} Action Required</span>
          </div>
          
          <div class="alerts-list">
            @if (getAlertItems().length === 0) {
              <div class="empty-alerts">
                <span class="material-symbols-rounded check-icon">check_circle</span>
                <p>All stock levels are optimal and no items are expired.</p>
              </div>
            } @else {
              @for (item of getAlertItems(); track item.id) {
                <div class="alert-item" [class.alert-expired]="isExpired(item)">
                  <span class="material-symbols-rounded alert-item-icon">
                    {{ isExpired(item) ? 'gpp_bad' : 'emergency_home' }}
                  </span>
                  <div class="alert-item-details">
                    <h4>{{ item.name }}</h4>
                    <p>
                      Batch: <strong>{{ item.batchNumber }}</strong> &bull; 
                      Qty: <strong [class.text-danger]="item.quantity === 0">{{ item.quantity }} units</strong>
                    </p>
                  </div>
                  <div class="alert-badge-wrapper">
                    @if (isExpired(item)) {
                      <span class="badge badge-danger">Expired ({{ item.expiryDate }})</span>
                    } @else {
                      <span class="badge badge-warning">Low Stock ({{ item.quantity }} left)</span>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Quick Access panel -->
        <div class="glass-card body-card quick-actions-card">
          <div class="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div class="actions-grid">
            <button class="action-btn" (click)="navigateTo.emit('inventory')">
              <span class="material-symbols-rounded action-icon icon-primary">add_circle</span>
              <div class="action-text">
                <h4>Add New Item</h4>
                <p>Register a new batch</p>
              </div>
            </button>

            <button class="action-btn" (click)="navigateTo.emit('inventory')">
              <span class="material-symbols-rounded action-icon icon-secondary">edit_document</span>
              <div class="action-text">
                <h4>Manage Inventory</h4>
                <p>Edit or remove stock</p>
              </div>
            </button>

            <button class="action-btn" (click)="navigateTo.emit('reports')">
              <span class="material-symbols-rounded action-icon icon-teal">analytics</span>
              <div class="action-text">
                <h4>Weekly Audit</h4>
                <p>View weekly aggregates</p>
              </div>
            </button>

            <button class="action-btn" (click)="navigateTo.emit('reports')">
              <span class="material-symbols-rounded action-icon icon-amber">calendar_month</span>
              <div class="action-text">
                <h4>Monthly Summary</h4>
                <p>Review monthly logs</p>
              </div>
            </button>
          </div>

          <div class="info-banner">
            <span class="material-symbols-rounded info-banner-icon">shield</span>
            <div>
              <h5>Clinical Standards Compliant</h5>
              <p>State tracking is running in session mode. Data resides strictly inside browser memory.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .header-section h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .header-section p {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border-left: 4px solid transparent;
      border-radius: var(--radius-md);
    }

    .border-primary { border-left-color: var(--primary); }
    .border-secondary { border-left-color: var(--secondary); }
    .border-warning { border-left-color: var(--warning); }
    .border-danger { border-left-color: var(--danger); }

    .stat-icon-wrapper {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon-wrapper span {
      font-size: 1.75rem;
    }

    .bg-primary-light { background-color: var(--primary-light); }
    .color-primary { color: var(--primary); }
    
    .bg-secondary-light { background-color: var(--secondary-light); }
    .color-secondary { color: var(--secondary); }

    .bg-warning-light { background-color: var(--warning-light); }
    .color-warning { color: var(--warning); }

    .bg-danger-light { background-color: var(--danger-light); }
    .color-danger { color: var(--danger); }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0.2rem 0;
    }

    .stat-trend {
      font-size: 0.75rem;
      font-weight: 500;
    }
    .trend-neutral { color: var(--text-light); }
    .trend-up { color: var(--success); }
    .trend-down { color: var(--warning); }
    .trend-danger { color: var(--danger); }

    .overview-body-grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 1.5rem;
    }

    .body-card {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: 400px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.75rem;
    }

    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
      max-height: 320px;
      padding-right: 0.25rem;
    }

    .empty-alerts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-secondary);
      gap: 0.75rem;
    }

    .empty-alerts .check-icon {
      font-size: 3rem;
      color: var(--success);
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.25rem;
      border: 1px solid var(--warning-light);
      background-color: hsla(38, 95%, 95%, 0.4);
      border-radius: var(--radius-sm);
      transition: transform var(--transition-fast);
    }
    .alert-item:hover {
      transform: translateX(4px);
    }

    .alert-expired {
      border-color: var(--danger-light);
      background-color: hsla(355, 80%, 95%, 0.4);
    }

    .alert-item-icon {
      font-size: 1.5rem;
      padding: 0.4rem;
      border-radius: 50%;
      background: white;
    }

    .alert-item:not(.alert-expired) .alert-item-icon {
      color: var(--warning);
      border: 1px solid var(--warning-light);
    }

    .alert-expired .alert-item-icon {
      color: var(--danger);
      border: 1px solid var(--danger-light);
    }

    .alert-item-details {
      flex: 1;
    }

    .alert-item-details h4 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .alert-item-details p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }

    .alert-badge-wrapper {
      flex-shrink: 0;
    }

    /* Quick Actions panel */
    .quick-actions-card {
      justify-content: space-between;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid var(--border-light);
      background: white;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      transition: all var(--transition-fast);
    }
    .action-btn:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 1.5rem;
    }
    .icon-primary { color: var(--primary); }
    .icon-secondary { color: var(--secondary); }
    .icon-teal { color: hsl(175, 75%, 40%); }
    .icon-amber { color: hsl(38, 90%, 50%); }

    .action-text h4 {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .action-text p {
      font-size: 0.7rem;
      color: var(--text-secondary);
    }

    .info-banner {
      display: flex;
      gap: 0.75rem;
      background-color: var(--primary-light);
      border: 1px solid hsl(var(--primary-base), 90%, 85%);
      border-radius: var(--radius-sm);
      padding: 0.9rem 1.25rem;
      align-items: flex-start;
      margin-top: 1rem;
    }

    .info-banner-icon {
      color: var(--primary);
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .info-banner h5 {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
    }

    .info-banner p {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .overview-body-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OverviewComponent {
  readonly inventoryService = inject(InventoryService);
  
  readonly navigateTo = output<string>();

  getAlertItems(): InventoryItem[] {
    const todayStr = '2026-06-13'; // Standard mock date
    return this.inventoryService.items().filter(item => {
      const isExpired = item.expiryDate < todayStr;
      const isLowStock = item.quantity < 20;
      return isExpired || isLowStock;
    });
  }

  getAlertsCount(): number {
    return this.getAlertItems().length;
  }

  isExpired(item: InventoryItem): boolean {
    const todayStr = '2026-06-13';
    return item.expiryDate < todayStr;
  }
}
