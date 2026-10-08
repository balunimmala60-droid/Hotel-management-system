import React, { useState } from 'react';
import { 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Check, 
  UserCheck,
  DoorClosed,
  RotateCcw
} from 'lucide-react';
import { HousekeepingTask, Room } from '../types';
import { api } from '../services/api';

interface HousekeepingViewProps {
  tasks: HousekeepingTask[];
  rooms: Room[];
  onRefreshAll: () => void;
}

export const HousekeepingView: React.FC<HousekeepingViewProps> = ({
  tasks,
  rooms,
  onRefreshAll,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Form State
  const [roomNumber, setRoomNumber] = useState(rooms[0]?.room_number || '101');
  const [taskType, setTaskType] = useState('DAILY_CLEAN');
  const [priority, setPriority] = useState('NORMAL');
  const [assignedTo, setAssignedTo] = useState('Maria Santos');
  const [reportedIssue, setReportedIssue] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      onRefreshAll();
    } catch (err: any) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedIssue.trim()) return;

    try {
      await api.createTask({
        room_number: roomNumber,
        task_type: taskType,
        priority: priority,
        assigned_to: assignedTo,
        reported_issue: reportedIssue.trim()
      });
      setIsCreatingTicket(false);
      setReportedIssue('');
      onRefreshAll();
    } catch (err: any) {
      alert(`Error creating ticket: ${err.message}`);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-rose-400 font-semibold';
      case 'HIGH':
        return 'text-amber-400 font-medium';
      case 'NORMAL':
        return 'text-slate-300';
      case 'LOW':
        return 'text-slate-500';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Housekeeping & Engineering Operations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time room turnover tracking, attendant assignments, and preventative maintenance logs.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTicket(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold rounded-md text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Cleaning / Maintenance Ticket</span>
        </button>
      </div>

      {/* Quick Room Cleanliness Summary (Zero-pill text styling) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400">Clean & Inspected</div>
          <div className="text-xl font-bold font-mono-code text-emerald-400 mt-1">
            {rooms.filter((r) => r.cleanliness === 'CLEAN' || r.cleanliness === 'INSPECTED').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ready for guest arrival</div>
        </div>

        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400">Dirty / Checkout Turnover</div>
          <div className="text-xl font-bold font-mono-code text-amber-400 mt-1">
            {rooms.filter((r) => r.cleanliness === 'DIRTY').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting attendant service</div>
        </div>

        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400">In Cleaning Progress</div>
          <div className="text-xl font-bold font-mono-code text-sky-400 mt-1">
            {rooms.filter((r) => r.cleanliness === 'IN_PROGRESS' || r.status === 'CLEANING').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active housekeeping in room</div>
        </div>

        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400">Under Maintenance</div>
          <div className="text-xl font-bold font-mono-code text-rose-400 mt-1">
            {rooms.filter((r) => r.status === 'MAINTENANCE').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Engineering work order active</div>
        </div>
      </div>

      {/* Filter Segment (Buttons allowed for interactive filters) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'ALL', label: 'All Tasks' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === s.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'ALL', label: 'All Priorities' },
            { id: 'URGENT', label: 'Urgent' },
            { id: 'HIGH', label: 'High' },
            { id: 'NORMAL', label: 'Normal' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPriority(p.id)}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterPriority === p.id
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-serif-luxury font-bold text-slate-100 text-base mb-1">
              Create Housekeeping or Maintenance Order
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Dispatches task ticket to property management database and assigns attendant.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target Room</label>
                  <select
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  >
                    {rooms.map((r) => (
                      <option key={r.room_number} value={r.room_number}>
                        Room {r.room_number} ({r.room_type_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Service Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  >
                    <option value="DAILY_CLEAN">Daily Service & Towels</option>
                    <option value="TURNDOWN">Evening Turndown</option>
                    <option value="DEEP_CLEAN">Deep Clean Turnover</option>
                    <option value="MAINTENANCE">Engineering / Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High (Arrival imminent)</option>
                    <option value="URGENT">Urgent (Immediate attention)</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Assigned Staff</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  >
                    <option value="Maria Santos">Maria Santos (Lead Floor 1-2)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (Suites Attendant)</option>
                    <option value="Carlos Mendez">Carlos Mendez (Beach Villas)</option>
                    <option value="David Kim (Engineering)">David Kim (Chief Engineer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Work Description / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Replace bath towels, restock Nespresso pods, check terrace glass door latch."
                  value={reportedIssue}
                  onChange={(e) => setReportedIssue(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded cursor-pointer"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No housekeeping or maintenance tasks matching current filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isInProgress = task.status === 'IN_PROGRESS';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border flex flex-col justify-between transition-colors ${
                  isCompleted 
                    ? 'bg-slate-900/30 border-slate-800/60 opacity-70' 
                    : isInProgress
                    ? 'bg-sky-950/20 border-sky-500/30'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-luxury font-bold text-base text-amber-400">
                          Room {task.room_number}
                        </span>
                        <span className="text-xs text-slate-400">· {task.room_type_name}</span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {task.task_type.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className={getPriorityStyle(task.priority)}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 p-2 bg-slate-950/60 border border-slate-800/80 rounded">
                    {task.reported_issue}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400/80" />
                      {task.assigned_to}
                    </span>
                    <span className="font-mono-code">{task.scheduled_date}</span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <div className="text-[11px]">
                    Status: <span className={isCompleted ? 'text-emerald-400 font-medium' : isInProgress ? 'text-sky-400 font-medium' : 'text-slate-400'}>{task.status}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isCompleted && !isInProgress && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded text-xs transition-colors cursor-pointer"
                      >
                        Start Work
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Mark Done</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'PENDING')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
