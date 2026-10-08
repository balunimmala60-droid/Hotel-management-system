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
    const res = await fetch('/api/hotel/all');
    if (!res.ok) throw new Error('Failed to load hotel data');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'API error');
    return json.data;
  },

  // Fetch KPI summary
  async getSummary(): Promise<HotelSummary> {
    const res = await fetch('/api/hotel/summary');
    const json = await res.json();
    return json.summary;
  },

  // Fetch Folio for booking
  async getFolio(bookingId: string): Promise<FolioData> {
    const res = await fetch(`/api/hotel/folio/${bookingId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch folio');
    return json.folio;
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
    const res = await fetch('/api/hotel/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Check in
  async checkIn(bookingId: string, roomNumber: string) {
    const res = await fetch('/api/hotel/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, room_number: roomNumber }),
    });
    return res.json();
  },

  // Check out
  async checkOut(bookingId: string) {
    const res = await fetch('/api/hotel/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    return res.json();
  },

  // Add charge to folio
  async addFolioCharge(data: {
    booking_id: string;
    category: string;
    description: string;
    amount: number;
    tax_rate?: number;
  }) {
    const res = await fetch('/api/hotel/folio/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Add payment
  async addPayment(data: {
    booking_id: string;
    amount: number;
    payment_method: string;
  }) {
    const res = await fetch('/api/hotel/folio/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update room status
  async updateRoomStatus(data: {
    room_number: string;
    status?: string;
    cleanliness?: string;
    notes?: string;
  }) {
    const res = await fetch('/api/hotel/rooms/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update housekeeping task
  async updateTaskStatus(taskId: string, status: string) {
    const res = await fetch('/api/hotel/housekeeping/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, status }),
    });
    return res.json();
  },

  // Create task
  async createTask(data: {
    room_number: string;
    task_type: string;
    priority: string;
    assigned_to: string;
    reported_issue: string;
  }) {
    const res = await fetch('/api/hotel/housekeeping/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Run SQL
  async executeSql(query: string): Promise<SqlQueryResult> {
    const res = await fetch('/api/hotel/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  // Run Python
  async executePython(code: string): Promise<PythonExecutionResult> {
    const res = await fetch('/api/hotel/python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return res.json();
  },

  // Reset DB
  async resetDatabase() {
    const res = await fetch('/api/hotel/reset-db', { method: 'POST' });
    return res.json();
  },

  // Fetch source file
  async getSource(type: 'python' | 'sql'): Promise<{ success: boolean; content: string; filename: string }> {
    const res = await fetch(`/api/hotel/source/${type}`);
    return res.json();
  }
};
