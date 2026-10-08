import { HotelSummary, Room, RoomType, Guest, Booking, HousekeepingTask, MenuItem, FolioData } from '../types';

export const FALLBACK_ROOM_TYPES: RoomType[] = [
  {
    id: 'RT-DLX',
    name: 'Deluxe Ocean View',
    category: 'Deluxe',
    base_price: 6500.0,
    max_guests: 2,
    bed_type: 'King',
    size_sqft: 480,
    amenities: 'Ocean View Balcony, Rain Shower, Nespresso, 4K Smart TV',
    description: 'Spacious room featuring private balcony with unobstructed turquoise ocean views.'
  },
  {
    id: 'RT-EXE',
    name: 'Executive Garden Suite',
    category: 'Suite',
    base_price: 11500.0,
    max_guests: 3,
    bed_type: 'California King',
    size_sqft: 750,
    amenities: 'Private Garden Terrace, Marble Bath, Butler Service, Mini-Bar',
    description: 'Elegant suite with dedicated living lounge and serene botanical gardens.'
  },
  {
    id: 'RT-ROYAL',
    name: 'Royal Penthouse Suite',
    category: 'Penthouse',
    base_price: 24500.0,
    max_guests: 4,
    bed_type: 'Double King',
    size_sqft: 1400,
    amenities: 'Panoramic Sky Terrace, Private Jacuzzi, Fireplace, Chauffeur Service',
    description: 'Top-floor luxury penthouse with 360-degree skyline vistas and private plunge pool.'
  },
  {
    id: 'RT-VILLA',
    name: 'Azure Beachfront Villa',
    category: 'Villa',
    base_price: 48000.0,
    max_guests: 6,
    bed_type: 'Two King Master Bedrooms',
    size_sqft: 2200,
    amenities: 'Private Infinity Pool, Direct Beach Access, Full Gourmet Kitchen',
    description: 'Exclusive detached villa situated right on the powdery sand with bespoke staff.'
  }
];

export const FALLBACK_ROOMS: Room[] = [
  { room_number: '101', room_type_id: 'RT-DLX', floor: 1, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Ocean Front', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480, current_guest_name: 'Aarav Sharma', active_booking_id: 'BKG-101', vip_status: 1 },
  { room_number: '102', room_type_id: 'RT-DLX', floor: 1, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Ocean Front', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480 },
  { room_number: '103', room_type_id: 'RT-DLX', floor: 1, status: 'OCCUPIED', cleanliness: 'INSPECTED', view_type: 'Ocean Front', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480, current_guest_name: 'Priya Patel', active_booking_id: 'BKG-103', vip_status: 0 },
  { room_number: '104', room_type_id: 'RT-DLX', floor: 1, status: 'CLEANING', cleanliness: 'DIRTY', view_type: 'Ocean Front', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480 },
  { room_number: '201', room_type_id: 'RT-DLX', floor: 2, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Ocean Balcony', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480, current_guest_name: 'Rohan Mehta', active_booking_id: 'BKG-201', vip_status: 0 },
  { room_number: '202', room_type_id: 'RT-DLX', floor: 2, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Ocean Balcony', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480 },
  { room_number: '203', room_type_id: 'RT-DLX', floor: 2, status: 'MAINTENANCE', cleanliness: 'DIRTY', view_type: 'Ocean Balcony', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480 },
  { room_number: '204', room_type_id: 'RT-DLX', floor: 2, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Ocean Balcony', room_type_name: 'Deluxe Ocean View', room_type_category: 'Deluxe', base_price: 6500, bed_type: 'King', size_sqft: 480 },
  { room_number: '301', room_type_id: 'RT-EXE', floor: 3, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Botanical Garden', room_type_name: 'Executive Garden Suite', room_type_category: 'Suite', base_price: 11500, bed_type: 'California King', size_sqft: 750, current_guest_name: 'Vikram Singhania', active_booking_id: 'BKG-301', vip_status: 1 },
  { room_number: '302', room_type_id: 'RT-EXE', floor: 3, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Botanical Garden', room_type_name: 'Executive Garden Suite', room_type_category: 'Suite', base_price: 11500, bed_type: 'California King', size_sqft: 750 },
  { room_number: '303', room_type_id: 'RT-EXE', floor: 3, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Botanical Garden', room_type_name: 'Executive Garden Suite', room_type_category: 'Suite', base_price: 11500, bed_type: 'California King', size_sqft: 750, current_guest_name: 'Ananya Deshmukh', active_booking_id: 'BKG-303', vip_status: 0 },
  { room_number: '304', room_type_id: 'RT-EXE', floor: 3, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Botanical Garden', room_type_name: 'Executive Garden Suite', room_type_category: 'Suite', base_price: 11500, bed_type: 'California King', size_sqft: 750 },
  { room_number: '401', room_type_id: 'RT-ROYAL', floor: 4, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Skyline Terrace', room_type_name: 'Royal Penthouse Suite', room_type_category: 'Penthouse', base_price: 24500, bed_type: 'Double King', size_sqft: 1400, current_guest_name: 'Kabir Oberoi', active_booking_id: 'BKG-401', vip_status: 1 },
  { room_number: '402', room_type_id: 'RT-ROYAL', floor: 4, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Skyline Terrace', room_type_name: 'Royal Penthouse Suite', room_type_category: 'Penthouse', base_price: 24500, bed_type: 'Double King', size_sqft: 1400 },
  { room_number: '403', room_type_id: 'RT-ROYAL', floor: 4, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Skyline Terrace', room_type_name: 'Royal Penthouse Suite', room_type_category: 'Penthouse', base_price: 24500, bed_type: 'Double King', size_sqft: 1400 },
  { room_number: '404', room_type_id: 'RT-ROYAL', floor: 4, status: 'AVAILABLE', cleanliness: 'CLEAN', view_type: 'Skyline Terrace', room_type_name: 'Royal Penthouse Suite', room_type_category: 'Penthouse', base_price: 24500, bed_type: 'Double King', size_sqft: 1400 },
  { room_number: 'V-01', room_type_id: 'RT-VILLA', floor: 1, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Direct Beachfront', room_type_name: 'Azure Beachfront Villa', room_type_category: 'Villa', base_price: 48000, bed_type: 'Two King Master', size_sqft: 2200, current_guest_name: 'Rajesh & Sunita Jindal', active_booking_id: 'BKG-V01', vip_status: 1 },
  { room_number: 'V-02', room_type_id: 'RT-VILLA', floor: 1, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Direct Beachfront', room_type_name: 'Azure Beachfront Villa', room_type_category: 'Villa', base_price: 48000, bed_type: 'Two King Master', size_sqft: 2200, current_guest_name: 'Lord Edward Hastings', active_booking_id: 'BKG-V02', vip_status: 1 },
  { room_number: 'V-03', room_type_id: 'RT-VILLA', floor: 1, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Direct Beachfront', room_type_name: 'Azure Beachfront Villa', room_type_category: 'Villa', base_price: 48000, bed_type: 'Two King Master', size_sqft: 2200, current_guest_name: 'Advait Birla', active_booking_id: 'BKG-V03', vip_status: 1 },
  { room_number: 'V-04', room_type_id: 'RT-VILLA', floor: 1, status: 'OCCUPIED', cleanliness: 'CLEAN', view_type: 'Direct Beachfront', room_type_name: 'Azure Beachfront Villa', room_type_category: 'Villa', base_price: 48000, bed_type: 'Two King Master', size_sqft: 2200, current_guest_name: 'Dr. Siddharth Rao', active_booking_id: 'BKG-V04', vip_status: 0 }
];

export const FALLBACK_GUESTS: Guest[] = [
  { id: 'GST-001', first_name: 'Aarav', last_name: 'Sharma', email: 'aarav.sharma@horizon.in', phone: '+91 98201 44552', vip_status: 1, loyalty_tier: 'Diamond VIP', notes: 'Prefers high floor with extra goose-down pillows and Darjeeling tea.' },
  { id: 'GST-002', first_name: 'Priya', last_name: 'Patel', email: 'priya.patel@horizon.in', phone: '+91 98190 22334', vip_status: 0, loyalty_tier: 'Gold', notes: 'Allergic to gluten. Request sparkling water on arrival.' },
  { id: 'GST-003', first_name: 'Vikram', last_name: 'Singhania', email: 'v.singhania@apexcorp.in', phone: '+91 98210 99887', vip_status: 1, loyalty_tier: 'Diamond VIP', notes: 'Corporate accounts billing. Keycard directly delivered.' },
  { id: 'GST-004', first_name: 'Kabir', last_name: 'Oberoi', email: 'kabir.oberoi@cinema.in', phone: '+91 98330 11223', vip_status: 1, loyalty_tier: 'Platinum', notes: 'Requires high privacy. Discreet room service delivery.' },
  { id: 'GST-005', first_name: 'Rajesh', last_name: 'Jindal', email: 'rajesh.jindal@jindalholdings.in', phone: '+91 98450 77889', vip_status: 1, loyalty_tier: 'Diamond VIP', notes: 'Annual family retreat. Reserve private yacht charter.' }
];

export const FALLBACK_BOOKINGS: Booking[] = [
  {
    id: 'BKG-101',
    guest_id: 'GST-001',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav.sharma@horizon.in',
    phone: '+91 98201 44552',
    vip_status: 1,
    loyalty_tier: 'Diamond VIP',
    room_number: '101',
    room_type_id: 'RT-DLX',
    room_type_name: 'Deluxe Ocean View',
    room_type_category: 'Deluxe',
    check_in_date: '2026-10-06',
    check_out_date: '2026-10-10',
    total_nights: 4,
    guests_count: 2,
    nightly_rate: 6500,
    total_charges: 30680,
    total_paid: 26000,
    status: 'CHECKED_IN',
    special_requests: 'Ocean view balcony, high floor',
    created_at: '2026-10-01 10:00'
  },
  {
    id: 'BKG-301',
    guest_id: 'GST-003',
    first_name: 'Vikram',
    last_name: 'Singhania',
    email: 'v.singhania@apexcorp.in',
    phone: '+91 98210 99887',
    vip_status: 1,
    loyalty_tier: 'Diamond VIP',
    room_number: '301',
    room_type_id: 'RT-EXE',
    room_type_name: 'Executive Garden Suite',
    room_type_category: 'Suite',
    check_in_date: '2026-10-07',
    check_out_date: '2026-10-12',
    total_nights: 5,
    guests_count: 2,
    nightly_rate: 11500,
    total_charges: 67850,
    total_paid: 67850,
    status: 'CHECKED_IN',
    special_requests: 'Butler service requested',
    created_at: '2026-10-02 11:30'
  },
  {
    id: 'BKG-401',
    guest_id: 'GST-004',
    first_name: 'Kabir',
    last_name: 'Oberoi',
    email: 'kabir.oberoi@cinema.in',
    phone: '+91 98330 11223',
    vip_status: 1,
    loyalty_tier: 'Platinum',
    room_number: '401',
    room_type_id: 'RT-ROYAL',
    room_type_name: 'Royal Penthouse Suite',
    room_type_category: 'Penthouse',
    check_in_date: '2026-10-08',
    check_out_date: '2026-10-11',
    total_nights: 3,
    guests_count: 2,
    nightly_rate: 24500,
    total_charges: 86730,
    total_paid: 50000,
    status: 'CHECKED_IN',
    special_requests: 'Private Jacuzzi heating ready on arrival',
    created_at: '2026-10-03 14:00'
  },
  {
    id: 'BKG-V01',
    guest_id: 'GST-005',
    first_name: 'Rajesh',
    last_name: 'Jindal',
    email: 'rajesh.jindal@jindalholdings.in',
    phone: '+91 98450 77889',
    vip_status: 1,
    loyalty_tier: 'Diamond VIP',
    room_number: 'V-01',
    room_type_id: 'RT-VILLA',
    room_type_name: 'Azure Beachfront Villa',
    room_type_category: 'Villa',
    check_in_date: '2026-10-05',
    check_out_date: '2026-10-12',
    total_nights: 7,
    guests_count: 5,
    nightly_rate: 48000,
    total_charges: 396480,
    total_paid: 396480,
    status: 'CHECKED_IN',
    special_requests: 'Private chef dinner and champagne reception',
    created_at: '2026-09-28 09:15'
  }
];

export const FALLBACK_TASKS: HousekeepingTask[] = [
  {
    id: 'TSK-101',
    room_number: '104',
    task_type: 'DAILY_CLEAN',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigned_to: 'Maria Santos',
    reported_issue: 'Guest departed 11:00 AM. Deep sanitation and linen renewal needed.',
    scheduled_date: '2026-10-08'
  },
  {
    id: 'TSK-102',
    room_number: '203',
    task_type: 'MAINTENANCE',
    status: 'PENDING',
    priority: 'URGENT',
    assigned_to: 'Vikram Engineer',
    reported_issue: 'Smart thermostat sensor calibration and bathroom rain shower head inspection.',
    scheduled_date: '2026-10-08'
  },
  {
    id: 'TSK-103',
    room_number: '401',
    task_type: 'TURNDOWN',
    status: 'COMPLETED',
    priority: 'NORMAL',
    assigned_to: 'Sunita Sharma',
    reported_issue: 'VIP evening turndown service with lavender essential oil diffuser and bedtime macaroons.',
    scheduled_date: '2026-10-08'
  }
];

export const FALLBACK_MENU: MenuItem[] = [
  { id: 'MNU-01', category: 'Fine Dining Mains', name: 'Royal Awadhi Dum Biryani', description: 'Fragrant aged basmati rice infused with saffron, rose water, and tender slow-cooked cuts, served with burani raita.', price: 1450, is_available: 1 },
  { id: 'MNU-02', category: 'Fine Dining Mains', name: 'Dal Bukhara & Amritsari Kulcha', description: 'Slow-simmered black lentils over charcoal for 18 hours with churned white butter and crisp stuffed tandoori breads.', price: 1150, is_available: 1 },
  { id: 'MNU-03', category: 'Gourmet Platters', name: 'Grand Horizon Royal Thali', description: 'Curated 7-course feast including Paneer Lababdar, Subz Handi, Dal Tadka, saffron pulao, tandoori breads, and kesar kheer.', price: 1850, is_available: 1 },
  { id: 'MNU-04', category: 'Seafood Specialties', name: 'Tandoori Malabar Tiger Prawns', description: 'Jumbo coastal prawns marinated in crushed peppercorns, curry leaf butter, and roasted cumin glaze.', price: 2450, is_available: 1 },
  { id: 'MNU-05', category: 'Breakfast & Artisanal', name: 'Truffle Scrambled Eggs & Brioche', description: 'Farm-fresh organic eggs whisked with black summer truffle oil, cultured Normandy butter on toasted artisanal brioche.', price: 950, is_available: 1 },
  { id: 'MNU-06', category: 'Beverages & Cellar', name: 'Sula Dindori Reserve Viognier', description: 'Estate-bottled crisp Indian white wine with floral aromas of peach and honeysuckle, 750ml cellar chilled.', price: 3800, is_available: 1 }
];

export function getFallbackSummary(): HotelSummary {
  const total = FALLBACK_ROOMS.length;
  const occupied = FALLBACK_ROOMS.filter(r => r.status === 'OCCUPIED').length;
  const available = FALLBACK_ROOMS.filter(r => r.status === 'AVAILABLE').length;
  const cleaning = FALLBACK_ROOMS.filter(r => r.status === 'CLEANING').length;
  const maintenance = FALLBACK_ROOMS.filter(r => r.status === 'MAINTENANCE').length;
  const occupancy_rate = Math.round((occupied / total) * 1000) / 10;

  const total_revenue = FALLBACK_BOOKINGS.reduce((sum, b) => sum + (b.total_charges || 0), 0);
  const total_collected = FALLBACK_BOOKINGS.reduce((sum, b) => sum + (b.total_paid || 0), 0);
  const outstanding_balance = total_revenue - total_collected;

  const adr = occupied > 0 ? Math.round(total_revenue / occupied) : 17250;
  const revpar = Math.round((adr * occupancy_rate) / 100);

  return {
    total_rooms: total,
    occupied_rooms: occupied,
    available_rooms: available,
    cleaning_rooms: cleaning,
    maintenance_rooms: maintenance,
    occupancy_rate,
    adr,
    revpar,
    today_arrivals: 1,
    today_departures: 0,
    total_revenue,
    total_collected,
    outstanding_balance
  };
}

export function getFallbackFolio(bookingId: string): FolioData {
  const booking = FALLBACK_BOOKINGS.find(b => b.id === bookingId) || FALLBACK_BOOKINGS[0];
  const total_charges = booking.total_charges || 30680;
  const total_paid = booking.total_paid || 26000;
  const subtotal = Math.round(total_charges / 1.18);
  const tax_total = total_charges - subtotal;
  const balance_due = total_charges - total_paid;

  return {
    booking,
    charges: [
      {
        id: 'CHG-ROOM-1',
        booking_id: booking.id,
        category: 'ROOM',
        description: `${booking.room_type_name} Room Rate (${booking.total_nights} Nights @ ₹${booking.nightly_rate.toLocaleString('en-IN')})`,
        amount: subtotal,
        tax_rate: 0.18,
        total_amount: total_charges,
        created_at: booking.check_in_date + ' 14:00'
      }
    ],
    payments: [
      {
        id: 'PAY-01',
        booking_id: booking.id,
        amount: total_paid,
        payment_method: 'HDFC Luxury Credit Card (*9821)',
        transaction_ref: 'TXN-HDFC-99120',
        status: 'SUCCESS',
        created_at: booking.check_in_date + ' 14:10'
      }
    ],
    subtotal,
    tax_total,
    total_charges,
    total_paid,
    balance_due
  };
}
