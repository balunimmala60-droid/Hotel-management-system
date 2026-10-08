import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  Terminal,
  Database,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  HotelSummary, 
  Room, 
  Booking, 
  Guest, 
  HousekeepingTask, 
  MenuItem, 
  RoomType 
} from './types';
import { api } from './services/api';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ReservationsView } from './components/ReservationsView';
import { GuestDirectoryView } from './components/GuestDirectoryView';
import { HousekeepingView } from './components/HousekeepingView';
import { RoomServiceView } from './components/RoomServiceView';
import { SqlStudioView } from './components/SqlStudioView';
import { PythonStudioView } from './components/PythonStudioView';
import { GuestFolioModal } from './components/GuestFolioModal';
import { NewBookingModal } from './components/NewBookingModal';
import { RoomDetailModal } from './components/RoomDetailModal';
import { CheckInModal } from './components/CheckInModal';
import { CheckOutModal } from './components/CheckOutModal';
import { BasicHtmlView } from './components/BasicHtmlView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [summary, setSummary] = useState<HotelSummary | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [activeFolioBookingId, setActiveFolioBookingId] = useState<string | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [activeRoomForDetail, setActiveRoomForDetail] = useState<Room | null>(null);
  const [activeBookingForCheckIn, setActiveBookingForCheckIn] = useState<Booking | null>(null);
  const [activeBookingForCheckOut, setActiveBookingForCheckOut] = useState<Booking | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const data = await api.getAll();
      setSummary(data.summary);
      setRoomTypes(data.room_types);
      setRooms(data.rooms);
      setGuests(data.guests);
      setBookings(data.bookings);
      setTasks(data.tasks);
      setMenu(data.menu);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Python/SQL PMS backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetDb = async () => {
    if (!window.confirm('Reset database to pristine luxury hotel seed state? This restores default rooms, VIP guests, active stays, and ledger records.')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDatabase();
      await loadData();
      showToast('Database reset to fresh luxury resort seed state.');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleQuickStatusChange = async (roomNumber: string, status: string) => {
    try {
      await api.updateRoomStatus({ room_number: roomNumber, status });
      await loadData();
      showToast(`Room ${roomNumber} status set to ${status}.`);
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  // Helper for opening folio modal from any view
  const handleOpenFolio = (bookingId: string) => {
    setActiveFolioBookingId(bookingId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <span className="font-serif-luxury font-bold text-xl">GH</span>
        </div>
        <h1 className="font-serif-luxury text-lg font-bold tracking-wider text-slate-100">
          GRAND HORIZON RESORT & SUITES
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono-code">
          Starting Python 3 Controller & SQLite Persistence Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Luxury Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        summary={summary}
        onOpenNewBooking={() => setIsNewBookingOpen(true)}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      {/* Error banner if any */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-lg flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Design Mode Quick Switcher */}
        <div className="no-print mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">Interface Layout:</span>
            <span>Switch between Full Luxury PMS and Basic HTML Table & Forms view</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md self-start sm:self-auto">
            <button
              onClick={() => {
                if (currentTab === 'basic_html') setCurrentTab('overview');
              }}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                currentTab !== 'basic_html'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modern PMS Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('basic_html')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                currentTab === 'basic_html'
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Basic HTML View & Templates
            </button>
          </div>
        </div>

        {currentTab === 'overview' && (
          <DashboardOverview
            rooms={rooms}
            summary={summary}
            bookings={bookings}
            onSelectRoom={(r) => setActiveRoomForDetail(r)}
            onOpenFolio={handleOpenFolio}
            onCheckIn={(b) => setActiveBookingForCheckIn(b)}
            onCheckOut={(b) => setActiveBookingForCheckOut(b)}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {currentTab === 'reservations' && (
          <ReservationsView
            bookings={bookings}
            rooms={rooms}
            onOpenFolio={handleOpenFolio}
            onCheckIn={(b) => setActiveBookingForCheckIn(b)}
            onCheckOut={(b) => setActiveBookingForCheckOut(b)}
            onOpenNewBooking={() => setIsNewBookingOpen(true)}
          />
        )}

        {currentTab === 'guests' && (
          <GuestDirectoryView
            guests={guests}
            bookings={bookings}
            onOpenFolio={handleOpenFolio}
          />
        )}

        {currentTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100">
                  Guest Folios & Billing Cashier
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select any active reservation or resident account to inspect ledger, add room charges, or print tax invoice.
                </p>
              </div>
            </div>

            <ReservationsView
              bookings={bookings}
              rooms={rooms}
              onOpenFolio={handleOpenFolio}
              onCheckIn={(b) => setActiveBookingForCheckIn(b)}
              onCheckOut={(b) => setActiveBookingForCheckOut(b)}
              onOpenNewBooking={() => setIsNewBookingOpen(true)}
            />
          </div>
        )}

        {currentTab === 'housekeeping' && (
          <HousekeepingView
            tasks={tasks}
            rooms={rooms}
            onRefreshAll={loadData}
          />
        )}

        {currentTab === 'dining' && (
          <RoomServiceView
            menu={menu}
            rooms={rooms}
            bookings={bookings}
            onRefreshAll={loadData}
            onOpenFolio={handleOpenFolio}
          />
        )}

        {currentTab === 'sql_studio' && (
          <SqlStudioView />
        )}

        {currentTab === 'python_backend' && (
          <PythonStudioView />
        )}

        {currentTab === 'basic_html' && (
          <BasicHtmlView
            rooms={rooms}
            bookings={bookings}
            guests={guests}
            summary={summary}
            roomTypes={roomTypes}
            onRefreshAll={loadData}
            onOpenFolio={handleOpenFolio}
            onCheckIn={(b) => setActiveBookingForCheckIn(b)}
            onCheckOut={(b) => setActiveBookingForCheckOut(b)}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}
      </main>

      {/* Luxury Footer (Zero-pill text styling) */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury font-semibold text-slate-300">Grand Horizon Luxury PMS</span>
            <span aria-hidden="true">·</span>
            <span>Architecture: Python 3.10 Backend · SQLite 3 Relational DB · HTML5 & React</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SQLite 3NF Schema Active
            </span>
            <span aria-hidden="true">·</span>
            <span>Hospitality License # LUX-2026-90</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeFolioBookingId && (
        <GuestFolioModal
          bookingId={activeFolioBookingId}
          onClose={() => setActiveFolioBookingId(null)}
          onRefreshAll={loadData}
        />
      )}

      {isNewBookingOpen && (
        <NewBookingModal
          roomTypes={roomTypes}
          rooms={rooms}
          guests={guests}
          onClose={() => setIsNewBookingOpen(false)}
          onRefreshAll={loadData}
        />
      )}

      {activeRoomForDetail && (
        <RoomDetailModal
          room={activeRoomForDetail}
          onClose={() => setActiveRoomForDetail(null)}
          onRefreshAll={loadData}
          onOpenFolio={handleOpenFolio}
        />
      )}

      {activeBookingForCheckIn && (
        <CheckInModal
          booking={activeBookingForCheckIn}
          rooms={rooms}
          onClose={() => setActiveBookingForCheckIn(null)}
          onRefreshAll={loadData}
        />
      )}

      {activeBookingForCheckOut && (
        <CheckOutModal
          booking={activeBookingForCheckOut}
          onClose={() => setActiveBookingForCheckOut(null)}
          onRefreshAll={loadData}
          onOpenFolio={handleOpenFolio}
        />
      )}
    </div>
  );
}
