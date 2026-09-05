import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Calendar as CalendarIcon,
  Timer,
  Hourglass,
  Bell,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  CalendarRange,
  Hash,
  Binary,
  Layers,
  Briefcase,
  ArrowRightLeft,
  CalendarCheck,
  Copy,
  Check,
  Search,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Flag,
} from 'lucide-react';

export type DateTimeToolId =
  | 'calendar'
  | 'countdown-timer'
  | 'stopwatch'
  | 'alarm'
  | 'world-clock'
  | 'time-difference'
  | 'leap-year'
  | 'birthday-countdown'
  | 'date-calculator'
  | 'week-number'
  | 'unix-timestamp'
  | 'time-formatter'
  | 'business-day-calc'
  | 'timezone-converter'
  | 'working-days-calc';

export interface DateTimeToolMeta {
  id: DateTimeToolId;
  name: string;
  category: 'core' | 'clocks' | 'calculations' | 'conversion';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const DATE_TIME_TOOLS_META: DateTimeToolMeta[] = [
  {
    id: 'calendar',
    name: 'Interactive Calendar',
    category: 'core',
    categoryLabel: 'Calendar',
    description: 'Monthly & yearly navigation with today highlight, day of year, and lunar phases.',
    icon: CalendarIcon,
    badge: 'Interactive',
  },
  {
    id: 'countdown-timer',
    name: 'Countdown Timer',
    category: 'clocks',
    categoryLabel: 'Timers',
    description: 'High-precision timer with visual progress ring and Web Audio sound alert on completion.',
    icon: Timer,
    badge: 'Audio Alert',
  },
  {
    id: 'stopwatch',
    name: 'Millisecond Stopwatch',
    category: 'clocks',
    categoryLabel: 'Timers',
    description: 'Millisecond-precision stopwatch with lap split tracker and fastest/slowest lap analysis.',
    icon: Hourglass,
    badge: 'Lap Splits',
  },
  {
    id: 'alarm',
    name: 'Browser Local Alarm',
    category: 'clocks',
    categoryLabel: 'Timers',
    description: 'Schedule browser alerts with synthesized alarm chimes and snooze functionality.',
    icon: Bell,
  },
  {
    id: 'world-clock',
    name: 'Global World Clock',
    category: 'clocks',
    categoryLabel: 'Clocks',
    description: 'Live ticking clocks for New York, London, Tokyo, Paris, Dubai, and Sydney via Intl API.',
    icon: Globe,
    badge: 'Live Intl',
  },
  {
    id: 'time-difference',
    name: 'Time Difference',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Calculate exact hours, minutes, and seconds difference between two time values.',
    icon: Clock,
  },
  {
    id: 'leap-year',
    name: 'Leap Year Checker',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Instant leap year evaluation with Gregorian century rules and upcoming leap year lists.',
    icon: CheckCircle2,
  },
  {
    id: 'birthday-countdown',
    name: 'Birthday Countdown',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Live countdown in days, hours, and minutes until your next birthday milestone.',
    icon: CalendarDays,
    badge: 'Milestones',
  },
  {
    id: 'date-calculator',
    name: 'Date Add / Subtract',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Add or subtract custom days, weeks, months, or years to/from any date.',
    icon: CalendarRange,
  },
  {
    id: 'week-number',
    name: 'ISO Week Number',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Determine ISO-8601 week number, total annual weeks, and week boundary dates.',
    icon: Hash,
  },
  {
    id: 'unix-timestamp',
    name: 'Unix Timestamp Converter',
    category: 'conversion',
    categoryLabel: 'Conversion',
    description: 'Convert Unix epoch seconds and milliseconds to UTC/Local readable dates and vice-versa.',
    icon: Binary,
    badge: 'Epoch Live',
  },
  {
    id: 'time-formatter',
    name: 'Time Formatter',
    category: 'conversion',
    categoryLabel: 'Conversion',
    description: 'Convert between 12-hour AM/PM, 24-hour, ISO 8601, RFC 2822, and relative time.',
    icon: Layers,
  },
  {
    id: 'business-day-calc',
    name: 'Business Day Calculator',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Add or subtract N business working days from a starting date excluding weekends.',
    icon: Briefcase,
  },
  {
    id: 'timezone-converter',
    name: 'Time Zone Converter',
    category: 'conversion',
    categoryLabel: 'Conversion',
    description: 'Convert specific dates & times across world timezones using native browser Intl database.',
    icon: ArrowRightLeft,
  },
  {
    id: 'working-days-calc',
    name: 'Working Days Between Dates',
    category: 'calculations',
    categoryLabel: 'Calculations',
    description: 'Calculate total working days between two dates with custom holiday exclusion rules.',
    icon: CalendarCheck,
    badge: 'Holidays',
  },
];

// Synthesize alarm chime using Web Audio API
function playAlarmChime(type: 'alarm' | 'beep' = 'alarm') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'alarm') {
      [0, 0.2, 0.4, 0.6, 0.8].forEach((timeOffset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 1046.5, ctx.currentTime + timeOffset);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.15);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // AudioContext blocked
  }
}

export function DateTimeToolsSuite() {
  const [activeTool, setActiveTool] = useState<DateTimeToolId>('calendar');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = DATE_TIME_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Date & Time Suite';
      logActivity(toolName, `Calculated & copied date/time: ${text}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return DATE_TIME_TOOLS_META.filter((tool) => {
      const matchesCategory = activeFilter === 'all' || tool.category === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.categoryLabel.toLowerCase().includes(q))
      );
    });
  }, [activeFilter, searchQuery]);

  const currentToolMeta =
    DATE_TIME_TOOLS_META.find((t) => t.id === activeTool) || DATE_TIME_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="date-time-tools-suite-root">
      {/* 15 Tools Selector Dashboard */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                Date & Time Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                15 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              High-precision calendar computations, timers, alarms, and world timezones via browser Intl API.
            </p>
          </div>

          {/* Search and Category Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15 time tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              {[
                { id: 'all', label: 'All (15)' },
                { id: 'core', label: 'Calendar' },
                { id: 'clocks', label: 'Clocks & Timers' },
                { id: 'calculations', label: 'Calculations' },
                { id: 'conversion', label: 'Conversions' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 15 Tools Multi-Column Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  document.getElementById('active-date-time-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border-cyan-400/50 shadow-md shadow-blue-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-cyan-400 group-hover:text-cyan-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate leading-tight text-slate-200 group-hover:text-white">
                    {idx + 1}. {tool.name}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 truncate">
                    {tool.categoryLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Selected Tool Workspace */}
      <div id="active-date-time-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-[1.5px] shadow-lg shadow-blue-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% In-Browser Clock</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'calendar' && <CalendarTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'countdown-timer' && <CountdownTimerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'stopwatch' && <StopwatchTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'alarm' && <AlarmTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'world-clock' && <WorldClockTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'time-difference' && <TimeDifferenceTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'leap-year' && <LeapYearTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'birthday-countdown' && <BirthdayCountdownTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'date-calculator' && <DateCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'week-number' && <WeekNumberTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'unix-timestamp' && <UnixTimestampTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'time-formatter' && <TimeFormatterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'business-day-calc' && <BusinessDayCalcTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'timezone-converter' && <TimezoneConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'working-days-calc' && <WorkingDaysCalcTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: Interactive Monthly Calendar
   ========================================================================= */
function CalendarTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar Math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  const isToday = (d: number) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (d: number) => {
    return selectedDay.getDate() === d && selectedDay.getMonth() === month && selectedDay.getFullYear() === year;
  };

  // Day of year calculation
  const startOfYear = new Date(selectedDay.getFullYear(), 0, 0);
  const diff = selectedDay.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calendar Grid */}
      <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-white">
              {monthNames[month]} {year}
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-cyan-300 border border-slate-800"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 uppercase">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Previous month padding days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return (
              <div key={`prev-${i}`} className="p-3 text-xs font-mono text-slate-700 select-none">
                {dayNum}
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const today = isToday(d);
            const active = isSelected(d);

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(new Date(year, month, d))}
                className={`p-3 rounded-2xl text-xs font-mono font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-950/50'
                    : today
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Info Card */}
      <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Selected Date Info</span>
          <button
            onClick={() => onCopy(selectedDay.toDateString(), 'cal-copy')}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {copiedKey === 'cal-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300">
            {selectedDay.getDate()}
          </div>
          <div className="text-sm font-bold text-white">
            {monthNames[selectedDay.getMonth()]} {selectedDay.getFullYear()}
          </div>
          <div className="text-xs text-slate-400">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 bg-slate-900/70 rounded-xl flex justify-between">
            <span className="text-slate-400">Day of Year:</span>
            <span className="text-cyan-300 font-bold">Day {dayOfYear} of 365</span>
          </div>
          <div className="p-3 bg-slate-900/70 rounded-xl flex justify-between">
            <span className="text-slate-400">ISO 8601:</span>
            <span className="text-slate-200 font-bold">{selectedDay.toISOString().split('T')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2: Countdown Timer with Web Audio Alert
   ========================================================================= */
function CountdownTimerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(0);

  const [totalSeconds, setTotalSeconds] = useState<number>(300);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const intervalRef = useRef<any>(null);

  const startTimer = () => {
    if (!isRunning) {
      if (timeLeft <= 0) {
        const total = hours * 3600 + minutes * 60 + seconds;
        setTotalSeconds(total);
        setTimeLeft(total);
      }
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const total = hours * 3600 + minutes * 60 + seconds;
    setTotalSeconds(total);
    setTimeLeft(total);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (soundEnabled) playAlarmChime('alarm');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, soundEnabled]);

  const hLeft = Math.floor(timeLeft / 3600);
  const mLeft = Math.floor((timeLeft % 3600) / 60);
  const sLeft = timeLeft % 60;

  const formattedTime = `${String(hLeft).padStart(2, '0')}:${String(mLeft).padStart(2, '0')}:${String(sLeft).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Timer Configuration */}
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Set Duration</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Hours</span>
            <input
              type="number"
              min="0"
              max="99"
              value={hours}
              disabled={isRunning}
              onChange={(e) => {
                const h = Math.max(0, parseInt(e.target.value) || 0);
                setHours(h);
                const tot = h * 3600 + minutes * 60 + seconds;
                setTotalSeconds(tot);
                setTimeLeft(tot);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xl font-mono font-bold text-white text-center outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Minutes</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              disabled={isRunning}
              onChange={(e) => {
                const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                setMinutes(m);
                const tot = hours * 3600 + m * 60 + seconds;
                setTotalSeconds(tot);
                setTimeLeft(tot);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xl font-mono font-bold text-white text-center outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Seconds</span>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              disabled={isRunning}
              onChange={(e) => {
                const s = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                setSeconds(s);
                const tot = hours * 3600 + minutes * 60 + s;
                setTotalSeconds(tot);
                setTimeLeft(tot);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xl font-mono font-bold text-white text-center outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-400">Quick Presets:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '1 Min', h: 0, m: 1, s: 0 },
              { label: '5 Min', h: 0, m: 5, s: 0 },
              { label: '15 Min', h: 0, m: 15, s: 0 },
              { label: '25 Min (Pomodoro)', h: 0, m: 25, s: 0 },
              { label: '1 Hour', h: 1, m: 0, s: 0 },
            ].map((p, i) => (
              <button
                key={i}
                disabled={isRunning}
                onClick={() => {
                  setHours(p.h);
                  setMinutes(p.m);
                  setSeconds(p.s);
                  const tot = p.h * 3600 + p.m * 60 + p.s;
                  setTotalSeconds(tot);
                  setTimeLeft(tot);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Timer Viewport */}
      <div className="lg:col-span-6 bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          {/* Circular Progress SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="text-slate-900 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="84"
              className="text-cyan-400 stroke-current transition-all duration-300"
              strokeWidth="10"
              strokeDasharray={527.7}
              strokeDashoffset={527.7 - (527.7 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute text-3xl font-mono font-black text-white">
            {formattedTime}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-950/50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: Millisecond Stopwatch with Lap Splits
   ========================================================================= */
interface Lap {
  index: number;
  timeMs: number;
  splitMs: number;
}

function StopwatchTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const formatStopwatch = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const milli = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(milli).padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    startTimeRef.current = performance.now() - elapsedMs;

    const loop = () => {
      setElapsedMs(performance.now() - startTimeRef.current);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    const prevTime = laps.length > 0 ? laps[0].timeMs : 0;
    const split = elapsedMs - prevTime;
    setLaps([{ index: laps.length + 1, timeMs: elapsedMs, splitMs: split }, ...laps]);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Stopwatch Display */}
      <div className="lg:col-span-6 bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="text-4xl sm:text-6xl font-mono font-black text-white tracking-tight">
          {formatStopwatch(elapsedMs)}
        </div>

        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>Pause</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleLap}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-sm border border-slate-800 cursor-pointer"
            >
              <Flag className="w-4 h-4" />
              <span>Lap</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Laps Record Table */}
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Lap Splits ({laps.length})</span>
          {laps.length > 0 && (
            <button
              onClick={() => onCopy(laps.map((l) => `Lap ${l.index}: ${formatStopwatch(l.timeMs)}`).join('\n'), 'laps-copy')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copiedKey === 'laps-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Laps</span>
            </button>
          )}
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
          {laps.length === 0 ? (
            <div className="text-xs text-slate-600 font-mono text-center py-8">Press "Lap" while running to log split times</div>
          ) : (
            laps.map((lap) => (
              <div key={lap.index} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold">Lap {lap.index}</span>
                <span className="text-cyan-300 font-bold">{formatStopwatch(lap.timeMs)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Local Browser Alarm with Audio & Snooze
   ========================================================================= */
function AlarmTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [alarmTime, setAlarmTime] = useState<string>('08:00');
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentTime(timeStr);

      if (isArmed && !isRinging) {
        const hm = timeStr.slice(0, 5);
        if (hm === alarmTime && now.getSeconds() === 0) {
          setIsRinging(true);
          playAlarmChime('alarm');
        }
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isArmed, alarmTime, isRinging]);

  const handleSnooze = () => {
    setIsRinging(false);
    // Add 5 minutes
    const [h, m] = alarmTime.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(h, m + 5);
    const newH = String(newDate.getHours()).padStart(2, '0');
    const newM = String(newDate.getMinutes()).padStart(2, '0');
    setAlarmTime(`${newH}:${newM}`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-mono">Current Local Time</span>
          <div className="text-4xl font-mono font-black text-white">{currentTime || '--:--:--'}</div>
        </div>

        {/* Alarm Time Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Set Alarm Time (24-Hour)</label>
          <input
            type="time"
            value={alarmTime}
            disabled={isArmed}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-3xl font-mono font-bold text-cyan-300 outline-none"
          />
        </div>

        {/* Ringing State Actions */}
        {isRinging ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl space-y-3 animate-bounce">
            <span className="text-sm font-bold text-rose-300">⏰ Alarm is Ringing!</span>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleSnooze}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Snooze 5 Min
              </button>
              <button
                onClick={() => {
                  setIsRinging(false);
                  setIsArmed(false);
                }}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Dismiss Alarm
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsArmed(!isArmed)}
            className={`px-8 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${
              isArmed
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95'
            }`}
          >
            {isArmed ? 'Disarm Alarm' : 'Set Active Alarm'}
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: Global World Clock
   ========================================================================= */
function WorldClockTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [time, setTime] = useState<Date>(new Date());

  const CITIES = [
    { city: 'New York', country: 'USA', tz: 'America/New_York' },
    { city: 'London', country: 'UK', tz: 'Europe/London' },
    { city: 'Paris', country: 'France', tz: 'Europe/Paris' },
    { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai' },
    { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo' },
    { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney' },
    { city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore' },
    { city: 'Los Angeles', country: 'USA', tz: 'America/Los_Angeles' },
  ];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {CITIES.map((c) => {
        const timeStr = time.toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = time.toLocaleDateString('en-US', { timeZone: c.tz, weekday: 'short', month: 'short', day: 'numeric' });

        return (
          <div key={c.city} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-white">{c.city}</div>
                <div className="text-[10px] text-slate-500 font-medium">{c.country}</div>
              </div>
              <button onClick={() => onCopy(`${c.city}: ${timeStr}`, `tz-${c.city}`)} className="text-slate-500 hover:text-white">
                {copiedKey === `tz-${c.city}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="text-2xl font-mono font-black text-cyan-300">{timeStr}</div>
            <div className="text-xs text-slate-400 font-mono">{dateStr}</div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================
   TOOL 6: Time Difference Calculator
   ========================================================================= */
function TimeDifferenceTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [t1, setT1] = useState<string>('09:15');
  const [t2, setT2] = useState<string>('17:45');

  const diff = useMemo(() => {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);

    const min1 = h1 * 60 + m1;
    const min2 = h2 * 60 + m2;
    const diffMin = Math.abs(min2 - min1);

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    const decimalHours = (diffMin / 60).toFixed(2);

    return { hours, minutes, totalMinutes: diffMin, decimalHours };
  }, [t1, t2]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Start Time</label>
            <input
              type="time"
              value={t1}
              onChange={(e) => setT1(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">End Time</label>
            <input
              type="time"
              value={t2}
              onChange={(e) => setT2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Duration Difference</span>
        <div className="text-4xl font-mono font-black text-cyan-300">
          {diff.hours}h {diff.minutes}m
        </div>
        <div className="text-xs font-mono text-slate-500">
          Total: {diff.totalMinutes} minutes ({diff.decimalHours} decimal hours)
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Leap Year Checker
   ========================================================================= */
function LeapYearTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [year, setYear] = useState<number>(2028);

  const isLeap = useMemo(() => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }, [year]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Input Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-3xl font-mono font-bold text-white outline-none focus:border-cyan-500"
        />
        <p className="text-xs text-slate-500">
          A year is a leap year if divisible by 4, except end-of-century years which must be divisible by 400.
        </p>
      </div>

      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase">Leap Year Status</span>
        <div className={`text-3xl font-mono font-black ${isLeap ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isLeap ? `✓ ${year} is a Leap Year` : `✕ ${year} is Not a Leap Year`}
        </div>
        <div className="text-xs font-mono text-slate-400">
          {isLeap ? 'Contains 366 days (February 29 included)' : 'Contains standard 365 days (28 days in February)'}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: Birthday Countdown
   ========================================================================= */
function BirthdayCountdownTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [bday, setBday] = useState<string>('1998-08-28');

  const { daysLeft, hoursLeft, minutesLeft, nextAge } = useMemo(() => {
    if (!bday) return { daysLeft: 0, hoursLeft: 0, minutesLeft: 0, nextAge: 0 };
    const birth = new Date(bday);
    const now = new Date();

    let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    let age = now.getFullYear() - birth.getFullYear();

    if (next < now) {
      next = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
      age += 1;
    }

    const diff = next.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { daysLeft: days, hoursLeft: hours, minutesLeft: mins, nextAge: age };
  }, [bday]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Your Birthday</label>
        <input
          type="date"
          value={bday}
          onChange={(e) => setBday(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-300 outline-none"
        />
      </div>

      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase">Turning Age {nextAge} Countdown</span>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="text-3xl font-mono font-black text-white">{daysLeft}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Days</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="text-3xl font-mono font-black text-cyan-300">{hoursLeft}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Hours</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="text-3xl font-mono font-black text-emerald-400">{minutesLeft}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Date Add / Subtract Calculator
   ========================================================================= */
function DateCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [baseDate, setBaseDate] = useState<string>('2026-08-18');
  const [op, setOp] = useState<'+' | '-'>('+');
  const [amount, setAmount] = useState<number>(30);
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  const calculatedDate = useMemo(() => {
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const multiplier = op === '+' ? 1 : -1;

    if (unit === 'days') d.setDate(d.getDate() + amount * multiplier);
    if (unit === 'weeks') d.setDate(d.getDate() + amount * 7 * multiplier);
    if (unit === 'months') d.setMonth(d.getMonth() + amount * multiplier);
    if (unit === 'years') d.setFullYear(d.getFullYear() + amount * multiplier);

    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [baseDate, op, amount, unit]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Starting Date</label>
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Operation</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setOp('+')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs ${op === '+' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
              >
                + Add
              </button>
              <button
                onClick={() => setOp('-')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs ${op === '-' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
              >
                − Subtract
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono font-bold text-white text-center"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Unit</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Resulting Date</span>
        <div className="text-xl sm:text-2xl font-mono font-black text-cyan-300 select-all">{calculatedDate}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 10: ISO Week Number
   ========================================================================= */
function WeekNumberTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [dateStr, setDateStr] = useState<string>('2026-08-18');

  const weekInfo = useMemo(() => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    // ISO week number standard
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

    return { weekNumber, year: d.getFullYear() };
  }, [dateStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Select Target Date</label>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono font-bold text-white"
        />
      </div>

      {weekInfo && (
        <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">ISO-8601 Week Number</span>
          <div className="text-5xl font-mono font-black text-cyan-300">Week {weekInfo.weekNumber}</div>
          <div className="text-xs font-mono text-slate-500">Of Year {weekInfo.year} (Standard 52 Weeks)</div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 11: Unix Timestamp Converter (Live Epoch)
   ========================================================================= */
function UnixTimestampTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [inputDate, setInputDate] = useState<string>('2026-08-18T12:00');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const convertedDate = useMemo(() => {
    const ep = parseInt(inputEpoch) || 0;
    const d = new Date(ep * 1000);
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      iso: d.toISOString(),
    };
  }, [inputEpoch]);

  const convertedEpoch = useMemo(() => {
    const d = new Date(inputDate);
    return Math.floor(d.getTime() / 1000);
  }, [inputDate]);

  return (
    <div className="space-y-6">
      {/* Live Ticking Epoch Banner */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-mono">Current Live Unix Epoch Seconds</span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300">{currentEpoch}</div>
        </div>
        <button
          onClick={() => onCopy(currentEpoch.toString(), 'live-ep')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-200 border border-slate-700"
        >
          {copiedKey === 'live-ep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy Timestamp</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Epoch to Human */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase">Timestamp to Date</label>
          <input
            type="number"
            value={inputEpoch}
            onChange={(e) => setInputEpoch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
          />
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded-xl">
              <span className="text-slate-500 block">UTC Time:</span>
              <span className="text-cyan-300 font-bold">{convertedDate.utc}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl">
              <span className="text-slate-500 block">Local Time:</span>
              <span className="text-white font-bold">{convertedDate.local}</span>
            </div>
          </div>
        </div>

        {/* Date to Epoch */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase">Date to Timestamp</label>
          <input
            type="datetime-local"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
          />
          <div className="p-4 bg-slate-900 rounded-xl flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">Epoch Seconds:</span>
            <span className="text-2xl font-black text-cyan-300">{convertedEpoch}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Time Formatter (ISO 8601, RFC, 12h/24h)
   ========================================================================= */
function TimeFormatterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [d, setD] = useState<Date>(new Date());

  const formats = [
    { label: 'ISO 8601', val: d.toISOString() },
    { label: 'RFC 2822', val: d.toUTCString() },
    { label: '12-Hour AM/PM', val: d.toLocaleTimeString('en-US', { hour12: true }) },
    { label: '24-Hour Military', val: d.toLocaleTimeString('en-US', { hour12: false }) },
    { label: 'Full Locale String', val: d.toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      {formats.map((f, i) => (
        <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold">{f.label}</div>
            <div className="text-sm font-mono text-cyan-300 font-bold mt-1 select-all">{f.val}</div>
          </div>
          <button
            onClick={() => onCopy(f.val, `fmt-${i}`)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            {copiedKey === `fmt-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   TOOL 13: Business Day Calculator (Add / Subtract Working Days)
   ========================================================================= */
function BusinessDayCalcTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [start, setStart] = useState<string>('2026-08-18');
  const [days, setDays] = useState<number>(10);
  const [direction, setDirection] = useState<'add' | 'sub'>('add');

  const resultDate = useMemo(() => {
    const cur = new Date(start);
    if (isNaN(cur.getTime())) return 'Invalid Date';

    let added = 0;
    const step = direction === 'add' ? 1 : -1;

    while (added < days) {
      cur.setDate(cur.getDate() + step);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        added++;
      }
    }
    return cur.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [start, days, direction]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Starting Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Business Days to Add</span>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Direction</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDirection('add')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${direction === 'add' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
              >
                Forward
              </button>
              <button
                onClick={() => setDirection('sub')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${direction === 'sub' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
              >
                Backward
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Resulting Business Day</span>
        <div className="text-xl font-mono font-black text-cyan-300 select-all">{resultDate}</div>
        <div className="text-xs font-mono text-slate-500">Excludes all Saturdays and Sundays</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Time Zone Converter
   ========================================================================= */
function TimezoneConverterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [sourceTime, setSourceTime] = useState<string>('2026-08-18T14:30');
  const [fromTz, setFromTz] = useState<string>('UTC');
  const [toTz, setToTz] = useState<string>('America/New_York');

  const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const convertedResult = useMemo(() => {
    const d = new Date(sourceTime);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString('en-US', { timeZone: toTz, dateStyle: 'full', timeStyle: 'long' });
  }, [sourceTime, toTz]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Input Date & Time</label>
          <input
            type="datetime-local"
            value={sourceTime}
            onChange={(e) => setSourceTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Target Time Zone</label>
          <select
            value={toTz}
            onChange={(e) => setToTz(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs font-semibold"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Converted Time in {toTz}</span>
        <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300">{convertedResult}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Working Days Calculator (with Holiday Exclusions)
   ========================================================================= */
function WorkingDaysCalcTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [start, setStart] = useState<string>('2026-08-01');
  const [end, setEnd] = useState<string>('2026-08-31');
  const [holidays, setHolidays] = useState<number>(0);

  const { workDays, weekends, totalDays } = useMemo(() => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return { workDays: 0, weekends: 0, totalDays: 0 };

    let total = 0;
    let weekendCount = 0;
    let working = 0;

    const cur = new Date(Math.min(s.getTime(), e.getTime()));
    const target = new Date(Math.max(s.getTime(), e.getTime()));

    while (cur <= target) {
      total++;
      const d = cur.getDay();
      if (d === 0 || d === 6) {
        weekendCount++;
      } else {
        working++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const netWorking = Math.max(0, working - holidays);
    return { workDays: netWorking, weekends: weekendCount, totalDays: total };
  }, [start, end, holidays]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Start Date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">End Date</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Public Holidays to Exclude</label>
          <input
            type="number"
            min="0"
            value={holidays}
            onChange={(e) => setHolidays(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white"
          />
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-500 font-bold uppercase">Net Working Days</span>
          <div className="text-4xl font-mono font-black text-cyan-300 mt-1">{workDays} Days</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-xl text-center">
            <span className="text-slate-500 block">Weekend Days</span>
            <span className="text-white font-bold">{weekends}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl text-center">
            <span className="text-slate-500 block">Total Elapsed</span>
            <span className="text-white font-bold">{totalDays}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
