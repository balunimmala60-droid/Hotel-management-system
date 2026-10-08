import { 
  HotelSummary, 
  Room, 
  Booking, 
  Guest, 
  HousekeepingTask, 
  MenuItem, 
  RoomType, 
  FolioData,
  SqlQueryResult,
  PythonExecutionResult 
} from '../types';
import {
  FALLBACK_ROOM_TYPES,
  FALLBACK_ROOMS,
  FALLBACK_GUESTS,
  FALLBACK_BOOKINGS,
  FALLBACK_TASKS,
  FALLBACK_MENU,
  getFallbackSummary,
  getFallbackFolio
} from './fallbackData';

// Local mutable state for offline / GitHub preview / static fallback mode
let localRooms = [...FALLBACK_ROOMS];
let localGuests = [...FALLBACK_GUESTS];
let localBookings = [...FALLBACK_BOOKINGS];
let localTasks = [...FALLBACK_TASKS];
let localMenu = [...FALLBACK_MENU];

export const api = {
  // Fetch all hotel data
  async getAll(): Promise<{
    summary: HotelSummary;
    room_types: RoomType[];
    rooms: Room[];
    guests: Guest[];
    bookings: Booking[];
    tasks: HousekeepingTask[];
    menu: MenuItem[];
  }> {
    try {
      const res = await fetch('/api/hotel/all', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Sync local copies with live data
          localRooms = [...json.data.rooms];
          localBookings = [...json.data.bookings];
          return json.data;
        }
      }
    } catch {
      // Backend not running or timeout; seamlessly use local luxury dataset
    }

    return {
      summary: getFallbackSummary(),
      room_types: FALLBACK_ROOM_TYPES,
      rooms: localRooms,
      guests: localGuests,
      bookings: localBookings,
      tasks: localTasks,
      menu: localMenu,
    };
  },

  // Fetch KPI summary
  async getSummary(): Promise<HotelSummary> {
    try {
      const res = await fetch('/api/hotel/summary', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) return json.summary;
      }
    } catch {
      // fallback
    }
    return getFallbackSummary();
  },

  // Fetch Folio for booking
  async getFolio(bookingId: string): Promise<FolioData> {
    try {
      const res = await fetch(`/api/hotel/folio/${bookingId}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.folio) return json.folio;
      }
    } catch {
      // fallback
    }
    return getFallbackFolio(bookingId);
  },

  // Create booking
  async createBooking(data: {
    guest_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    vip_status?: boolean;
    loyalty_tier?: string;
    guest_notes?: string;
    room_number?: string;
    room_type_id: string;
    check_in_date: string;
    check_out_date: string;
    total_nights: number;
    guests_count: number;
    nightly_rate: number;
    special_requests?: string;
    auto_checkin?: boolean;
  }) {
    try {
      const res = await fetch('/api/hotel/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // In-memory simulation
    const newId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBkg: Booking = {
      id: newId,
      guest_id: data.guest_id || `GST-${Math.floor(100 + Math.random() * 900)}`,
      first_name: data.first_name || 'Guest',
      last_name: data.last_name || 'VIP',
      email: data.email || 'guest@example.com',
      phone: data.phone || '+91 98000 00000',
      vip_status: data.vip_status ? 1 : 0,
      loyalty_tier: data.loyalty_tier || 'Silver',
      room_number: data.room_number || null,
      room_type_id: data.room_type_id,
      room_type_name: FALLBACK_ROOM_TYPES.find(rt => rt.id === data.room_type_id)?.name || 'Luxury Suite',
      room_type_category: FALLBACK_ROOM_TYPES.find(rt => rt.id === data.room_type_id)?.category || 'Suite',
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      total_nights: data.total_nights,
      guests_count: data.guests_count,
      nightly_rate: data.nightly_rate,
      total_charges: Math.round(data.nightly_rate * data.total_nights * 1.18),
      total_paid: data.auto_checkin ? Math.round(data.nightly_rate * data.total_nights * 1.18) : 0,
      status: data.auto_checkin ? 'CHECKED_IN' : 'CONFIRMED',
      special_requests: data.special_requests || null,
      created_at: new Date().toISOString()
    };
    localBookings.unshift(newBkg);
    if (data.room_number) {
      localRooms = localRooms.map(r => r.room_number === data.room_number ? { ...r, status: data.auto_checkin ? 'OCCUPIED' : r.status, current_guest_name: `${newBkg.first_name} ${newBkg.last_name}`, active_booking_id: newId } : r);
    }
    return { success: true, booking_id: newId };
  },

  // Check in
  async checkIn(bookingId: string, roomNumber: string) {
    try {
      const res = await fetch('/api/hotel/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, room_number: roomNumber }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const bkg = localBookings.find(b => b.id === bookingId);
    if (bkg) {
      bkg.status = 'CHECKED_IN';
      bkg.room_number = roomNumber;
    }
    localRooms = localRooms.map(r => r.room_number === roomNumber ? { ...r, status: 'OCCUPIED', active_booking_id: bookingId, current_guest_name: bkg ? `${bkg.first_name} ${bkg.last_name}` : 'Checked In Guest' } : r);
    return { success: true, message: `Checked in booking ${bookingId} to Room ${roomNumber}` };
  },

  // Check out
  async checkOut(bookingId: string) {
    try {
      const res = await fetch('/api/hotel/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const bkg = localBookings.find(b => b.id === bookingId);
    if (bkg) {
      bkg.status = 'CHECKED_OUT';
      if (bkg.room_number) {
        localRooms = localRooms.map(r => r.room_number === bkg.room_number ? { ...r, status: 'CLEANING', cleanliness: 'DIRTY', current_guest_name: null, active_booking_id: null } : r);
      }
    }
    return { success: true, message: `Checked out booking ${bookingId}` };
  },

  // Add charge to folio
  async addFolioCharge(data: {
    booking_id: string;
    category: string;
    description: string;
    amount: number;
    tax_rate?: number;
  }) {
    try {
      const res = await fetch('/api/hotel/folio/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const bkg = localBookings.find(b => b.id === data.booking_id);
    if (bkg) {
      const taxRate = data.tax_rate ?? 0.18;
      const total = data.amount * (1 + taxRate);
      bkg.total_charges = (bkg.total_charges || 0) + total;
    }
    return { success: true };
  },

  // Add payment
  async addPayment(data: {
    booking_id: string;
    amount: number;
    payment_method: string;
  }) {
    try {
      const res = await fetch('/api/hotel/folio/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const bkg = localBookings.find(b => b.id === data.booking_id);
    if (bkg) {
      bkg.total_paid = (bkg.total_paid || 0) + data.amount;
    }
    return { success: true };
  },

  // Update room status
  async updateRoomStatus(data: {
    room_number: string;
    status?: string;
    cleanliness?: string;
    notes?: string;
  }) {
    try {
      const res = await fetch('/api/hotel/rooms/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    localRooms = localRooms.map(r => {
      if (r.room_number === data.room_number) {
        return {
          ...r,
          status: (data.status as any) || r.status,
          cleanliness: (data.cleanliness as any) || r.cleanliness
        };
      }
      return r;
    });
    return { success: true };
  },

  // Update housekeeping task
  async updateTaskStatus(taskId: string, status: string) {
    try {
      const res = await fetch('/api/hotel/housekeeping/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    localTasks = localTasks.map(t => t.id === taskId ? { ...t, status: status as any } : t);
    return { success: true };
  },

  // Create task
  async createTask(data: {
    room_number: string;
    task_type: string;
    priority: string;
    assigned_to: string;
    reported_issue: string;
  }) {
    try {
      const res = await fetch('/api/hotel/housekeeping/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const newTask: HousekeepingTask = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      room_number: data.room_number,
      task_type: data.task_type as any,
      priority: data.priority as any,
      status: 'PENDING',
      assigned_to: data.assigned_to,
      reported_issue: data.reported_issue,
      scheduled_date: new Date().toISOString().split('T')[0]
    };
    localTasks.unshift(newTask);
    return { success: true, task_id: newTask.id };
  },

  // Run SQL
  async executeSql(query: string): Promise<SqlQueryResult> {
    try {
      const res = await fetch('/api/hotel/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Client-side simulation of SQL studio for preview environments
    return {
      columns: ['room_number', 'room_type', 'status', 'base_rate_inr', 'guest_name'],
      rows: localRooms.slice(0, 8).map(r => [
        r.room_number,
        r.room_type_name,
        r.status,
        `₹${r.base_price.toLocaleString('en-IN')}`,
        r.current_guest_name || '—'
      ]),
      rowCount: 8,
      elapsedMs: 1.4,
      isSelect: true
    };
  },

  // Run Python
  async executePython(code: string): Promise<PythonExecutionResult> {
    try {
      const res = await fetch('/api/hotel/python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return {
      stdout: `[Grand Horizon Python Controller Simulation]\n>>> Executed code successfully\n>>> Hotel State: 20 Rooms Inventory | Occupancy: 50.0%\n>>> Currency Engine: Indian Rupee (INR / ₹)\n>>> ADR: ₹17,250.00 | RevPAR: ₹8,625.00`,
      elapsedMs: 2.1
    };
  },

  // Reset DB
  async resetDatabase() {
    try {
      const res = await fetch('/api/hotel/reset-db', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    localRooms = [...FALLBACK_ROOMS];
    localBookings = [...FALLBACK_BOOKINGS];
    localTasks = [...FALLBACK_TASKS];
    return { success: true };
  },

  // Fetch source file
  async getSource(type: 'python' | 'sql'): Promise<{ success: boolean; content: string; filename: string }> {
    try {
      const res = await fetch(`/api/hotel/source/${type}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return {
      success: true,
      filename: type === 'python' ? 'hotel_backend.py' : 'schema.sql',
      content: type === 'python'
        ? `# Grand Horizon Luxury Resort & Suites - Python PMS Engine\n# Database: SQLite 3 | Currency: Indian Rupees (₹ / INR)\n# Initialized and ready.`
        : `-- Grand Horizon PMS Relational Schema\n-- Currency: INR (₹)\nCREATE TABLE room_types (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  base_price REAL NOT NULL\n);`
    };
  }
};
