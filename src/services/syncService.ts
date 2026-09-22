import { StorageService } from './storage';

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'tablet' | 'mobile';
  lastSeen: string;
  operatorName?: string;
}

export interface SyncPayload {
  version: number;
  updatedAt: string;
  deviceId: string;
  deviceName: string;
  data: {
    products: any[];
    categories: string[];
    invoices: any[];
    workshopOrders: any[];
    customers: any[];
    workshops: any[];
    settings: any;
    users: any[];
  };
}

const SYNC_STORAGE_KEYS = {
  DEVICE_ID: 'wcs_device_id',
  DEVICE_NAME: 'wcs_device_name',
  LAST_SYNC_TIME: 'wcs_last_sync_time',
};

// Generate or retrieve unique device ID
export function getDeviceId(): string {
  let id = localStorage.getItem(SYNC_STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    const type = /Mobi|Android/i.test(navigator.userAgent)
      ? 'phone'
      : /iPad|Tablet/i.test(navigator.userAgent)
      ? 'tablet'
      : 'pc';
    id = `${type}-${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(SYNC_STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

// Get or set human friendly device label (e.g. Counter 1, Workshop Tablet)
export function getDeviceName(): string {
  let name = localStorage.getItem(SYNC_STORAGE_KEYS.DEVICE_NAME);
  if (!name) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Tablet/i.test(navigator.userAgent);
    name = isMobile ? 'Mobile Phone' : isTablet ? 'Workshop Tablet' : 'POS Main Counter';
    localStorage.setItem(SYNC_STORAGE_KEYS.DEVICE_NAME, name);
  }
  return name;
}

export function setDeviceName(name: string): void {
  localStorage.setItem(SYNC_STORAGE_KEYS.DEVICE_NAME, name);
}

// Broadcast channel for multi-tab zero latency sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('wcs_multidevice_bus');
  }
} catch {
  // BroadcastChannel fallback
}

let syncListeners: (() => void)[] = [];
let isSyncing = false;
let lastServerTimestamp = 0;

export const MultiDeviceSyncService = {
  subscribe: (listener: () => void) => {
    syncListeners.push(listener);
    return () => {
      syncListeners = syncListeners.filter((l) => l !== listener);
    };
  },

  notifyListeners: () => {
    syncListeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  },

  // Push local state to server and other tabs
  pushLocalToServer: async (): Promise<boolean> => {
    if (isSyncing) return false;
    try {
      isSyncing = true;
      const deviceId = getDeviceId();
      const deviceName = getDeviceName();

      const payload: SyncPayload = {
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        deviceId,
        deviceName,
        data: {
          products: StorageService.getProducts(),
          categories: StorageService.getProductCategories(),
          invoices: StorageService.getInvoices(),
          workshopOrders: StorageService.getWorkshopOrders(),
          customers: StorageService.getCustomers(),
          workshops: StorageService.getWorkshops(),
          settings: StorageService.getSettings(),
          users: StorageService.getUsers(),
        },
      };

      // Notify local tabs
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_PUSH', timestamp: payload.version, deviceId });
      }

      // Push to backend server
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC_TIME, new Date().toLocaleTimeString());
        lastServerTimestamp = payload.version;
        return true;
      }
      return false;
    } catch {
      // In offline / preview fallback, local changes are still saved in localStorage
      return false;
    } finally {
      isSyncing = false;
    }
  },

  // Pull latest state from server
  pullFromServer: async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) return false;

      const remoteData: SyncPayload = await res.json();
      if (!remoteData || !remoteData.data || !remoteData.version) {
        // If server has no data yet, push our local initial data to initialize server!
        await MultiDeviceSyncService.pushLocalToServer();
        return true;
      }

      // If server data is newer and not originated from this device
      if (remoteData.version > lastServerTimestamp) {
        lastServerTimestamp = remoteData.version;

        if (Array.isArray(remoteData.data.products)) {
          StorageService.saveProducts(remoteData.data.products);
        }
        if (Array.isArray(remoteData.data.categories)) {
          StorageService.saveProductCategories(remoteData.data.categories);
        }
        if (Array.isArray(remoteData.data.invoices)) {
          StorageService.saveInvoices(remoteData.data.invoices);
        }
        if (Array.isArray(remoteData.data.workshopOrders)) {
          StorageService.saveWorkshopOrders(remoteData.data.workshopOrders);
        }
        if (Array.isArray(remoteData.data.customers)) {
          StorageService.saveCustomers(remoteData.data.customers);
        }
        if (Array.isArray(remoteData.data.workshops)) {
          StorageService.saveWorkshops(remoteData.data.workshops);
        }
        if (remoteData.data.settings) {
          StorageService.saveSettings(remoteData.data.settings);
        }

        localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC_TIME, new Date().toLocaleTimeString());
        MultiDeviceSyncService.notifyListeners();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Initialize heartbeat background polling
  startAutoSync: (intervalMs = 6000) => {
    // Initial sync
    MultiDeviceSyncService.pullFromServer();

    // Listen to local browser cross-tab messages
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_PUSH') {
          MultiDeviceSyncService.notifyListeners();
        }
      };
    }

    // Interval polling for multi-device cross-network updates
    const timer = setInterval(() => {
      MultiDeviceSyncService.pullFromServer();
    }, intervalMs);

    // Online event handler
    const handleOnline = () => {
      MultiDeviceSyncService.pullFromServer();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
    };
  },
};
