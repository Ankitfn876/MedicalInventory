import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem } from '../../services/inventory.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container fade-in">
      <div class="header-section">
        <h1>Reports & Analytics</h1>
        <p>Analyze medical shop stock levels, filter additions, and review weekly/monthly aggregates.</p>
      </div>

      <!-- Navigation for report sub-tabs -->
      <div class="glass-card report-selector-card">
        <div class="report-tabs">
          <button 
            [class.active]="selectedTab() === 'weekly'" 
            (click)="selectedTab.set('weekly')"
            class="report-tab-btn"
          >
            <span class="material-symbols-rounded">calendar_view_week</span>
            <span>Weekly Report</span>
          </button>
          
          <button 
            [class.active]="selectedTab() === 'monthly'" 
            (click)="selectedTab.set('monthly')"
            class="report-tab-btn"
          >
            <span class="material-symbols-rounded">calendar_view_month</span>
            <span>Monthly Report</span>
          </button>
          
          <button 
            [class.active]="selectedTab() === 'datewise'" 
            (click)="selectedTab.set('datewise')"
            class="report-tab-btn"
          >
            <span class="material-symbols-rounded">calendar_today</span>
            <span>Date-Wise Filter</span>
          </button>
        </div>

        @if (selectedTab() === 'datewise') {
          <div class="selected-date-badge fade-in">
            <span class="material-symbols-rounded text-secondary">event</span>
            <span>Active Date: <strong>{{ filterDate() }}</strong></span>
          </div>
        }
      </div>

      <!-- Main Report Display Content -->
      <div class="report-content-grid">
        
        <!-- Summary Cards column -->
        <div class="summary-info-column">
          
          <!-- Key Indicators Card -->
          <div class="glass-card metrics-card">
            <h3>{{ getReportTitle() }} Metrics</h3>
            <div class="divider"></div>
            
            <div class="report-stat-rows">
              <div class="report-stat-row">
                <span class="label">Total Items Added</span>
                <span class="value color-primary">{{ reportStats().addedCount }}</span>
              </div>
              <div class="report-stat-row">
                <span class="label">Total Quantity Added</span>
                <span class="value color-secondary">{{ reportStats().addedQuantity }} units</span>
              </div>
              <div class="report-stat-row">
                <span class="label">Valuation of Additions</span>
                <span class="value font-bold">\${{ reportStats().addedValue | number:'1.2-2' }}</span>
              </div>
              <div class="report-stat-row">
                <span class="label">Average Unit Cost</span>
                <span class="value font-semibold">\${{ reportStats().averagePrice | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Angular Custom Calendar Card (Only for Date-Wise Filter) -->
          @if (selectedTab() === 'datewise') {
            <div class="glass-card calendar-card slide-in">
              <div class="calendar-header">
                <button type="button" class="calendar-nav-btn" (click)="prevMonth()" aria-label="Previous Month">
                  <span class="material-symbols-rounded">chevron_left</span>
                </button>
                <span class="calendar-month-year">{{ getMonthName(currentMonth()) }} {{ currentYear() }}</span>
                <button type="button" class="calendar-nav-btn" (click)="nextMonth()" aria-label="Next Month">
                  <span class="material-symbols-rounded">chevron_right</span>
                </button>
              </div>
              
              <div class="calendar-weekdays">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              
              <div class="calendar-days-grid">
                @for (cell of daysInMonth(); track $index) {
                  @if (cell.day === null) {
                    <div class="calendar-day-empty"></div>
                  } @else {
                    <button 
                      type="button" 
                      class="calendar-day-btn" 
                      [class.selected]="cell.isSelected"
                      [class.today]="isToday(cell.dateString)"
                      (click)="selectDate(cell.dateString)"
                    >
                      {{ cell.day }}
                    </button>
                  }
                }
              </div>
            </div>
          } @else {
            <!-- Quick Stock Health Check -->
            <div class="glass-card health-check-card">
              <h3>Weekly Stock Activity Logs</h3>
              <div class="divider"></div>
              <div class="activity-timeline">
                <div class="timeline-item">
                  <div class="timeline-badge bg-success">
                    <span class="material-symbols-rounded">add</span>
                  </div>
                  <div class="timeline-info">
                    <h5>New Batch Registered</h5>
                    <p>Batch IBU-2026-077 (Ibuprofen 400mg) - 120 units added.</p>
                    <span class="time">Today, 10:14 AM</span>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-badge bg-primary">
                    <span class="material-symbols-rounded">refresh</span>
                  </div>
                  <div class="timeline-info">
                    <h5>Stock Restocked</h5>
                    <p>Batch AML-2026-056 (Amlodipine) increased by 20 units.</p>
                    <span class="time">June 08, 2026</span>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-badge bg-warning">
                    <span class="material-symbols-rounded">block</span>
                  </div>
                  <div class="timeline-info">
                    <h5>Expired Stock Audit</h5>
                    <p>Batch MET-2026-045 flagged for disposal (Expired 2026-05-10).</p>
                    <span class="time">June 07, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Additions List Card -->
        <div class="glass-card list-card">
          <div class="list-card-header">
            <h3>Registered Additions ({{ reportItems().length }})</h3>
            <span class="badge badge-success">Live Sync</span>
          </div>

          <div class="additions-list">
            @if (reportItems().length === 0) {
              <div class="empty-report-state">
                <span class="material-symbols-rounded empty-report-icon">query_stats</span>
                <h4>No inventory additions found</h4>
                <p>There are no items recorded for the selected filter criteria.</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="med-table" aria-label="Inventory additions report table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Batch</th>
                      <th>Expiry</th>
                      <th>Date Added</th>
                      <th class="text-right">Qty</th>
                      <th class="text-right">Price</th>
                      <th class="text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of reportItems(); track item.id) {
                      <tr>
                        <td class="font-bold text-primary">{{ item.name }}</td>
                        <td><code class="batch-code">{{ item.batchNumber }}</code></td>
                        <td>{{ item.expiryDate }}</td>
                        <td>{{ item.addedAt }}</td>
                        <td class="text-right">{{ item.quantity }}</td>
                        <td class="text-right">\${{ item.price | number:'1.2-2' }}</td>
                        <td class="text-right font-semibold">\${{ (item.quantity * item.price) | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .report-selector-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .report-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .report-tab-btn {
      font-family: var(--font-family);
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.6rem 1.25rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      background-color: white;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all var(--transition-fast);
    }
    .report-tab-btn span {
      font-size: 1.2rem;
    }
    .report-tab-btn:hover {
      background-color: var(--primary-light);
      color: var(--primary);
    }
    .report-tab-btn.active {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .datepicker-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .select-date-label {
      margin-bottom: 0 !important;
      font-weight: 700;
      color: var(--text-primary);
    }

    .date-input-wrapper {
      position: relative;
    }

    .date-picker-input {
      padding-right: 2.5rem !important;
      background: white !important;
      font-weight: 500;
      border-radius: var(--radius-sm);
    }

    .calendar-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
      font-size: 1.2rem;
    }

    .report-content-grid {
      display: grid;
      grid-template-columns: 1fr 1.75fr;
      gap: 1.5rem;
    }

    .summary-info-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .metrics-card, .health-check-card {
      padding: 1.5rem;
    }

    .metrics-card h3, .health-check-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .divider {
      height: 1px;
      background-color: var(--border-light);
      margin: 1rem 0;
    }

    .report-stat-rows {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .report-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .report-stat-row .label {
      color: var(--text-secondary);
    }

    .report-stat-row .value {
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .color-primary { color: var(--primary); }
    .color-secondary { color: var(--secondary); }

    /* Timeline Activity Log */
    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
      padding-left: 0.5rem;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }

    .timeline-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      z-index: 2;
    }
    .timeline-badge span {
      font-size: 1rem;
    }

    .bg-success { background-color: var(--success); }
    .bg-primary { background-color: var(--primary); }
    .bg-warning { background-color: var(--warning); }

    .timeline-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .timeline-info h5 {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .timeline-info p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.3;
    }

    .timeline-info .time {
      font-size: 0.7rem;
      color: var(--text-light);
      margin-top: 0.1rem;
    }

    /* List Card Addition */
    .list-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: 500px;
    }

    .list-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.75rem;
    }

    .list-card-header h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .additions-list {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .empty-report-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--text-secondary);
      padding: 5rem 1rem;
      gap: 0.75rem;
      flex: 1;
    }

    .empty-report-icon {
      font-size: 3.5rem;
      color: var(--text-light);
    }

    .batch-code {
      background-color: hsl(220, 20%, 93%);
      color: var(--text-primary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-family: monospace;
    }

    .text-right {
      text-align: right;
    }

    .font-bold {
      font-weight: 700;
    }

    .font-semibold {
      font-weight: 600;
    }

    @media (max-width: 992px) {
      .report-content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .report-selector-card {
        flex-direction: column;
        align-items: stretch;
      }
      .report-tabs {
        flex-direction: column;
      }
    }

    .selected-date-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--secondary-light);
      color: var(--secondary);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid hsl(var(--secondary-base), 80%, 90%);
    }

    /* Angular Custom Calendar Styles */
    .calendar-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      color: var(--text-primary);
    }

    .calendar-nav-btn {
      background: none;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }
    .calendar-nav-btn:hover {
      background-color: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }

    .calendar-month-year {
      font-size: 1rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.01em;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-light);
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.5rem;
    }

    .calendar-days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.4rem;
      text-align: center;
    }

    .calendar-day-empty {
      aspect-ratio: 1;
    }

    .calendar-day-btn {
      aspect-ratio: 1;
      border: none;
      background: none;
      border-radius: 50%;
      font-family: var(--font-family);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .calendar-day-btn:hover {
      background-color: var(--primary-light);
      color: var(--primary);
    }

    .calendar-day-btn.selected {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      box-shadow: 0 4px 10px var(--primary-glow);
    }

    .calendar-day-btn.today {
      border: 1px solid var(--secondary);
      color: var(--secondary);
    }
    .calendar-day-btn.today.selected {
      border: none;
      color: white;
    }
  `]
})
export class ReportsComponent {
  readonly inventoryService = inject(InventoryService);

  // Active Report Sub-tab
  selectedTab = signal<'weekly' | 'monthly' | 'datewise'>('weekly');
  
  // Date Picker state
  filterDate = signal('2026-06-13'); // Standard mock system date (today)

  // Active calendar state (relative to June 13, 2026)
  readonly currentMonth = signal(5); // June (0-indexed)
  readonly currentYear = signal(2026);

  getMonthName(monthIndex: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthIndex];
  }

  isToday(dateStr: string): boolean {
    return dateStr === '2026-06-13';
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  selectDate(dateStr: string): void {
    this.filterDate.set(dateStr);
  }

  daysInMonth = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    
    // First day of month (0 = Sun, 1 = Mon...)
    const firstDay = new Date(year, month, 1).getDay();
    
    // Total days in month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells: { day: number | null; dateString: string; isSelected: boolean }[] = [];
    
    // Padding
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateString: '', isSelected: false });
    }
    
    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateString: dateStr,
        isSelected: dateStr === this.filterDate()
      });
    }
    
    return cells;
  });

  // Title of the current report
  getReportTitle(): string {
    switch(this.selectedTab()) {
      case 'weekly': return 'Weekly Summary';
      case 'monthly': return 'Monthly Summary';
      case 'datewise': return `Daily Audit (${this.filterDate()})`;
    }
  }

  // Compute items falling under the selected report type
  reportItems = computed(() => {
    const allItems = this.inventoryService.items();
    const tab = this.selectedTab();
    
    // Core dates relative to June 13, 2026
    const todayStr = '2026-06-13';
    const startOfWeekStr = '2026-06-07'; // Sunday before June 13
    const startOfMonthStr = '2026-06-01'; // June 1

    if (tab === 'weekly') {
      // Return additions this week (addedAt >= startOfWeekStr)
      return allItems.filter(item => item.addedAt >= startOfWeekStr);
    } else if (tab === 'monthly') {
      // Return additions this month (addedAt >= startOfMonthStr)
      return allItems.filter(item => item.addedAt >= startOfMonthStr);
    } else {
      // Return additions exactly on the selected date
      return allItems.filter(item => item.addedAt === this.filterDate());
    }
  });

  // Compute stats aggregates based on filtered items
  reportStats = computed(() => {
    const items = this.reportItems();
    const addedCount = items.length;
    const addedQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const addedValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const averagePrice = addedCount > 0 
      ? items.reduce((sum, item) => sum + item.price, 0) / addedCount 
      : 0;

    return {
      addedCount,
      addedQuantity,
      addedValue,
      averagePrice
    };
  });
}
