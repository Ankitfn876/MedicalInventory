import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-container fade-in">
      
      <!-- Top Title Bar -->
      <div class="inventory-header">
        <div>
          <h1>Medical Inventory</h1>
          <p>Create, update, and manage clinic pharmaceutical stocks.</p>
        </div>
        <button 
          class="btn btn-primary" 
          (click)="openAddModal()"
          aria-label="Add a new medical inventory item"
        >
          <span class="material-symbols-rounded">add</span> Add Medical Item
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="glass-card toolbar-card">
        <div class="search-box">
          <span class="material-symbols-rounded search-icon">search</span>
          <input 
            type="text" 
            class="form-control search-input" 
            placeholder="Search items by name or batch..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            aria-label="Search inventory"
          />
        </div>

        <div class="filter-pills">
          <button 
            [class.active]="activeFilter() === 'all'" 
            (click)="activeFilter.set('all')"
            class="filter-pill"
          >
            All Stock ({{ inventoryService.items().length }})
          </button>
          <button 
            [class.active]="activeFilter() === 'low'" 
            (click)="activeFilter.set('low')"
            class="filter-pill pill-warning"
          >
            Low Stock ({{ inventoryService.lowStockCount() }})
          </button>
          <button 
            [class.active]="activeFilter() === 'expired'" 
            (click)="activeFilter.set('expired')"
            class="filter-pill pill-danger"
          >
            Expired ({{ inventoryService.expiredCount() }})
          </button>
        </div>
      </div>

      <!-- Main Inventory Table -->
      <div class="glass-card table-card">
        @if (filteredItems().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-rounded empty-state-icon">inventory_2</span>
            <h3>No inventory items found</h3>
            <p>Try refining your search query or change your filters to see items.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="med-table" aria-label="Medical Inventory Table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total Value</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredItems(); track item.id) {
                  <tr>
                    <td class="font-bold text-primary">{{ item.name }}</td>
                    <td><code class="batch-code">{{ item.batchNumber }}</code></td>
                    <td>{{ item.expiryDate }}</td>
                    <td>
                      @if (isExpired(item)) {
                        <span class="badge badge-danger">Expired</span>
                      } @else if (item.quantity < 20) {
                        <span class="badge badge-warning">Low Stock</span>
                      } @else {
                        <span class="badge badge-success">In Stock</span>
                      }
                    </td>
                    <td class="text-right font-semibold" [class.text-danger]="item.quantity === 0">
                      {{ item.quantity }} units
                    </td>
                    <td class="text-right">\${{ item.price | number:'1.2-2' }}</td>
                    <td class="text-right font-semibold">\${{ (item.quantity * item.price) | number:'1.2-2' }}</td>
                    <td class="text-center">
                      <div class="action-buttons-cell">
                        <button 
                          class="btn-action btn-edit" 
                          (click)="openEditModal(item)"
                          aria-label="Edit item details"
                        >
                          <span class="material-symbols-rounded">edit</span>
                        </button>
                        <button 
                          class="btn-action btn-delete" 
                          (click)="openDeleteConfirm(item)"
                          aria-label="Delete item from inventory"
                        >
                          <span class="material-symbols-rounded">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Add / Edit Modal Overlay -->
      @if (showFormModal()) {
        <div class="modal-overlay" (click)="closeFormModal()">
          <div class="modal-container slide-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                <span class="material-symbols-rounded">{{ isEditMode() ? 'edit' : 'add_circle' }}</span>
                {{ isEditMode() ? 'Edit Inventory Item' : 'Add Medical Item' }}
              </h3>
              <button class="btn-close" (click)="closeFormModal()" aria-label="Close dialog">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
            
            <form (ngSubmit)="saveItem()" #itemForm="ngForm">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="name">Item Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    class="form-control" 
                    required 
                    [(ngModel)]="formItem.name"
                    placeholder="e.g. Paracetamol 500mg"
                    #nameField="ngModel"
                    [class.invalid-field]="nameField.invalid && nameField.touched"
                  />
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label" for="batch">Batch Number</label>
                    <input 
                      type="text" 
                      id="batch" 
                      name="batch" 
                      class="form-control" 
                      required 
                      [(ngModel)]="formItem.batchNumber"
                      placeholder="e.g. BATCH-2026-X"
                      #batchField="ngModel"
                      [class.invalid-field]="batchField.invalid && batchField.touched"
                    />
                  </div>

                  <div class="form-group dropdown-calendar-wrapper">
                    <label class="form-label" for="expiry">Expiry Date</label>
                    <div class="input-with-button">
                      <input 
                        type="text" 
                        id="expiry" 
                        name="expiry" 
                        class="form-control read-only-input" 
                        required 
                        [ngModel]="formItem.expiryDate"
                        (click)="toggleCalendarDropdown($event)"
                        (keydown)="$event.preventDefault()"
                        placeholder="Select Expiry Date"
                        readonly
                        #expiryField="ngModel"
                        [class.invalid-field]="expiryField.invalid && expiryField.touched"
                        aria-label="Expiry Date"
                      />
                      <button 
                        type="button" 
                        class="calendar-trigger-btn" 
                        (click)="toggleCalendarDropdown($event)"
                        aria-label="Open calendar"
                      >
                        <span class="material-symbols-rounded">calendar_month</span>
                      </button>
                    </div>

                    <!-- Dropdown Calendar -->
                    @if (showCalendarDropdown()) {
                      <div class="dropdown-calendar glass-card fade-in" (click)="$event.stopPropagation()">
                        <div class="calendar-header">
                          <button type="button" class="calendar-nav-btn" (click)="prevMonth($event)" aria-label="Previous Month">
                            <span class="material-symbols-rounded">chevron_left</span>
                          </button>
                          <span class="calendar-month-year">{{ getMonthName(currentMonth()) }} {{ currentYear() }}</span>
                          <button type="button" class="calendar-nav-btn" (click)="nextMonth($event)" aria-label="Next Month">
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
                                (click)="selectDate(cell.dateString, $event)"
                              >
                                {{ cell.day }}
                              </button>
                            }
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label" for="quantity">Quantity (Units)</label>
                    <input 
                      type="number" 
                      id="quantity" 
                      name="quantity" 
                      class="form-control" 
                      required 
                      min="0"
                      [(ngModel)]="formItem.quantity"
                      placeholder="e.g. 100"
                      #qtyField="ngModel"
                      [class.invalid-field]="qtyField.invalid && qtyField.touched"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="price">Price (per Unit, $)</label>
                    <input 
                      type="number" 
                      id="price" 
                      name="price" 
                      class="form-control" 
                      required 
                      min="0.01" 
                      step="0.01"
                      [(ngModel)]="formItem.price"
                      placeholder="e.g. 5.50"
                      #priceField="ngModel"
                      [class.invalid-field]="priceField.invalid && priceField.touched"
                    />
                  </div>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeFormModal()">Cancel</button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="itemForm.invalid"
                >
                  {{ isEditMode() ? 'Save Changes' : 'Register Item' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal Overlay -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal-container modal-alert-danger slide-in" (click)="$event.stopPropagation()">
            <div class="modal-header header-danger">
              <h3 class="modal-title text-danger">
                <span class="material-symbols-rounded">warning</span>
                Confirm Delete Action
              </h3>
              <button class="btn-close text-danger" (click)="closeDeleteModal()" aria-label="Close dialog">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to remove this medical item from the active database?</p>
              <div class="item-delete-summary">
                <p><strong>Item Name:</strong> {{ itemToDelete()?.name }}</p>
                <p><strong>Batch ID:</strong> {{ itemToDelete()?.batchNumber }}</p>
                <p><strong>Stock Qty:</strong> {{ itemToDelete()?.quantity }} units</p>
              </div>
              <p class="warning-subtext">This action is permanent and will instantly update local sessionStorage records.</p>
            </div>
            <div class="modal-footer footer-danger-bar">
              <button type="button" class="btn btn-outline" (click)="closeDeleteModal()">Cancel</button>
              <button type="button" class="btn btn-danger" (click)="confirmDelete()">Delete Permanently</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .inventory-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    
    .inventory-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .inventory-header p {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }

    .toolbar-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1.25rem 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 280px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
      font-size: 1.25rem;
    }

    .search-input {
      padding-left: 2.75rem !important;
      width: 100%;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
    }

    .filter-pill {
      font-family: var(--font-family);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-light);
      border-radius: 30px;
      cursor: pointer;
      background-color: white;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }
    .filter-pill:hover {
      background-color: var(--primary-light);
      color: var(--primary);
    }
    .filter-pill.active {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .filter-pill.pill-warning.active {
      background-color: var(--warning);
      border-color: var(--warning);
    }
    .filter-pill.pill-danger.active {
      background-color: var(--danger);
      border-color: var(--danger);
    }

    .table-card {
      padding: 1rem;
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

    .text-center {
      text-align: center;
    }

    .font-bold {
      font-weight: 700;
    }

    .font-semibold {
      font-weight: 600;
    }

    .action-buttons-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-action {
      background: none;
      border: 1px solid var(--border-light);
      padding: 0.4rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      color: var(--text-secondary);
    }
    .btn-action span {
      font-size: 1.15rem;
    }

    .btn-edit:hover {
      background-color: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }

    .btn-delete:hover {
      background-color: var(--danger-light);
      color: var(--danger);
      border-color: var(--danger);
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .empty-state-icon {
      font-size: 4rem;
      color: var(--text-light);
    }

    /* Modal Form Custom Rows */
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 50%;
      transition: background-color var(--transition-fast);
    }
    .btn-close:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .invalid-field {
      border-color: var(--danger) !important;
      box-shadow: 0 0 0 3px var(--danger-light) !important;
    }

    /* Delete dialog details */
    .item-delete-summary {
      background: hsl(220, 20%, 97%);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin: 1rem 0;
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .warning-subtext {
      font-size: 0.8rem;
      color: var(--danger);
      font-weight: 500;
    }

    .header-danger {
      background-color: var(--danger-light) !important;
      border-bottom-color: hsl(355, 80%, 90%) !important;
    }

    .footer-danger-bar {
      background-color: hsl(355, 80%, 98%) !important;
    }

    @media (max-width: 640px) {
      .form-row-2 {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .toolbar-card {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-pills {
        justify-content: space-between;
      }
      .filter-pill {
        flex: 1;
        text-align: center;
        padding: 0.5rem 0.25rem;
        font-size: 0.75rem;
      }
      .inventory-header {
        flex-direction: column;
        align-items: stretch;
      }
      .inventory-header button {
        width: 100%;
        margin-top: 0.5rem;
      }
    }

    .dropdown-calendar-wrapper {
      position: relative;
    }

    .input-with-button {
      display: flex;
      position: relative;
      align-items: center;
    }

    .read-only-input {
      cursor: pointer;
      background-color: white !important;
      padding-right: 2.5rem !important;
    }

    .calendar-trigger-btn {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      background: none;
      border: none;
      padding: 0 0.75rem;
      cursor: pointer;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }
    .calendar-trigger-btn:hover {
      color: var(--primary);
    }

    /* Absolute positioned dropdown calendar card */
    .dropdown-calendar {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      max-width: 320px;
      z-index: 100;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 1rem;
      margin-top: 0.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
    }

    .calendar-nav-btn {
      background: none;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }
    .calendar-nav-btn:hover {
      background-color: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }

    .calendar-month-year {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--primary);
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-light);
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.25rem;
    }

    .calendar-days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
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
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      width: 100%;
    }
    .calendar-day-btn:hover {
      background-color: var(--primary-light);
      color: var(--primary);
    }

    .calendar-day-btn.selected {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
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
export class InventoryComponent {
  readonly inventoryService = inject(InventoryService);

  // Search & Filter State
  searchQuery = signal('');
  activeFilter = signal<'all' | 'low' | 'expired'>('all');

  // Modals state
  showFormModal = signal(false);
  isEditMode = signal(false);
  showDeleteModal = signal(false);

  // Forms Binding & Selected Item Storage
  editingId: string | null = null;
  formItem = {
    name: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
    price: 0.0
  };

  itemToDelete = signal<InventoryItem | null>(null);

  // Computed filtered list
  filteredItems = computed(() => {
    const allItems = this.inventoryService.items();
    const query = this.searchQuery().toLowerCase().trim();
    const todayStr = '2026-06-13'; // Standard mock system date
    const filter = this.activeFilter();

    let list = allItems;

    // Apply main query search
    if (query) {
      list = list.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.batchNumber.toLowerCase().includes(query)
      );
    }

    // Apply pills filter status
    if (filter === 'low') {
      list = list.filter(item => item.quantity < 20);
    } else if (filter === 'expired') {
      list = list.filter(item => item.expiryDate < todayStr);
    }

    return list;
  });

  isExpired(item: InventoryItem): boolean {
    const todayStr = '2026-06-13';
    return item.expiryDate < todayStr;
  }

  // Dropdown calendar state properties
  showCalendarDropdown = signal(false);
  currentMonth = signal(5); // June (0-indexed)
  currentYear = signal(2026);

  toggleCalendarDropdown(event: Event): void {
    event.stopPropagation();
    this.showCalendarDropdown.update(v => !v);
  }

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

  prevMonth(event: Event): void {
    event.stopPropagation();
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  selectDate(dateStr: string, event: Event): void {
    event.stopPropagation();
    this.formItem.expiryDate = dateStr;
    this.showCalendarDropdown.set(false);
  }

  initializeCalendarFromExpiry(): void {
    const dateStr = this.formItem.expiryDate;
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        if (!isNaN(year) && !isNaN(month)) {
          this.currentYear.set(year);
          this.currentMonth.set(month);
          return;
        }
      }
    }
    this.currentYear.set(2026);
    this.currentMonth.set(5);
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
        isSelected: dateStr === this.formItem.expiryDate
      });
    }
    
    return cells;
  });

  // Add flow
  openAddModal(): void {
    this.isEditMode.set(false);
    this.editingId = null;
    
    // Auto-generate batch and set template
    this.formItem = {
      name: '',
      batchNumber: 'BAT-' + Math.floor(1000 + Math.random() * 9000),
      expiryDate: '2027-12-31',
      quantity: 100,
      price: 10.00
    };
    
    this.initializeCalendarFromExpiry();
    this.showCalendarDropdown.set(false);
    this.showFormModal.set(true);
  }

  // Edit flow
  openEditModal(item: InventoryItem): void {
    this.isEditMode.set(true);
    this.editingId = item.id;
    
    // Copy item values
    this.formItem = {
      name: item.name,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      price: item.price
    };
    
    this.initializeCalendarFromExpiry();
    this.showCalendarDropdown.set(false);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showCalendarDropdown.set(false);
    this.showFormModal.set(false);
  }

  saveItem(): void {
    if (this.isEditMode() && this.editingId) {
      this.inventoryService.updateItem(this.editingId, {
        name: this.formItem.name,
        batchNumber: this.formItem.batchNumber,
        expiryDate: this.formItem.expiryDate,
        quantity: Number(this.formItem.quantity),
        price: Number(this.formItem.price)
      });
    } else {
      this.inventoryService.addItem({
        name: this.formItem.name,
        batchNumber: this.formItem.batchNumber,
        expiryDate: this.formItem.expiryDate,
        quantity: Number(this.formItem.quantity),
        price: Number(this.formItem.price)
      });
    }
    
    this.closeFormModal();
  }

  // Delete flow
  openDeleteConfirm(item: InventoryItem): void {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (item) {
      this.inventoryService.deleteItem(item.id);
    }
    this.closeDeleteModal();
  }
}
