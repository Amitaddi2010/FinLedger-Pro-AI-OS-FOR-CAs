import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon, CheckCircleIcon, ClockIcon, 
  ExclamationCircleIcon, ChevronLeftIcon, ChevronRightIcon,
  XMarkIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ToastProvider';

const TypeConfig = {
  GST: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  TDS: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  IT: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  LABOUR: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  OTHER: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
};

const ComplianceCalendar = () => {
  const { activeCompanyId } = useAuthStore();
  const toast = useToast();
  const [deadlines, setDeadlines] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'GST' });

  const fetchDeadlines = async () => {
    try {
      const { data } = await api.get('/deadlines');
      const normalized = data.map(d => ({ ...d, date: new Date(d.date) }));
      setDeadlines(normalized);
    } catch (err) {
      console.error("Fetch Deadlines Failed:", err);
      toast.error('Failed to sync compliance calendar');
    }
  };

  useEffect(() => {
    if (activeCompanyId) fetchDeadlines();
  }, [activeCompanyId]);

  const handleAddDeadline = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deadlines', newDeadline);
      setShowModal(false);
      setNewDeadline({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'GST' });
      fetchDeadlines();
      toast.success('Deadline added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to add deadline");
    }
  };

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const startDay = startOfMonth(currentDate).getDay();
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  const upcomingDeadlines = deadlines
    .filter(d => isSameMonth(d.date, currentDate) || d.date > currentDate)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-8 shadow-2xl">
          <CalendarDaysIcon className="w-10 h-10 text-finledger-indigo opacity-50" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Calendar Offline</h2>
        <p className="text-gray-500 max-w-md text-lg">Select a client workspace to view their compliance schedule.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
               Regulatory Engine
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Compliance Tracker
          </motion.h1>
        </div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5 group"
          >
            <span className="text-lg font-medium leading-none mb-0.5 group-hover:rotate-90 transition-transform">+</span> Custom Deadline
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Calendar View */}
        <div className="xl:col-span-3 bg-[#0D0B14] border border-white/[0.06] rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-finledger-indigo/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 text-white transition"><ChevronLeftIcon className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 text-white transition"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 relative z-10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={day} className={`text-center text-[10px] font-bold uppercase tracking-widest py-3 rounded-lg ${i === 0 || i === 6 ? 'text-gray-600 bg-white/[0.01]' : 'text-gray-400 bg-white/[0.03]'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 xl:gap-4 relative z-10">
            {paddingDays.map(pd => (
              <div key={`pad-${pd}`} className="h-28 md:h-36 rounded-2xl bg-white/[0.01] border border-transparent"></div>
            ))}
            
            {daysInMonth.map(day => {
              const dayDeadlines = (Array.isArray(deadlines) ? deadlines : []).filter(d => isSameDay(d.date, day));
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(day)}
                  key={day.toString()} 
                  className={`
                    h-28 md:h-36 rounded-2xl border p-2.5 relative cursor-pointer transition-all duration-300 overflow-hidden flex flex-col group
                    ${isToday ? 'bg-finledger-indigo/10 border-finledger-indigo/50' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'}
                    ${isSelected ? 'ring-2 ring-finledger-indigo border-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}
                  `}
                >
                  <span className={`text-sm font-black mb-2 inline-block ${isToday ? 'text-finledger-indigo bg-finledger-indigo/10 px-2 py-0.5 rounded-md' : 'text-gray-400 group-hover:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pb-1">
                    {dayDeadlines.map(dl => (
                      <div key={dl._id} className={`text-[9px] font-bold px-1.5 py-1 rounded truncate border ${TypeConfig[dl.type].bg} ${TypeConfig[dl.type].color} ${TypeConfig[dl.type].border}`}>
                        {dl.title}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 h-[400px] flex flex-col">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 py-2 px-3 bg-white/[0.03] rounded-lg inline-block text-center border border-white/[0.04]">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {(Array.isArray(deadlines) ? deadlines : []).filter(d => isSameDay(d.date, selectedDate)).length > 0 ? (
                (Array.isArray(deadlines) ? deadlines : []).filter(d => isSameDay(d.date, selectedDate)).map((dl, i) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={dl._id} className="p-4 rounded-xl bg-[#0D0B14] border border-white/[0.06] hover:border-white/20 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-center uppercase tracking-wider ${TypeConfig[dl.type].bg} ${TypeConfig[dl.type].color} border ${TypeConfig[dl.type].border}`}>
                        {dl.type}
                      </span>
                      {dl.status === 'COMPLETED' && <CheckCircleIcon className="w-5 h-5 text-emerald-400" />}
                      {dl.status === 'OVERDUE' && <ExclamationCircleIcon className="w-5 h-5 text-rose-400" />}
                      {dl.status === 'PENDING' && <ClockIcon className="w-5 h-5 text-finledger-indigo" />}
                    </div>
                    <h4 className="font-bold text-gray-200 text-sm mb-1 leading-snug group-hover:text-white transition-colors">{dl.title}</h4>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mb-4 border border-white/[0.05]">
                     <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-white font-bold text-sm mb-1">Clear Schedule</p>
                  <p className="text-xs text-gray-500 font-medium">No deadlines recorded for this date.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0D0B14] border border-rose-500/20 shadow-lg shadow-rose-500/5 rounded-3xl p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px]" />
            <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Upcoming Action Items
            </h3>
            <div className="space-y-4 relative z-10">
              {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(dl => (
                <div key={dl._id} className="flex gap-4 items-center">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs border bg-white/[0.02] border-white/[0.06] text-gray-300`}>
                    {format(dl.date, 'MMM d')}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-200 text-sm truncate">{dl.title}</h4>
                    <span className={`text-[9px] font-bold tracking-widest uppercase ${dl.status === 'OVERDUE' ? 'text-rose-400' : 'text-amber-400'}`}>{dl.status}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm font-medium text-gray-500">No imminent deadlines.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Setup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#0D0B14] border border-white/[0.06] p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"><XMarkIcon className="w-5 h-5"/></button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center shadow-lg shadow-finledger-indigo/20">
                  <CalendarDaysIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">New Milestone</h2>
                  <p className="text-xs text-gray-500">Track statutory filing dates.</p>
                </div>
              </div>

              <form onSubmit={handleAddDeadline} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Identifier Title</label>
                  <input required className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-finledger-indigo/40 focus:border-finledger-indigo/50 transition-all placeholder-gray-600 hover:border-white/10" placeholder="e.g. GSTR-9 Annual Filing" value={newDeadline.title} onChange={e => setNewDeadline({...newDeadline, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Due Date</label>
                    <input type="date" required className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-finledger-indigo/40 focus:border-finledger-indigo/50 transition-all hover:border-white/10" value={newDeadline.date} onChange={e => setNewDeadline({...newDeadline, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                    <select className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-finledger-indigo/40 focus:border-finledger-indigo/50 transition-all hover:border-white/10" value={newDeadline.type} onChange={e => setNewDeadline({...newDeadline, type: e.target.value})}>
                      <option value="GST">GST Compliance</option>
                      <option value="TDS">TDS Returns</option>
                      <option value="IT">Income Tax</option>
                      <option value="LABOUR">Labour Register</option>
                      <option value="OTHER">Other Custom</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-3.5 mt-2 rounded-xl flex items-center justify-center gap-2">Verify & Add Milestone</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplianceCalendar;
