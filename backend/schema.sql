-- =====================================================================
-- GRAND HORIZON LUXURY RESORT & HOTEL MANAGEMENT SYSTEM (PMS)
-- Relational Database Schema (SQLite / PostgreSQL Compatible DDL)
-- =====================================================================

PRAGMA foreign_keys = ON;

-- 1. Room Types & Categories
CREATE TABLE IF NOT EXISTS room_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,          -- Standard, Deluxe, Suite, Penthouse, Villa
    base_price REAL NOT NULL,        -- Nightly base rate in INR (₹)
    max_guests INTEGER NOT NULL DEFAULT 2,
    bed_type TEXT NOT NULL,          -- King, Queen, Double King, California King
    size_sqft INTEGER NOT NULL,
    amenities TEXT NOT NULL,         -- JSON / Comma-separated list
    description TEXT
);

-- 2. Physical Rooms Inventory
CREATE TABLE IF NOT EXISTS rooms (
    room_number TEXT PRIMARY KEY,
    floor INTEGER NOT NULL,
    room_type_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE, OUT_OF_ORDER
    cleanliness TEXT NOT NULL DEFAULT 'CLEAN', -- CLEAN, INSPECTED, DIRTY, IN_PROGRESS
    view_type TEXT NOT NULL DEFAULT 'City View', -- Oceanfront, Garden View, Skyline, Panoramic
    notes TEXT,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT
);

-- 3. Guest Profiles & Loyalty
CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    loyalty_tier TEXT NOT NULL DEFAULT 'Silver', -- Silver, Gold, Platinum, Diamond VIP
    vip_status INTEGER NOT NULL DEFAULT 0,       -- 0 = Normal, 1 = VIP
    id_passport TEXT,
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reservations & Stays
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,                         -- e.g. GH-2026-8841
    guest_id TEXT NOT NULL,
    room_number TEXT,
    room_type_id TEXT NOT NULL,
    check_in_date TEXT NOT NULL,                -- YYYY-MM-DD
    check_out_date TEXT NOT NULL,               -- YYYY-MM-DD
    total_nights INTEGER NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',   -- CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
    nightly_rate REAL NOT NULL,                 -- Nightly rate in INR (₹)
    special_requests TEXT,
    keycard_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE SET NULL,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT
);

-- 5. Guest Folio (Billing & Itemized Charges)
CREATE TABLE IF NOT EXISTS folio_items (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    category TEXT NOT NULL,                     -- ROOM, DINING, SPA, MINIBAR, SERVICE, TAX
    description TEXT NOT NULL,
    amount REAL NOT NULL,                       -- Subtotal charge in INR (₹)
    tax_rate REAL NOT NULL DEFAULT 0.18,        -- 18% GST (CGST 9% + SGST 9%)
    total_amount REAL NOT NULL,                 -- Amount + GST
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 6. Payments & Transactions
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,               -- CREDIT_CARD, CASH, AMEX, BANK_TRANSFER
    transaction_ref TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SETTLED',     -- SETTLED, PENDING, REFUNDED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 7. Housekeeping & Maintenance Tasks
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    task_type TEXT NOT NULL,                    -- DAILY_CLEAN, DEEP_CLEAN, TURNDOWN, MAINTENANCE
    priority TEXT NOT NULL DEFAULT 'NORMAL',    -- LOW, NORMAL, HIGH, URGENT
    status TEXT NOT NULL DEFAULT 'PENDING',     -- PENDING, IN_PROGRESS, COMPLETED
    assigned_to TEXT,
    reported_issue TEXT,
    scheduled_date TEXT NOT NULL,
    completed_at DATETIME,
    FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE CASCADE
);

-- 8. In-Room Dining & Room Service Menu
CREATE TABLE IF NOT EXISTS room_service_menu (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,                     -- BREAKFAST, MAINS, BEVERAGES, DESSERTS, WINE
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1
);

-- Indices for high-performance querying
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_folio_booking ON folio_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_tasks_room ON housekeeping_tasks(room_number);
