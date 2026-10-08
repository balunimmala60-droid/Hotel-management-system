export interface RoomType {
  id: string;
  name: string;
  category: 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse' | 'Villa';
  base_price: number;
  max_guests: number;
  bed_type: string;
  size_sqft: number;
  amenities: string;
  description: string;
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER';
export type CleanlinessStatus = 'CLEAN' | 'INSPECTED' | 'DIRTY' | 'IN_PROGRESS';

export interface Room {
  room_number: string;
  floor: number;
  room_type_id: string;
  status: RoomStatus;
  cleanliness: CleanlinessStatus;
  view_type: string;
  notes?: string | null;
  room_type_name: string;
  room_type_category: string;
  base_price: number;
  bed_type: string;
  size_sqft: number;
  active_booking_id?: string | null;
  current_guest_name?: string | null;
  vip_status?: number;
}

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond VIP';
  vip_status: number;
  id_passport?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface Booking {
  id: string;
  guest_id: string;
  room_number: string | null;
  room_type_id: string;
  check_in_date: string;
  check_out_date: string;
  total_nights: number;
  guests_count: number;
  status: BookingStatus;
  nightly_rate: number;
  special_requests?: string | null;
  keycard_code?: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_tier: string;
  vip_status: number;
  room_type_name: string;
  room_type_category: string;
  total_charges?: number;
  total_paid?: number;
}

export interface FolioItem {
  id: string;
  booking_id: string;
  category: 'ROOM' | 'DINING' | 'SPA' | 'MINIBAR' | 'SERVICE' | 'TAX';
  description: string;
  amount: number;
  tax_rate: number;
  total_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  transaction_ref: string;
  status: string;
  created_at: string;
}

export interface FolioData {
  booking: Booking;
  charges: FolioItem[];
  payments: Payment[];
  subtotal: number;
  tax_total: number;
  total_charges: number;
  total_paid: number;
  balance_due: number;
}

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface HousekeepingTask {
  id: string;
  room_number: string;
  task_type: 'DAILY_CLEAN' | 'DEEP_CLEAN' | 'TURNDOWN' | 'MAINTENANCE';
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string;
  reported_issue: string;
  scheduled_date: string;
  completed_at?: string | null;
  room_type_name?: string;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  is_available: number;
}

export interface HotelSummary {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  cleaning_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
  adr: number;
  revpar: number;
  today_arrivals: number;
  today_departures: number;
  total_revenue: number;
  total_collected: number;
  outstanding_balance: number;
}

export interface SqlQueryResult {
  columns?: string[];
  rows?: any[][];
  rowCount?: number;
  elapsedMs?: number;
  isSelect?: boolean;
  error?: string;
}

export interface PythonExecutionResult {
  stdout?: string;
  stderr?: string;
  result?: string | null;
  error?: string | null;
  elapsedMs?: number;
}
