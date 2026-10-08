import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Receipt, 
  KeyRound, 
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Room, Booking, Guest, HotelSummary, RoomType } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';

interface BasicHtmlViewProps {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  summary: HotelSummary | null;
  roomTypes: RoomType[];
  onRefreshAll: () => void;
  onOpenFolio: (bookingId: string) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onQuickStatusChange: (roomNumber: string, status: string) => void;
}

export const BasicHtmlView: React.FC<BasicHtmlViewProps> = ({
  rooms,
  bookings,
  guests,
  summary,
  roomTypes,
  onRefreshAll,
  onOpenFolio,
  onCheckIn,
  onCheckOut,
  onQuickStatusChange,
}) => {
  const [activeSection, setActiveSection] = useState<'APP' | 'TEMPLATES'>('APP');
  const [selectedTemplate, setSelectedTemplate] = useState<'INDEX' | 'ROOMS' | 'BOOKING' | 'FLASK'>('INDEX');
  const [copied, setCopied] = useState(false);

  // New Booking Form State (Standard HTML form)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [roomType, setRoomType] = useState(roomTypes[0]?.id || 'RT-DLX');
  const [roomNumber, setRoomNumber] = useState(rooms[0]?.room_number || '101');
  const [requests, setRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    setIsSubmitting(true);
    setFormMsg(null);

    const dIn = new Date(checkIn);
    const dOut = new Date(checkOut);
    const totalNights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
    const selectedRt = roomTypes.find(r => r.id === roomType);

    try {
      const res = await api.createBooking({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+1 555-0100',
        room_type_id: roomType,
        room_number: roomNumber || undefined,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_nights: totalNights,
        guests_count: 2,
        nightly_rate: selectedRt ? selectedRt.base_price : 280,
        special_requests: requests,
        auto_checkin: false
      });

      if (res.success) {
        setFormMsg(`Reservation ${res.booking_id} created successfully!`);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setRequests('');
        onRefreshAll();
      } else {
        setFormMsg(`Error: ${res.error}`);
      }
    } catch (err: any) {
      setFormMsg(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pure HTML Templates code snippets
  const HTML_TEMPLATES = {
    INDEX: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hotel Management System</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
    header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
    h1 { margin: 0 0 5px 0; font-size: 24px; }
    nav a { margin-right: 15px; color: #0066cc; text-decoration: none; font-weight: bold; }
    nav a:hover { text-decoration: underline; }
    .kpi-box { display: inline-block; border: 1px solid #ccc; padding: 12px 18px; margin-right: 15px; margin-bottom: 15px; background: #f9f9f9; border-radius: 4px; }
    .kpi-title { font-size: 12px; color: #666; text-transform: uppercase; }
    .kpi-value { font-size: 22px; font-weight: bold; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #fafafa; }
    .status-available { color: green; font-weight: bold; }
    .status-occupied { color: #d97706; font-weight: bold; }
    .status-cleaning { color: #0284c7; font-weight: bold; }
    button, input[type="submit"] { background: #0066cc; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 3px; }
    button:hover { background: #004d99; }
  </style>
</head>
<body>
  <header>
    <h1>Grand Horizon - Hotel Management System</h1>
    <p>Connected to SQLite Database (hotel.db) via Python Backend</p>
    <nav>
      <a href="#rooms">Room Inventory</a>
      <a href="#bookings">Reservations</a>
      <a href="#new-booking">New Booking Form</a>
      <a href="#reports">KPI Reports</a>
    </nav>
  </header>

  <!-- Summary Statistics -->
  <section id="reports">
    <h2>Property Summary</h2>
    <div class="kpi-box">
      <div class="kpi-title">Total Rooms</div>
      <div class="kpi-value">{{ total_rooms }}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-title">Occupancy Rate</div>
      <div class="kpi-value">{{ occupancy_rate }}%</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-title">Average Daily Rate (ADR)</div>
      <div class="kpi-value">₹{{ adr }}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-title">RevPAR</div>
      <div class="kpi-value">₹{{ revpar }}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-title">Gross Revenue</div>
      <div class="kpi-value">₹{{ total_revenue }}</div>
    </div>
  </section>

  <!-- Rooms Table -->
  <section id="rooms">
    <h2>Room Inventory</h2>
    <table>
      <thead>
        <tr>
          <th>Room #</th>
          <th>Floor</th>
          <th>Suite Type</th>
          <th>Rate/Night</th>
          <th>Status</th>
          <th>Cleanliness</th>
          <th>Current Guest</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {% for room in rooms %}
        <tr>
          <td><strong>{{ room.room_number }}</strong></td>
          <td>{{ room.floor }}</td>
          <td>{{ room.room_type_name }}</td>
          <td>₹{{ room.base_price }}</td>
          <td><span class="status-{{ room.status|lower }}">{{ room.status }}</span></td>
          <td>{{ room.cleanliness }}</td>
          <td>{{ room.current_guest_name or '—' }}</td>
          <td>
            <a href="/rooms/edit/{{ room.room_number }}">Manage</a>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </section>
</body>
</html>`,

    ROOMS: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Room Management - Basic HTML</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ccc; padding: 8px 10px; font-size: 14px; text-align: left; }
    th { background: #eee; }
    select, button { padding: 4px 8px; }
  </style>
</head>
<body>
  <h1>Room Inventory & Status Updates</h1>
  <p><a href="/">← Return to Dashboard</a></p>
  <table>
    <thead>
      <tr>
        <th>Room #</th>
        <th>Category</th>
        <th>Status</th>
        <th>Cleanliness</th>
        <th>Update Status</th>
      </tr>
    </thead>
    <tbody>
      {% for room in rooms %}
      <tr>
        <td><strong>Room {{ room.room_number }}</strong></td>
        <td>{{ room.room_type_name }} (Floor {{ room.floor }})</td>
        <td>{{ room.status }}</td>
        <td>{{ room.cleanliness }}</td>
        <td>
          <form method="POST" action="/rooms/update" style="display:inline;">
            <input type="hidden" name="room_number" value="{{ room.room_number }}">
            <select name="status">
              <option value="AVAILABLE" {% if room.status == 'AVAILABLE' %}selected{% endif %}>AVAILABLE</option>
              <option value="OCCUPIED" {% if room.status == 'OCCUPIED' %}selected{% endif %}>OCCUPIED</option>
              <option value="CLEANING" {% if room.status == 'CLEANING' %}selected{% endif %}>CLEANING</option>
              <option value="MAINTENANCE" {% if room.status == 'MAINTENANCE' %}selected{% endif %}>MAINTENANCE</option>
            </select>
            <button type="submit">Save</button>
          </form>
        </td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</body>
</html>`,

    BOOKING: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Reservation - HTML Form</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    form { max-width: 600px; border: 1px solid #ccc; padding: 20px; border-radius: 4px; background: #fafafa; }
    fieldset { border: 1px solid #ccc; margin-bottom: 15px; padding: 12px; }
    legend { font-weight: bold; color: #333; }
    .form-group { margin-bottom: 12px; }
    label { display: block; font-weight: bold; font-size: 13px; margin-bottom: 4px; }
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select {
      width: 100%; padding: 7px; border: 1px solid #ccc; border-radius: 3px; box-sizing: border-box;
    }
    input[type="submit"] { background: #0077cc; color: white; border: none; padding: 10px 18px; cursor: pointer; font-size: 14px; border-radius: 4px; }
    input[type="submit"]:hover { background: #005fa3; }
  </style>
</head>
<body>
  <h1>Create New Hotel Reservation</h1>
  <p><a href="/">← Return to Main Page</a></p>

  <form method="POST" action="/booking/create">
    <fieldset>
      <legend>Guest Resident Information</legend>
      <div class="form-group">
        <label for="first_name">First Name *</label>
        <input type="text" id="first_name" name="first_name" required placeholder="John">
      </div>
      <div class="form-group">
        <label for="last_name">Last Name *</label>
        <input type="text" id="last_name" name="last_name" required placeholder="Doe">
      </div>
      <div class="form-group">
        <label for="email">Email Address *</label>
        <input type="email" id="email" name="email" required placeholder="john.doe@example.com">
      </div>
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone" placeholder="+1 (555) 000-0000">
      </div>
    </fieldset>

    <fieldset>
      <legend>Stay & Room Details</legend>
      <div class="form-group">
        <label for="check_in">Check-In Date *</label>
        <input type="date" id="check_in" name="check_in_date" required>
      </div>
      <div class="form-group">
        <label for="check_out">Check-Out Date *</label>
        <input type="date" id="check_out" name="check_out_date" required>
      </div>
      <div class="form-group">
        <label for="room_type">Suite Type *</label>
        <select id="room_type" name="room_type_id" required>
          <option value="RT-DLX">Deluxe Ocean View (₹6,500/night)</option>
          <option value="RT-EXE">Executive Garden Suite (₹11,500/night)</option>
          <option value="RT-ROYAL">Royal Penthouse Suite (₹24,500/night)</option>
          <option value="RT-VILLA">Azure Beachfront Villa (₹48,000/night)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="special_requests">Special Requests</label>
        <input type="text" id="special_requests" name="special_requests" placeholder="Extra pillows, airport transfer, etc.">
      </div>
    </fieldset>

    <input type="submit" value="Confirm & Book Room">
  </form>
</body>
</html>`,

    FLASK: `# =======================================================
# Python + HTML + SQL Hotel Management System (Flask App)
# Run with: pip install flask && python app.py
# =======================================================

from flask import Flask, render_template_string, request, redirect, url_for
import sqlite3
import os

app = Flask(__name__)
DB_FILE = "hotel.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@app.route("/")
def index():
    conn = get_db()
    cur = conn.cursor()
    
    # Fetch rooms with guest names
    cur.execute("""
        SELECT r.*, rt.name as room_type_name, rt.base_price,
               g.first_name || ' ' || g.last_name as current_guest_name
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        LEFT JOIN bookings b ON r.room_number = b.room_number AND b.status = 'CHECKED_IN'
        LEFT JOIN guests g ON b.guest_id = g.id
        ORDER BY r.floor, r.room_number
    """)
    rooms = cur.fetchall()

    # KPI stats
    cur.execute("SELECT COUNT(*) FROM rooms")
    total_rooms = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM rooms WHERE status = 'OCCUPIED'")
    occupied = cur.fetchone()[0]
    cur.execute("SELECT AVG(nightly_rate) FROM bookings WHERE status = 'CHECKED_IN'")
    adr = round(cur.fetchone()[0] or 0.0, 2)
    cur.execute("SELECT COALESCE(SUM(total_amount), 0) FROM folio_items")
    revenue = round(cur.fetchone()[0], 2)
    
    occupancy = round((occupied / total_rooms * 100), 1) if total_rooms > 0 else 0
    revpar = round(adr * (occupancy / 100), 2)
    conn.close()

    return render_template_string(
        INDEX_HTML_TEMPLATE,
        rooms=rooms,
        total_rooms=total_rooms,
        occupancy_rate=occupancy,
        adr=adr,
        revpar=revpar,
        total_revenue=revenue
    )

@app.route("/rooms/update", methods=["POST"])
def update_room():
    room_num = request.form.get("room_number")
    status = request.form.get("status")
    conn = get_db()
    with conn:
        conn.execute("UPDATE rooms SET status = ? WHERE room_number = ?", (status, room_num))
    conn.close()
    return redirect(url_for("index"))

if __name__ == "__main__":
    print("Hotel Management System running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)`
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white text-slate-900 border border-slate-300 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              Basic HTML Hotel Management System
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Clean semantic HTML5 structure with standard tables, native form elements, and live Python + SQLite backend integration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('APP')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer ${
                activeSection === 'APP'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Interactive HTML Portal
            </button>
            <button
              onClick={() => setActiveSection('TEMPLATES')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer ${
                activeSection === 'TEMPLATES'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Raw HTML Templates Code
            </button>
          </div>
        </div>

        {/* Basic KPI Box Strip */}
        {summary && activeSection === 'APP' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-[11px] text-slate-500 font-bold uppercase">Total Rooms</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{summary.total_rooms}</div>
              <div className="text-[10px] text-slate-500">{summary.available_rooms} Available</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-[11px] text-slate-500 font-bold uppercase">Occupancy</div>
              <div className="text-xl font-bold text-amber-700 font-mono mt-0.5">{summary.occupancy_rate}%</div>
              <div className="text-[10px] text-slate-500">{summary.occupied_rooms} Occupied</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-[11px] text-slate-500 font-bold uppercase">ADR Rate</div>
              <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{formatINR(summary.adr)}</div>
              <div className="text-[10px] text-slate-500">Avg / Room</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-[11px] text-slate-500 font-bold uppercase">RevPAR</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{formatINR(summary.revpar)}</div>
              <div className="text-[10px] text-slate-500">Rev / Available</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-[11px] text-slate-500 font-bold uppercase">Total Revenue</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{formatINR(summary.total_revenue)}</div>
              <div className="text-[10px] text-slate-500">{formatINR(summary.total_collected)} Paid</div>
            </div>
          </div>
        )}
      </div>

      {activeSection === 'APP' ? (
        <div className="space-y-6">
          {/* 1. Basic HTML Room Inventory Table */}
          <section className="bg-white text-slate-900 border border-slate-300 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Room Inventory Table (HTML Table & Form Controls)
                </h3>
                <p className="text-xs text-slate-500">
                  Standard tabular layout showing physical rooms, suite types, and operational status dropdowns.
                </p>
              </div>
              <button
                onClick={onRefreshAll}
                className="px-2.5 py-1 text-xs border border-slate-300 hover:bg-slate-100 rounded text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 border border-slate-300">Room #</th>
                    <th className="py-2.5 px-3 border border-slate-300">Floor</th>
                    <th className="py-2.5 px-3 border border-slate-300">Suite Type</th>
                    <th className="py-2.5 px-3 border border-slate-300">Rate / Night</th>
                    <th className="py-2.5 px-3 border border-slate-300">Status</th>
                    <th className="py-2.5 px-3 border border-slate-300">Cleanliness</th>
                    <th className="py-2.5 px-3 border border-slate-300">Current Guest</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => {
                    const isOccupied = room.status === 'OCCUPIED';
                    return (
                      <tr key={room.room_number} className="hover:bg-slate-50 border-b border-slate-200">
                        <td className="py-2 px-3 border border-slate-200 font-bold font-mono text-slate-800">
                          {room.room_number}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-slate-600">
                          Floor {room.floor}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 font-medium text-slate-800">
                          {room.room_type_name}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 font-mono text-slate-700">
                          {formatINR(room.base_price)}
                        </td>
                        <td className="py-2 px-3 border border-slate-200">
                          <select
                            value={room.status}
                            onChange={(e) => onQuickStatusChange(room.room_number, e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="OCCUPIED">OCCUPIED</option>
                            <option value="CLEANING">CLEANING</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 border border-slate-200">
                          <span className={room.cleanliness === 'CLEAN' ? 'text-green-700 font-bold' : 'text-amber-700'}>
                            {room.cleanliness}
                          </span>
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-slate-700">
                          {room.current_guest_name ? (
                            <span className="font-semibold text-slate-900">{room.current_guest_name}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-center">
                          {isOccupied && room.active_booking_id ? (
                            <button
                              onClick={() => onOpenFolio(room.active_booking_id!)}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded text-xs font-medium cursor-pointer"
                            >
                              Folio Bill
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Basic HTML New Reservation Form */}
          <section className="bg-white text-slate-900 border border-slate-300 rounded-lg p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Standard HTML Reservation Form
            </h3>

            {formMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-800 text-xs rounded font-medium">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <fieldset className="border border-slate-300 rounded p-4 bg-slate-50/50">
                <legend className="font-bold text-slate-800 px-2 text-xs">Guest Contact Information</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="border border-slate-300 rounded p-4 bg-slate-50/50">
                <legend className="font-bold text-slate-800 px-2 text-xs">Dates & Room Allocation</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Check-In Date *</label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Check-Out Date *</label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Room Category *</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                    >
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} ({formatINR(rt.base_price)}/nt)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Room Assignment</label>
                    <select
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      {rooms
                        .filter((r) => r.status === 'AVAILABLE')
                        .map((r) => (
                          <option key={r.room_number} value={r.room_number}>
                            Room {r.room_number} (Floor {r.floor})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-bold text-slate-700 mb-1">Special Requests</label>
                  <input
                    type="text"
                    placeholder="e.g. Quiet floor, hypoallergenic pillows, anniversary wine"
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-2">
                <input
                  type="submit"
                  disabled={isSubmitting}
                  value={isSubmitting ? "Submitting..." : "Submit Reservation (POST to Python/SQL)"}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded cursor-pointer shadow-sm disabled:opacity-50"
                />
              </div>
            </form>
          </section>

          {/* 3. Basic HTML Reservations Table */}
          <section className="bg-white text-slate-900 border border-slate-300 rounded-lg p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Active Bookings & Guest Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 border border-slate-300">Booking ID</th>
                    <th className="py-2.5 px-3 border border-slate-300">Guest Name</th>
                    <th className="py-2.5 px-3 border border-slate-300">Room #</th>
                    <th className="py-2.5 px-3 border border-slate-300">Check-In / Out</th>
                    <th className="py-2.5 px-3 border border-slate-300">Status</th>
                    <th className="py-2.5 px-3 border border-slate-300">Total Folio</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-slate-900">
                        {b.id}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">
                        {b.first_name} {b.last_name}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-mono">
                        {b.room_number ? `Room ${b.room_number}` : 'Unassigned'}
                      </td>
                      <td className="py-2 px-3 border border-slate-200">
                        {b.check_in_date} → {b.check_out_date} ({b.total_nights} nt)
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-bold">
                        {b.status === 'CHECKED_IN' ? (
                          <span className="text-green-700">CHECKED IN</span>
                        ) : b.status === 'CONFIRMED' ? (
                          <span className="text-blue-700">CONFIRMED</span>
                        ) : (
                          <span className="text-slate-600">{b.status}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-mono font-semibold">
                        {formatINR(b.total_charges || 0)}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenFolio(b.id)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs cursor-pointer"
                          >
                            Folio
                          </button>
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => onCheckIn(b)}
                              className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                          {b.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => onCheckOut(b)}
                              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Check-Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        /* TEMPLATES CODE VIEWER */
        <div className="bg-white text-slate-900 border border-slate-300 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pure HTML5 Templates & Python Scripts
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-use HTML template files designed for Python (Flask / Django / Jinja2) and SQLite.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(HTML_TEMPLATES[selectedTemplate])}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => handleDownload(
                  selectedTemplate === 'FLASK' ? 'app.py' : `${selectedTemplate.toLowerCase()}.html`,
                  HTML_TEMPLATES[selectedTemplate]
                )}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1 cursor-pointer font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-2">
            {[
              { id: 'INDEX', label: 'index.html (Dashboard & Rooms)' },
              { id: 'ROOMS', label: 'rooms.html (Inventory & Status Form)' },
              { id: 'BOOKING', label: 'booking.html (Reservation HTML Form)' },
              { id: 'FLASK', label: 'app.py (Python Flask Server)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer whitespace-nowrap ${
                  selectedTemplate === t.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-xs font-mono text-emerald-400 max-h-[500px]">
            <pre className="whitespace-pre-wrap select-all">
              {HTML_TEMPLATES[selectedTemplate]}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
