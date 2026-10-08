#!/usr/bin/env python3
"""
Grand Horizon Luxury Resort & Suites - Hotel Management System (PMS)
Core Python Backend Controller & Relational Database Interface
"""

import sys
import os
import json
import sqlite3
import uuid
import datetime
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hotel.db")
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db(force: bool = False):
    """Initializes the SQLite schema and seeds with realistic luxury hotel data."""
    if force and os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
        except Exception:
            pass

    conn = get_connection()
    with conn:
        with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        
        # Check if rooms table is empty, if so, seed
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM room_types")
        if cur.fetchone()[0] == 0:
            seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn: sqlite3.Connection):
    """Populates realistic luxury hotel inventory, guests, bookings, and charges."""
    cur = conn.cursor()

    # 1. Room Types (Rates in Indian Rupees INR ₹)
    room_types = [
        ("RT-DLX", "Deluxe Ocean View", "Deluxe", 6500.0, 2, "King", 480, "Ocean View Balcony, Rain Shower, Nespresso, 4K Smart TV", "Spacious room featuring private balcony with unobstructed turquoise ocean views."),
        ("RT-EXE", "Executive Garden Suite", "Suite", 11500.0, 3, "California King", 750, "Private Garden Terrace, Marble Bath, Butler Service, Mini-Bar", "Elegant suite with dedicated living lounge and serene botanical gardens."),
        ("RT-ROYAL", "Royal Penthouse Suite", "Penthouse", 24500.0, 4, "Double King", 1400, "Panoramic Sky Terrace, Private Jacuzzi, Fireplace, Chauffeur Service", "Top-floor luxury penthouse with 360-degree skyline vistas and private plunge pool."),
        ("RT-VILLA", "Azure Beachfront Villa", "Villa", 48000.0, 6, "Two King Master Bedrooms", 2200, "Private Infinity Pool, Direct Beach Access, Full Gourmet Kitchen", "Exclusive detached villa situated right on the powdery sand with bespoke staff.")
    ]
    cur.executemany("""
        INSERT INTO room_types (id, name, category, base_price, max_guests, bed_type, size_sqft, amenities, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, room_types)

    # 2. Rooms (Floors 1-4 & Villas)
    rooms_data = [
        # Floor 1 - Deluxe & Garden
        ("101", 1, "RT-DLX", "OCCUPIED", "CLEAN", "Garden View", "VIP guest requested hypoallergenic pillows"),
        ("102", 1, "RT-DLX", "AVAILABLE", "CLEAN", "Garden View", None),
        ("103", 1, "RT-DLX", "OCCUPIED", "CLEAN", "Poolside", "Late checkout requested (2:00 PM)"),
        ("104", 1, "RT-DLX", "CLEANING", "DIRTY", "Garden View", "Housekeeping priority checkout turnover"),
        ("105", 1, "RT-EXE", "AVAILABLE", "CLEAN", "Private Courtyard", None),
        ("106", 1, "RT-EXE", "OCCUPIED", "CLEAN", "Private Courtyard", "Anniversary celebration wine basket placed"),
        
        # Floor 2 - Ocean Deluxe
        ("201", 2, "RT-DLX", "OCCUPIED", "CLEAN", "Ocean View", "Corporate traveler, prefers quiet floor"),
        ("202", 2, "RT-DLX", "AVAILABLE", "CLEAN", "Ocean View", None),
        ("203", 2, "RT-DLX", "AVAILABLE", "CLEAN", "Ocean View", None),
        ("204", 2, "RT-DLX", "OCCUPIED", "CLEAN", "Oceanfront", None),
        ("205", 2, "RT-EXE", "OCCUPIED", "CLEAN", "Oceanfront", "High loyalty tier Diamond VIP"),
        ("206", 2, "RT-EXE", "MAINTENANCE", "IN_PROGRESS", "Oceanfront", "AC sensor replacement in progress"),

        # Floor 3 - Executive Suites
        ("301", 3, "RT-EXE", "OCCUPIED", "CLEAN", "Oceanfront Panoramic", "Honeymoon setup with rose petals"),
        ("302", 3, "RT-EXE", "AVAILABLE", "CLEAN", "Oceanfront Panoramic", None),
        ("303", 3, "RT-EXE", "OCCUPIED", "CLEAN", "Skyline View", None),
        ("304", 3, "RT-EXE", "AVAILABLE", "CLEAN", "Skyline View", None),

        # Floor 4 - Penthouses
        ("401", 4, "RT-ROYAL", "OCCUPIED", "CLEAN", "360 Skyline & Ocean", "Head of delegation stay"),
        ("402", 4, "RT-ROYAL", "AVAILABLE", "CLEAN", "360 Skyline & Ocean", "Inspected and ready for VIP arrival"),

        # Villas
        ("V-01", 1, "RT-VILLA", "OCCUPIED", "CLEAN", "Beachfront Private Access", "Private Chef booked for 7:30 PM"),
        ("V-02", 1, "RT-VILLA", "AVAILABLE", "CLEAN", "Beachfront Private Access", "Infinity pool cleaned this morning")
    ]
    cur.executemany("""
        INSERT INTO rooms (room_number, floor, room_type_id, status, cleanliness, view_type, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rooms_data)

    # 3. Guests (Indian & Global VIP profiles)
    today = datetime.date.today().isoformat()
    guests = [
        ("G-1001", "Aditya & Priya", "Sharma", "aditya.sharma@tata.in", "+91 98201 44520", "Diamond VIP", 1, "IND-A9812450", "Mumbai, Maharashtra", "Prefers sparkling water and firm mattress"),
        ("G-1002", "Vikram", "Singhania", "v.singhania@apexcapital.in", "+91 98110 33211", "Platinum", 1, "IND-S4418902", "New Delhi, Delhi", "Keynote speaker, requires high-speed Wi-Fi"),
        ("G-1003", "Dr. Ananya", "Iyer", "dr.iyer@apollohospitals.org", "+91 97401 22890", "Gold", 0, "IND-I8723910", "Bengaluru, Karnataka", "Vegetarian breakfast preferences"),
        ("G-1004", "Rahul", "Mehta", "rahul.mehta@diamondbourses.com", "+91 98250 88120", "Silver", 0, "IND-M1029384", "Surat, Gujarat", "First-time visitor to the resort"),
        ("G-1005", "Rohan & Sneha", "Kapoor", "kapoor.family@bollywoodfilms.in", "+91 98200 99881", "Diamond VIP", 1, "IND-K5561234", "Bandra West, Mumbai", "Enjoys morning yoga and private butler"),
        ("G-1006", "Kabir", "Choudhury", "kabir.c@kolkatainvest.in", "+91 98300 77112", "Platinum", 1, "IND-C7712390", "Kolkata, West Bengal", "Celebrating wedding anniversary"),
        ("G-1007", "Dr. Kenji", "Sato", "dr.sato@biolabs.jp", "+81 90 1234 5678", "Gold", 0, "JPN-3341098", "Tokyo, Japan", "Attending medical symposium")
    ]
    cur.executemany("""
        INSERT INTO guests (id, first_name, last_name, email, phone, loyalty_tier, vip_status, id_passport, address, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, guests)

    # 4. Bookings (in INR ₹)
    d0 = datetime.date.today()
    d_minus_2 = (d0 - datetime.timedelta(days=2)).isoformat()
    d_minus_1 = (d0 - datetime.timedelta(days=1)).isoformat()
    d_plus_1 = (d0 + datetime.timedelta(days=1)).isoformat()
    d_plus_2 = (d0 + datetime.timedelta(days=2)).isoformat()
    d_plus_3 = (d0 + datetime.timedelta(days=3)).isoformat()
    d_plus_5 = (d0 + datetime.timedelta(days=5)).isoformat()

    bookings = [
        ("GH-2026-8801", "G-1001", "401", "RT-ROYAL", d_minus_2, d_plus_2, 4, 2, "CHECKED_IN", 24500.0, "Complimentary Champagne upon arrival", "RFID-401-A"),
        ("GH-2026-8802", "G-1002", "101", "RT-DLX", d_minus_1, d_plus_1, 2, 1, "CHECKED_IN", 6500.0, "Quiet room away from elevators", "RFID-101-B"),
        ("GH-2026-8803", "G-1003", "201", "RT-DLX", d_minus_2, d_plus_3, 5, 2, "CHECKED_IN", 6500.0, "Extra bathrobes and fresh fruit daily", "RFID-201-C"),
        ("GH-2026-8804", "G-1004", "103", "RT-DLX", d_minus_1, d_plus_2, 3, 1, "CHECKED_IN", 6500.0, "Requires airport transfer on checkout", "RFID-103-D"),
        ("GH-2026-8805", "G-1005", "301", "RT-EXE", d_minus_2, d_plus_3, 5, 2, "CHECKED_IN", 11500.0, "Balcony sun loungers configured", "RFID-301-E"),
        ("GH-2026-8806", "G-1006", "V-01", "RT-VILLA", d_minus_1, d_plus_5, 6, 4, "CHECKED_IN", 48000.0, "Private villa beach cabana reserved", "RFID-V01-F"),
        ("GH-2026-8807", "G-1007", "204", "RT-DLX", d0.isoformat(), d_plus_3, 3, 1, "CONFIRMED", 6500.0, "Arriving late evening around 8:00 PM", None),
        ("GH-2026-8808", "G-1002", "205", "RT-EXE", d_minus_2, d0.isoformat(), 2, 1, "CHECKED_OUT", 11500.0, "Express checkout completed via app", "EXPIRED-205")
    ]
    cur.executemany("""
        INSERT INTO bookings (id, guest_id, room_number, room_type_id, check_in_date, check_out_date, total_nights, guests_count, status, nightly_rate, special_requests, keycard_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, bookings)

    # 5. Folio Items (Charges in INR ₹ with 18% GST / 12% GST)
    folio_items = [
        ("F-101", "GH-2026-8801", "ROOM", "Royal Penthouse Suite (4 Nights @ ₹24,500)", 98000.0, 0.18, 115640.0),
        ("F-102", "GH-2026-8801", "DINING", "Le Ciel Rooftop Dinner - Awadhi Biryani & Tandoori Feast", 4800.0, 0.18, 5664.0),
        ("F-103", "GH-2026-8801", "SPA", "Couple's Ayurvedic Abhyanga & Aromatherapy Ritual", 6500.0, 0.18, 7670.0),
        ("F-104", "GH-2026-8802", "ROOM", "Deluxe Ocean View (2 Nights @ ₹6,500)", 13000.0, 0.12, 14560.0),
        ("F-105", "GH-2026-8802", "DINING", "In-Room Breakfast - Masala Dosa, Idli & Filter Coffee", 850.0, 0.18, 1003.0),
        ("F-106", "GH-2026-8803", "ROOM", "Deluxe Ocean View (5 Nights @ ₹6,500)", 32500.0, 0.12, 36400.0),
        ("F-107", "GH-2026-8803", "MINIBAR", "Selected Indian Wine & Artisan Chocolates", 3200.0, 0.18, 3776.0),
        ("F-108", "GH-2026-8805", "ROOM", "Executive Suite (5 Nights @ ₹11,500)", 57500.0, 0.18, 67850.0),
        ("F-109", "GH-2026-8805", "SPA", "Revitalizing Mineral Body Polish & Shirodhara", 4500.0, 0.18, 5310.0),
        ("F-110", "GH-2026-8806", "ROOM", "Azure Beachfront Villa (6 Nights @ ₹48,000)", 288000.0, 0.18, 339840.0),
        ("F-111", "GH-2026-8806", "DINING", "Private Sunset Beach Coastal Barbecue", 12500.0, 0.18, 14750.0),
        ("F-112", "GH-2026-8808", "ROOM", "Executive Suite (2 Nights @ ₹11,500)", 23000.0, 0.18, 27140.0)
    ]
    cur.executemany("""
        INSERT INTO folio_items (id, booking_id, category, description, amount, tax_rate, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, folio_items)

    # 6. Payments (INR ₹ settlement via UPI / NetBanking / Cards)
    payments = [
        ("P-201", "GH-2026-8801", 75000.0, "UPI_NETBANKING", "UPI-889104A", "SETTLED"),
        ("P-202", "GH-2026-8802", 15563.0, "HDFC_CREDIT_CARD", "TXN-551240B", "SETTLED"),
        ("P-203", "GH-2026-8805", 40000.0, "ICICI_NETBANKING", "TXN-330198C", "SETTLED"),
        ("P-204", "GH-2026-8806", 250000.0, "NEFT_RTGS", "TXN-774411D", "SETTLED"),
        ("P-205", "GH-2026-8808", 27140.0, "RUPAY_PLATINUM", "TXN-998822E", "SETTLED")
    ]
    cur.executemany("""
        INSERT INTO payments (id, booking_id, amount, payment_method, transaction_ref, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, payments)

    # 7. Housekeeping Tasks
    housekeeping = [
        ("HK-101", "104", "TURNDOWN", "HIGH", "IN_PROGRESS", "Maria Santos", "Guest checked out, turnaround needed for 3 PM arrival", today),
        ("HK-102", "206", "MAINTENANCE", "URGENT", "IN_PROGRESS", "David Kim (Engineering)", "Master bedroom AC thermostat erratic cycle", today),
        ("HK-103", "102", "DAILY_CLEAN", "NORMAL", "COMPLETED", "Elena Rostova", "Regular scheduled morning cleaning & towel refresh", today),
        ("HK-104", "402", "DEEP_CLEAN", "HIGH", "COMPLETED", "Sarah Jenkins", "VIP Royal Penthouse preparation checklist complete", today),
        ("HK-105", "302", "DAILY_CLEAN", "NORMAL", "PENDING", "Maria Santos", "Scheduled turnover inspection", today),
        ("HK-106", "V-02", "DAILY_CLEAN", "NORMAL", "COMPLETED", "Carlos Mendez", "Pool deck lounge chairs sanitized & stocked", today)
    ]
    cur.executemany("""
        INSERT INTO housekeeping_tasks (id, room_number, task_type, priority, status, assigned_to, reported_issue, scheduled_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, housekeeping)

    # 8. Room Service Menu (Prices in INR ₹)
    menu_items = [
        ("M-101", "BREAKFAST", "Grand Horizon Royal Breakfast Thali", "Fresh stuffed parathas, poori bhaji, artisanal curd, masala chai, seasonal cut fruits", 850.0, 1),
        ("M-102", "BREAKFAST", "Truffle Eggs Benedict & Brioche", "Poached organic eggs, smoked ham, toasted brioche, shaved black truffles, hollandaise", 750.0, 1),
        ("M-103", "MAINS", "Dum Pukht Awadhi Mutton Biryani", "Slow cooked long grain basmati rice, tender lamb, saffron, served with burani raita", 1450.0, 1),
        ("M-104", "MAINS", "Pan-Seared Chilean Sea Bass & Saffron", "Saffron risotto, charred asparagus, Meyer lemon beurre blanc", 1650.0, 1),
        ("M-105", "MAINS", "Artisanal Paneer Makhani & Garlic Naan", "Farm fresh cottage cheese simmered in rich velvety tomato cashew gravy with hot naan", 950.0, 1),
        ("M-106", "DESSERTS", "Kesar Pista Kulfi & Valrhona Chocolate", "Traditional slow-reduced saffron pistachio kulfi and molten dark chocolate cake", 550.0, 1),
        ("M-107", "WINE", "Moët & Chandon Impérial Brut (750ml)", "Classic brut champagne, crisp fruit and brioche notes", 11500.0, 1),
        ("M-108", "WINE", "Sula Rasa Cabernet Sauvignon 2021", "Dindori reserve, rich blackberry, French oak finish", 3800.0, 1),
        ("M-109", "BEVERAGES", "Cold-Pressed Green Glow & Masala Chai", "Organic kale, ginger, cucumber, green apple and royal cutting chai", 320.0, 1)
    ]
    cur.executemany("""
        INSERT INTO room_service_menu (id, category, name, description, price, is_available)
        VALUES (?, ?, ?, ?, ?, ?)
    """, menu_items)


def get_hotel_summary() -> Dict[str, Any]:
    """Calculates PMS KPI metrics: Total Rooms, Occupied, ADR, RevPAR, Revenue, Arrivals, Departures."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM rooms")
    total_rooms = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM rooms WHERE status = 'OCCUPIED'")
    occupied_rooms = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM rooms WHERE status = 'AVAILABLE'")
    available_rooms = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM rooms WHERE status = 'CLEANING'")
    cleaning_rooms = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM rooms WHERE status = 'MAINTENANCE'")
    maintenance_rooms = cur.fetchone()[0]

    today = datetime.date.today().isoformat()

    # Today's arrivals (Confirmed bookings with check_in_date = today)
    cur.execute("SELECT COUNT(*) FROM bookings WHERE check_in_date = ? AND status = 'CONFIRMED'", (today,))
    today_arrivals = cur.fetchone()[0]

    # Today's departures (Checked in bookings with check_out_date = today)
    cur.execute("SELECT COUNT(*) FROM bookings WHERE check_out_date = ? AND status = 'CHECKED_IN'", (today,))
    today_departures = cur.fetchone()[0]

    # Total folio revenue
    cur.execute("SELECT COALESCE(SUM(total_amount), 0) FROM folio_items")
    total_revenue = cur.fetchone()[0]

    # Total payments collected
    cur.execute("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'SETTLED'")
    total_collected = cur.fetchone()[0]

    # Average Daily Rate (ADR) of active stays
    cur.execute("SELECT AVG(nightly_rate) FROM bookings WHERE status = 'CHECKED_IN'")
    adr_val = cur.fetchone()[0]
    adr = round(adr_val, 2) if adr_val else 0.0

    occupancy_rate = round((occupied_rooms / total_rooms * 100), 1) if total_rooms > 0 else 0.0
    revpar = round(adr * (occupancy_rate / 100), 2)

    conn.close()

    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "available_rooms": available_rooms,
        "cleaning_rooms": cleaning_rooms,
        "maintenance_rooms": maintenance_rooms,
        "occupancy_rate": occupancy_rate,
        "adr": adr,
        "revpar": revpar,
        "today_arrivals": today_arrivals,
        "today_departures": today_departures,
        "total_revenue": total_revenue,
        "total_collected": total_collected,
        "outstanding_balance": round(total_revenue - total_collected, 2)
    }

def get_all_data() -> Dict[str, Any]:
    """Retrieves full normalized dataset for the PMS frontend."""
    conn = get_connection()
    cur = conn.cursor()

    # Room types
    cur.execute("SELECT * FROM room_types ORDER BY base_price ASC")
    room_types = [dict(row) for row in cur.fetchall()]

    # Rooms with joined room type details
    cur.execute("""
        SELECT r.*, rt.name as room_type_name, rt.category as room_type_category, rt.base_price, rt.bed_type, rt.size_sqft,
               b.id as active_booking_id, g.first_name || ' ' || g.last_name as current_guest_name, g.vip_status
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        LEFT JOIN bookings b ON r.room_number = b.room_number AND b.status = 'CHECKED_IN'
        LEFT JOIN guests g ON b.guest_id = g.id
        ORDER BY r.floor ASC, r.room_number ASC
    """)
    rooms = [dict(row) for row in cur.fetchall()]

    # Guests
    cur.execute("SELECT * FROM guests ORDER BY last_name ASC")
    guests = [dict(row) for row in cur.fetchall()]

    # Bookings with guest name and room type
    cur.execute("""
        SELECT b.*, g.first_name, g.last_name, g.email, g.phone, g.loyalty_tier, g.vip_status,
               rt.name as room_type_name, rt.category as room_type_category,
               (SELECT COALESCE(SUM(total_amount), 0) FROM folio_items WHERE booking_id = b.id) as total_charges,
               (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE booking_id = b.id) as total_paid
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN room_types rt ON b.room_type_id = rt.id
        ORDER BY b.created_at DESC
    """)
    bookings = [dict(row) for row in cur.fetchall()]

    # Housekeeping
    cur.execute("""
        SELECT h.*, r.room_type_id, rt.name as room_type_name
        FROM housekeeping_tasks h
        JOIN rooms r ON h.room_number = r.room_number
        JOIN room_types rt ON r.room_type_id = rt.id
        ORDER BY 
            CASE priority 
                WHEN 'URGENT' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'NORMAL' THEN 3 
                ELSE 4 
            END,
            h.scheduled_date ASC
    """)
    tasks = [dict(row) for row in cur.fetchall()]

    # Menu
    cur.execute("SELECT * FROM room_service_menu ORDER BY category, price ASC")
    menu = [dict(row) for row in cur.fetchall()]

    summary = get_hotel_summary()

    conn.close()

    return {
        "summary": summary,
        "room_types": room_types,
        "rooms": rooms,
        "guests": guests,
        "bookings": bookings,
        "tasks": tasks,
        "menu": menu
    }

def get_folio(booking_id: str) -> Dict[str, Any]:
    """Retrieves full billing ledger, itemized charges, and payment history for a booking."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT b.*, g.first_name, g.last_name, g.email, g.phone, g.loyalty_tier, g.address,
               rt.name as room_type_name, rt.category as room_type_category
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN room_types rt ON b.room_type_id = rt.id
        WHERE b.id = ?
    """, (booking_id,))
    booking_row = cur.fetchone()
    if not booking_row:
        conn.close()
        return {"error": f"Booking {booking_id} not found"}

    booking = dict(booking_row)

    cur.execute("SELECT * FROM folio_items WHERE booking_id = ? ORDER BY created_at ASC", (booking_id,))
    charges = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at ASC", (booking_id,))
    payments = [dict(r) for r in cur.fetchall()]

    subtotal = sum(item["amount"] for item in charges)
    tax_total = sum(item["total_amount"] - item["amount"] for item in charges)
    total_charges = sum(item["total_amount"] for item in charges)
    total_paid = sum(p["amount"] for p in payments)
    balance_due = round(total_charges - total_paid, 2)

    conn.close()

    return {
        "booking": booking,
        "charges": charges,
        "payments": payments,
        "subtotal": round(subtotal, 2),
        "tax_total": round(tax_total, 2),
        "total_charges": round(total_charges, 2),
        "total_paid": round(total_paid, 2),
        "balance_due": balance_due
    }

def execute_raw_sql(query: str) -> Dict[str, Any]:
    """Executes a user-submitted SQL query in the SQLite database and returns results."""
    query_trimmed = query.strip()
    if not query_trimmed:
        return {"error": "Empty SQL query"}

    conn = get_connection()
    cur = conn.cursor()
    start_time = datetime.datetime.now()

    try:
        # Check if query modifies data
        is_select = query_trimmed.upper().startswith(("SELECT", "PRAGMA", "EXPLAIN"))
        
        cur.execute(query_trimmed)
        
        if is_select:
            columns = [col[0] for col in cur.description] if cur.description else []
            rows = [list(r) for r in cur.fetchall()]
            elapsed_ms = (datetime.datetime.now() - start_time).total_seconds() * 1000.0
            conn.close()
            return {
                "columns": columns,
                "rows": rows,
                "rowCount": len(rows),
                "elapsedMs": round(elapsed_ms, 2),
                "isSelect": True
            }
        else:
            conn.commit()
            rows_affected = cur.rowcount
            elapsed_ms = (datetime.datetime.now() - start_time).total_seconds() * 1000.0
            conn.close()
            return {
                "columns": ["Result", "Rows Affected"],
                "rows": [["Query executed successfully", rows_affected]],
                "rowCount": rows_affected,
                "elapsedMs": round(elapsed_ms, 2),
                "isSelect": False
            }
    except Exception as e:
        conn.close()
        return {"error": str(e)}

def run_python_snippet(code: str) -> Dict[str, Any]:
    """Executes a Python management routine with database connection in scope."""
    import io
    from contextlib import redirect_stdout, redirect_stderr

    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()

    conn = get_connection()
    scope = {
        "conn": conn,
        "cursor": conn.cursor(),
        "sqlite3": sqlite3,
        "datetime": datetime,
        "json": json,
        "get_hotel_summary": get_hotel_summary,
        "get_all_data": get_all_data,
        "get_folio": get_folio,
    }

    start_time = datetime.datetime.now()
    error_msg = None
    result_val = None

    try:
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            # Check if it's an expression or code block
            try:
                result_val = eval(code, scope)
            except SyntaxError:
                exec(code, scope)
                result_val = scope.get("result", None)
    except Exception as e:
        error_msg = str(e)
    finally:
        try:
            conn.commit()
            conn.close()
        except Exception:
            pass

    elapsed_ms = (datetime.datetime.now() - start_time).total_seconds() * 1000.0

    return {
        "stdout": stdout_capture.getvalue(),
        "stderr": stderr_capture.getvalue(),
        "result": str(result_val) if result_val is not None else None,
        "error": error_msg,
        "elapsedMs": round(elapsed_ms, 2)
    }

def handle_rpc(data: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatches JSON RPC operations from the API server."""
    action = data.get("action")
    params = data.get("params", {})

    if action == "init":
        init_db(force=params.get("force", False))
        return {"success": True, "message": "Database initialized"}

    elif action == "get_all":
        return get_all_data()

    elif action == "get_summary":
        return get_hotel_summary()

    elif action == "get_folio":
        return get_folio(params.get("booking_id"))

    elif action == "execute_sql":
        return execute_raw_sql(params.get("query", ""))

    elif action == "run_python":
        return run_python_snippet(params.get("code", ""))

    elif action == "create_booking":
        conn = get_connection()
        cur = conn.cursor()
        booking_id = f"GH-{datetime.date.today().year}-{uuid.uuid4().hex[:4].upper()}"
        guest_id = params.get("guest_id")
        
        # If new guest
        if not guest_id:
            guest_id = f"G-{uuid.uuid4().hex[:4].upper()}"
            cur.execute("""
                INSERT INTO guests (id, first_name, last_name, email, phone, loyalty_tier, vip_status, id_passport, address, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                guest_id,
                params.get("first_name", "Guest"),
                params.get("last_name", "Resident"),
                params.get("email", f"guest.{guest_id.lower()}@hotel.com"),
                params.get("phone", "+1 555-0100"),
                params.get("loyalty_tier", "Silver"),
                1 if params.get("vip_status") else 0,
                params.get("id_passport", "PASS-AUTO"),
                params.get("address", "N/A"),
                params.get("guest_notes", "")
            ))

        room_number = params.get("room_number")
        room_type_id = params.get("room_type_id")
        check_in_date = params.get("check_in_date")
        check_out_date = params.get("check_out_date")
        total_nights = int(params.get("total_nights", 1))
        guests_count = int(params.get("guests_count", 1))
        nightly_rate = float(params.get("nightly_rate", 6500.0))
        special_requests = params.get("special_requests", "")

        status = "CONFIRMED"
        keycard = None
        if params.get("auto_checkin"):
            status = "CHECKED_IN"
            keycard = f"RFID-{room_number}-{uuid.uuid4().hex[:3].upper()}"
            if room_number:
                cur.execute("UPDATE rooms SET status = 'OCCUPIED' WHERE room_number = ?", (room_number,))

        cur.execute("""
            INSERT INTO bookings (id, guest_id, room_number, room_type_id, check_in_date, check_out_date, total_nights, guests_count, status, nightly_rate, special_requests, keycard_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (booking_id, guest_id, room_number, room_type_id, check_in_date, check_out_date, total_nights, guests_count, status, nightly_rate, special_requests, keycard))

        # Add initial room charge to folio (with GST 18%)
        room_subtotal = nightly_rate * total_nights
        tax_rate = 0.18
        total_charge = room_subtotal * (1 + tax_rate)
        folio_id = f"F-{uuid.uuid4().hex[:5].upper()}"
        cur.execute("""
            INSERT INTO folio_items (id, booking_id, category, description, amount, tax_rate, total_amount)
            VALUES (?, ?, 'ROOM', ?, ?, ?, ?)
        """, (folio_id, booking_id, f"Accommodations ({total_nights} Nights @ ₹{nightly_rate:,.2f})", room_subtotal, tax_rate, total_charge))

        conn.commit()
        conn.close()
        return {"success": True, "booking_id": booking_id, "guest_id": guest_id}

    elif action == "check_in":
        booking_id = params.get("booking_id")
        room_number = params.get("room_number")
        conn = get_connection()
        cur = conn.cursor()
        keycard = f"RFID-{room_number}-{uuid.uuid4().hex[:4].upper()}"
        cur.execute("""
            UPDATE bookings SET status = 'CHECKED_IN', room_number = ?, keycard_code = ? WHERE id = ?
        """, (room_number, keycard, booking_id))
        cur.execute("UPDATE rooms SET status = 'OCCUPIED' WHERE room_number = ?", (room_number,))
        conn.commit()
        conn.close()
        return {"success": True, "keycard_code": keycard}

    elif action == "check_out":
        booking_id = params.get("booking_id")
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT room_number FROM bookings WHERE id = ?", (booking_id,))
        row = cur.fetchone()
        room_number = row["room_number"] if row else None
        
        cur.execute("UPDATE bookings SET status = 'CHECKED_OUT' WHERE id = ? ", (booking_id,))
        if room_number:
            # Mark room as cleaning/dirty
            cur.execute("UPDATE rooms SET status = 'CLEANING', cleanliness = 'DIRTY' WHERE room_number = ?", (room_number,))
            # Create a housekeeping turnover task
            hk_id = f"HK-{uuid.uuid4().hex[:4].upper()}"
            today = datetime.date.today().isoformat()
            cur.execute("""
                INSERT INTO housekeeping_tasks (id, room_number, task_type, priority, status, assigned_to, reported_issue, scheduled_date)
                VALUES (?, ?, 'TURNDOWN', 'HIGH', 'PENDING', 'Staff Attendant', 'Turnover cleaning following checkout', ?)
            """, (hk_id, room_number, today))

        conn.commit()
        conn.close()
        return {"success": True, "room_number": room_number}

    elif action == "add_folio_charge":
        booking_id = params.get("booking_id")
        category = params.get("category", "SERVICE")
        description = params.get("description", "Room Service")
        amount = float(params.get("amount", 0.0))
        tax_rate = float(params.get("tax_rate", 0.18))
        total_amount = round(amount * (1 + tax_rate), 2)
        charge_id = f"F-{uuid.uuid4().hex[:5].upper()}"

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO folio_items (id, booking_id, category, description, amount, tax_rate, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (charge_id, booking_id, category, description, amount, tax_rate, total_amount))
        conn.commit()
        conn.close()
        return {"success": True, "charge_id": charge_id}

    elif action == "add_payment":
        booking_id = params.get("booking_id")
        amount = float(params.get("amount", 0.0))
        payment_method = params.get("payment_method", "CREDIT_CARD")
        transaction_ref = f"TXN-{uuid.uuid4().hex[:6].upper()}"
        payment_id = f"P-{uuid.uuid4().hex[:5].upper()}"

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO payments (id, booking_id, amount, payment_method, transaction_ref, status)
            VALUES (?, ?, ?, ?, ?, 'SETTLED')
        """, (payment_id, booking_id, amount, payment_method, transaction_ref))
        conn.commit()
        conn.close()
        return {"success": True, "payment_id": payment_id, "transaction_ref": transaction_ref}

    elif action == "update_room_status":
        room_number = params.get("room_number")
        status = params.get("status")
        cleanliness = params.get("cleanliness")
        notes = params.get("notes")

        conn = get_connection()
        cur = conn.cursor()
        
        updates = []
        vals = []
        if status:
            updates.append("status = ?")
            vals.append(status)
        if cleanliness:
            updates.append("cleanliness = ?")
            vals.append(cleanliness)
        if notes is not None:
            updates.append("notes = ?")
            vals.append(notes)
        vals.append(room_number)

        if updates:
            cur.execute(f"UPDATE rooms SET {', '.join(updates)} WHERE room_number = ?", vals)
            conn.commit()
        conn.close()
        return {"success": True}

    elif action == "update_task_status":
        task_id = params.get("task_id")
        status = params.get("status")
        conn = get_connection()
        cur = conn.cursor()
        completed_at = datetime.datetime.now().isoformat() if status == "COMPLETED" else None
        cur.execute("UPDATE housekeeping_tasks SET status = ?, completed_at = ? WHERE id = ?", (status, completed_at, task_id))
        
        # If task completed, check if room can be set clean
        if status == "COMPLETED":
            cur.execute("SELECT room_number FROM housekeeping_tasks WHERE id = ?", (task_id,))
            r = cur.fetchone()
            if r:
                cur.execute("UPDATE rooms SET cleanliness = 'CLEAN', status = CASE WHEN status = 'CLEANING' THEN 'AVAILABLE' ELSE status END WHERE room_number = ?", (r["room_number"],))

        conn.commit()
        conn.close()
        return {"success": True}

    elif action == "create_task":
        task_id = f"HK-{uuid.uuid4().hex[:4].upper()}"
        room_number = params.get("room_number")
        task_type = params.get("task_type", "DAILY_CLEAN")
        priority = params.get("priority", "NORMAL")
        assigned_to = params.get("assigned_to", "Attendant")
        reported_issue = params.get("reported_issue", "Routine cleaning")
        scheduled_date = datetime.date.today().isoformat()

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO housekeeping_tasks (id, room_number, task_type, priority, status, assigned_to, reported_issue, scheduled_date)
            VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?)
        """, (task_id, room_number, task_type, priority, assigned_to, reported_issue, scheduled_date))
        conn.commit()
        conn.close()
        return {"success": True, "task_id": task_id}

    return {"error": f"Unknown action: {action}"}

def main():
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "init":
            init_db(force=True)
            print("Database initialized and seeded.")
        elif cmd == "stats":
            init_db(force=False)
            print(json.dumps(get_hotel_summary(), indent=2))
        elif cmd == "get_all":
            init_db(force=False)
            print(json.dumps(get_all_data(), indent=2))
        elif cmd == "rpc":
            init_db(force=False)
            payload = json.loads(sys.stdin.read())
            res = handle_rpc(payload)
            print(json.dumps(res))
        else:
            print(f"Unknown command: {cmd}")
    else:
        # Default run: ensure db is initialized
        init_db(force=False)
        print("Grand Horizon Hotel Python PMS Backend ready.")

if __name__ == "__main__":
    main()
