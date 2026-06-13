import { Injectable, signal, computed } from '@angular/core';

export interface InventoryItem {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  price: number;
  addedAt: string; // YYYY-MM-DD
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly STORAGE_KEY = 'med_shop_inventory_items';
  
  // Internal writeable signal
  private readonly _items = signal<InventoryItem[]>([]);

  // Public read-only signal
  readonly items = this._items.asReadonly();

  // Computed metrics
  readonly totalItems = computed(() => this._items().length);
  
  readonly totalValue = computed(() => {
    return this._items().reduce((sum, item) => sum + (item.quantity * item.price), 0);
  });

  readonly lowStockCount = computed(() => {
    return this._items().filter(item => item.quantity < 20).length;
  });

  readonly expiredCount = computed(() => {
    const todayStr = '2026-06-13'; // Standard mock system date
    return this._items().filter(item => item.expiryDate < todayStr).length;
  });

  constructor() {
    this.loadInitialData();
  }

  /**
   * Load items from sessionStorage or seed default ones if empty.
   */
  private loadInitialData(): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this._items.set(JSON.parse(stored));
      } else {
        // Seed default clinic inventory items
        const defaultItems: InventoryItem[] = [
          {
            id: 'item-1',
            name: 'Paracetamol 500mg',
            batchNumber: 'PCT-2026-004',
            expiryDate: '2028-12-15',
            quantity: 150,
            price: 2.50,
            addedAt: '2026-06-12' // This week
          },
          {
            id: 'item-2',
            name: 'Amoxicillin 250mg Capsules',
            batchNumber: 'AMX-2026-012',
            expiryDate: '2027-08-20',
            quantity: 80,
            price: 12.00,
            addedAt: '2026-06-10' // This week
          },
          {
            id: 'item-3',
            name: 'Atorvastatin 20mg Tablets',
            batchNumber: 'ATV-2026-098',
            expiryDate: '2026-11-30',
            quantity: 15,
            price: 24.50,
            addedAt: '2026-06-02' // This month, but not this week
          },
          {
            id: 'item-4',
            name: 'Metformin Hydrochloride 850mg',
            batchNumber: 'MET-2026-045',
            expiryDate: '2026-05-10', // Already expired (Relative to 2026-06-13)
            quantity: 220,
            price: 8.90,
            addedAt: '2026-05-15' // Last month
          },
          {
            id: 'item-5',
            name: 'Ibuprofen 400mg',
            batchNumber: 'IBU-2026-077',
            expiryDate: '2028-01-10',
            quantity: 120,
            price: 4.20,
            addedAt: '2026-06-13' // Added today (This week)
          },
          {
            id: 'item-6',
            name: 'Insulin Glargine 100 U/mL Pen',
            batchNumber: 'INS-2026-001',
            expiryDate: '2027-03-15',
            quantity: 8, // Low stock
            price: 45.00,
            addedAt: '2026-06-11' // This week
          },
          {
            id: 'item-7',
            name: 'Omeprazole 20mg Capsules',
            batchNumber: 'OME-2026-103',
            expiryDate: '2028-04-22',
            quantity: 310,
            price: 6.80,
            addedAt: '2026-05-20' // Last month
          },
          {
            id: 'item-8',
            name: 'Amlodipine 5mg Tablets',
            batchNumber: 'AML-2026-056',
            expiryDate: '2026-06-25', // Expiring soon
            quantity: 45,
            price: 15.00,
            addedAt: '2026-06-08' // This week
          }
        ];
        this.saveAndNotify(defaultItems);
      }
    } catch (e) {
      console.error('Failed to parse or seed inventory items', e);
      this._items.set([]);
    }
  }

  /**
   * Save items to storage and update signal.
   */
  private saveAndNotify(newItems: InventoryItem[]): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save inventory items to sessionStorage', e);
    }
    this._items.set(newItems);
  }

  /**
   * Generate UUID-like unique string for IDs.
   */
  private generateId(): string {
    return 'item-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
  }

  /**
   * Add new item to inventory.
   */
  addItem(item: Omit<InventoryItem, 'id' | 'addedAt'>): void {
    const todayStr = '2026-06-13'; // Standard mock system date
    const newItem: InventoryItem = {
      ...item,
      id: this.generateId(),
      addedAt: todayStr
    };
    this.saveAndNotify([...this._items(), newItem]);
  }

  /**
   * Edit/Update details of an existing item.
   */
  updateItem(id: string, updatedFields: Partial<Omit<InventoryItem, 'id'>>): void {
    const updated = this._items().map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    this.saveAndNotify(updated);
  }

  /**
   * Delete an item from inventory.
   */
  deleteItem(id: string): void {
    const updated = this._items().filter(item => item.id !== id);
    this.saveAndNotify(updated);
  }
}
