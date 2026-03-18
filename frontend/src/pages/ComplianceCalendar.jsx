import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const TypeConfig = {
  GST: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800' },
  TDS: { color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-800' },
  IT: { color: 'text-finledger-emerald', bg: 'bg-emerald-900/20', border: 'border-emerald-800' },
  LABOUR: { color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-800' },
  OTHER: { color: 'text-gray-400', bg: 'bg-gray-800/40', border: 'border-gray-700' }
};

const ComplianceCalendar = () => {
  const { activeCompanyId } = useAuthStore();
  const [deadlines, setDeadlines] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'GST' });

  const fetchDeadlines = async () => {
    try {
      const { data } = await api.get('/deadlines');
      // Normalize dates from API
      const normalized = data.map(d => ({ ...d, date: new Date(d.date) }));
      setDeadlines(normalized);
    } catch (err) {
      console.error("Fetch Deadlines Failed:", err);
    }
  };

  React.useEffect(() => {
    if (activeCompanyId) fetchDeadlines();
  }, [activeCompanyId]);

  const handleAddDeadline = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deadlines', newDeadline);
      setShowModal(false);
      setNewDeadline({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'GST' });
      fetchDeadlines();
    } catch (err) {
      alert("Failed to add deadline: " + err.message);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const startDay = startOfMonth(currentDate).getDay();
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  const upcomingDeadlines = deadlines
    .filter(d => isSameMonth(d.date, currentDate) || d.date > currentDate)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Chartered Accountant Tool
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">Compliance Calendar</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm rounded-xl px-6"
        >
          + Add Custom Deadline
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Calendar View */}
        <div className="xl:col-span-2 glass-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition"><ChevronLeftIcon className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-finledger-silver uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {paddingDays.map(pd => (
              <div key={`pad-${pd}`} className="h-28 rounded-xl bg-slate-800/10 border border-transparent"></div>
            ))}
            
            {daysInMonth.map(day => {
              const dayDeadlines = deadlines.filter(d => isSameDay(d.date, day));
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day)}
                  key={day.toString()} 
                  className={`
                    h-28 rounded-xl border p-2 relative cursor-pointer transition-all duration-200
                    ${isToday ? 'bg-finledger-indigo/10 border-finledger-indigo/50' : 'bg-slate-800/20 border-white/5 hover:border-finledger-silver/30'}
                    ${isSelected ? 'ring-2 ring-finledger-indigo border-transparent' : ''}
                  `}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-finledger-indigo' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {dayDeadlines.map(dl => (
                      <div key={dl._id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${TypeConfig[dl.type].bg} ${TypeConfig[dl.type].color} ${TypeConfig[dl.type].border} border`}>
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
        <div className="space-y-8">
          <div className="glass-panel p-8">
            <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-4">
              {deadlines.filter(d => isSameDay(d.date, selectedDate)).length > 0 ? (
                deadlines.filter(d => isSameDay(d.date, selectedDate)).map(dl => (
                  <div key={dl._id} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${TypeConfig[dl.type].bg} ${TypeConfig[dl.type].color} border ${TypeConfig[dl.type].border}`}>
                        {dl.type}
                      </span>
                      {dl.status === 'COMPLETED' && <CheckCircleIcon className="w-5 h-5 text-finledger-emerald" />}
                      {dl.status === 'OVERDUE' && <ExclamationCircleIcon className="w-5 h-5 text-finledger-ruby" />}
                      {dl.status === 'PENDING' && <ClockIcon className="w-5 h-5 text-finledger-gold" />}
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{dl.title}</h4>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <CalendarDaysIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  No compliance deadlines.
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-8 shadow-[0_0_30px_rgba(239,68,68,0.05)] border-l-2 border-l-finledger-ruby">
            <h3 className="text-sm font-bold text-finledger-ruby uppercase tracking-widest mb-6">Upcoming Actions</h3>
            <div className="space-y-4">
              {upcomingDeadlines.map(dl => (
                <div key={dl._id} className="flex gap-4 items-center">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs border ${
                    dl.status === 'OVERDUE' ? 'bg-red-900/20 text-red-400 border-red-900/40' : 'bg-slate-800/50 border-white/5 text-gray-300'
                  }`}>
                    {format(dl.date, 'MMM d')}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{dl.title}</h4>
                    <span className={`text-[10px] font-bold ${dl.status === 'OVERDUE' ? 'text-finledger-ruby' : 'text-finledger-gold'}`}>{dl.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding Deadlines */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Add Custom Deadline</h2>
                <form onSubmit={handleAddDeadline} className="space-y-4">
                   <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Deadline Title</label>
                      <input required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-finledger-indigo" placeholder="e.g. GSTR-9 Filing" value={newDeadline.title} onChange={e => setNewDeadline({...newDeadline, title: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Due Date</label>
                        <input type="date" required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-finledger-indigo" value={newDeadline.date} onChange={e => setNewDeadline({...newDeadline, date: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Category</label>
                        <select className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-finledger-indigo" value={newDeadline.type} onChange={e => setNewDeadline({...newDeadline, type: e.target.value})}>
                           <option value="GST">GST</option>
                           <option value="TDS">TDS</option>
                           <option value="IT">Income Tax</option>
                           <option value="LABOUR">Labour Laws</option>
                           <option value="OTHER">Other</option>
                        </select>
                      </div>
                   </div>
                   <button type="submit" className="w-full btn-primary py-4 mt-4 font-black rounded-xl">Create Milestone</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplianceCalendar;
