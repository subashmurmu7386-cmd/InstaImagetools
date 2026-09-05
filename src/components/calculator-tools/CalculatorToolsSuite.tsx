import React, { useState, useMemo, useCallback } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Calculator,
  Binary,
  Activity,
  Percent,
  Calendar,
  CalendarDays,
  Receipt,
  Tag,
  DollarSign,
  CreditCard,
  TrendingUp,
  PieChart,
  Users,
  Coins,
  Scale,
  Clock,
  Fuel,
  BarChart3,
  GraduationCap,
  FunctionSquare,
  Copy,
  Check,
  Search,
  RefreshCw,
  Info,
  ShieldCheck,
  ArrowRightLeft,
  ChevronRight,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export type CalculatorToolId =
  | 'standard'
  | 'scientific'
  | 'bmi'
  | 'percentage'
  | 'age'
  | 'date-diff'
  | 'gst-vat'
  | 'discount'
  | 'loan'
  | 'emi'
  | 'interest'
  | 'tip'
  | 'profit'
  | 'margin'
  | 'break-even'
  | 'time-calc'
  | 'fuel-cost'
  | 'average'
  | 'gpa'
  | 'equation-solver';

export interface CalculatorToolMeta {
  id: CalculatorToolId;
  name: string;
  category: 'general' | 'finance' | 'health-time' | 'math-stats';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const CALCULATOR_TOOLS_META: CalculatorToolMeta[] = [
  {
    id: 'standard',
    name: 'Standard Calculator',
    category: 'general',
    categoryLabel: 'General',
    description: 'Basic arithmetic operations with memory functions (M+, M-, MR, MC) and history.',
    icon: Calculator,
    badge: 'Memory M+',
  },
  {
    id: 'scientific',
    name: 'Scientific Calculator',
    category: 'general',
    categoryLabel: 'General',
    description: 'Trigonometry (sin, cos, tan), log, ln, powers, factorials, brackets, π, and e.',
    icon: Binary,
    badge: 'Advanced',
  },
  {
    id: 'percentage',
    name: 'Percentage Calculator',
    category: 'general',
    categoryLabel: 'General',
    description: 'Calculate % of value, percentage increase/decrease, and X is what % of Y.',
    icon: Percent,
    badge: 'Popular',
  },
  {
    id: 'gst-vat',
    name: 'GST / VAT Tax Calculator',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Add or subtract GST/VAT percentages from net or gross amounts with tax breakdowns.',
    icon: Receipt,
  },
  {
    id: 'discount',
    name: 'Discount & Savings',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Original price minus discount % or fixed amount to calculate final savings.',
    icon: Tag,
  },
  {
    id: 'loan',
    name: 'Loan Calculator',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Principal, interest rate, and tenure calculation for total payable amount.',
    icon: DollarSign,
  },
  {
    id: 'emi',
    name: 'EMI Calculator',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Equated Monthly Installment calculation with interest vs principal monthly breakdown.',
    icon: CreditCard,
    badge: 'EMI Amort',
  },
  {
    id: 'interest',
    name: 'Interest (Simple & Compound)',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Simple Interest vs Compound Interest with monthly, quarterly, and annual compounding.',
    icon: TrendingUp,
  },
  {
    id: 'tip',
    name: 'Tip & Bill Splitter',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Split dining or service bills among multiple people with custom tip percentages.',
    icon: Users,
  },
  {
    id: 'profit',
    name: 'Profit & Loss Calculator',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Cost price vs selling price to find net profit/loss amount and return on investment (ROI).',
    icon: Coins,
  },
  {
    id: 'margin',
    name: 'Margin & Markup Calculator',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Calculate Gross Profit Margin percentage and Markup percentage from cost and revenue.',
    icon: PieChart,
  },
  {
    id: 'break-even',
    name: 'Break-Even Calculator',
    category: 'finance',
    categoryLabel: 'Finance',
    description: 'Fixed costs, variable costs per unit, and unit price to find break-even sales volume.',
    icon: Scale,
  },
  {
    id: 'bmi',
    name: 'BMI Health Calculator',
    category: 'health-time',
    categoryLabel: 'Health & Time',
    description: 'Body Mass Index with Metric & Imperial units, healthy weight ranges, and visual gauge.',
    icon: Activity,
    badge: 'WHO Metric',
  },
  {
    id: 'age',
    name: 'Age Calculator',
    category: 'health-time',
    categoryLabel: 'Health & Time',
    description: 'Exact age in years, months, days, total hours, minutes, and next birthday countdown.',
    icon: Calendar,
  },
  {
    id: 'date-diff',
    name: 'Date Difference Calculator',
    category: 'health-time',
    categoryLabel: 'Health & Time',
    description: 'Calculate exact calendar days, weeks, business days, and hours between two dates.',
    icon: CalendarDays,
  },
  {
    id: 'time-calc',
    name: 'Time Duration Calculator',
    category: 'health-time',
    categoryLabel: 'Health & Time',
    description: 'Add, subtract, and convert time durations in hours, minutes, and seconds.',
    icon: Clock,
  },
  {
    id: 'fuel-cost',
    name: 'Fuel Trip Cost Calculator',
    category: 'health-time',
    categoryLabel: 'Health & Time',
    description: 'Calculate trip distance, vehicle fuel efficiency, and total fuel expense.',
    icon: Fuel,
  },
  {
    id: 'average',
    name: 'Average & Stats Calculator',
    category: 'math-stats',
    categoryLabel: 'Math & Stats',
    description: 'Mean, median, mode, min, max, sum, count, standard deviation, and range from numbers.',
    icon: BarChart3,
  },
  {
    id: 'gpa',
    name: 'GPA College Calculator',
    category: 'math-stats',
    categoryLabel: 'Math & Stats',
    description: 'Calculate Grade Point Average (GPA 4.0 scale) with custom courses and credit weights.',
    icon: GraduationCap,
  },
  {
    id: 'equation-solver',
    name: 'Equation Solver (Linear & Quad)',
    category: 'math-stats',
    categoryLabel: 'Math & Stats',
    description: 'Solve Linear (1 & 2 variables) and Quadratic equations (ax² + bx + c = 0) with discriminant.',
    icon: FunctionSquare,
    badge: 'Quadratic',
  },
];

// Helper to format floats cleanly
function fmtNum(n: number, maxDecimals: number = 4): string {
  if (isNaN(n) || !isFinite(n)) return '0';
  if (Math.abs(n) < 1e-5 && n !== 0) return n.toExponential(3);
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(n * factor) / factor;
  return rounded.toLocaleString('en-US', { maximumFractionDigits: maxDecimals });
}

export function CalculatorToolsSuite() {
  const [activeTool, setActiveTool] = useState<CalculatorToolId>('standard');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = CALCULATOR_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Calculator Suite';
      logActivity(toolName, `Calculated & copied result: ${text}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return CALCULATOR_TOOLS_META.filter((tool) => {
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
    CALCULATOR_TOOLS_META.find((t) => t.id === activeTool) || CALCULATOR_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="calculator-tools-suite-root">
      {/* 20 Calculators Selector Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                Calculator Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                20 OFFLINE CALCULATORS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pure client-side IEEE-754 precision math. 0 server calls, instant offline computation.
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
                placeholder="Search 20 calculators..."
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
                { id: 'all', label: 'All (20)' },
                { id: 'general', label: 'General' },
                { id: 'finance', label: 'Finance (9)' },
                { id: 'health-time', label: 'Health & Time' },
                { id: 'math-stats', label: 'Math & Stats' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 20 Calculators Multi-Column Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  document.getElementById('active-calculator-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-500/20 border-cyan-400/50 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm'
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

      {/* Active Calculator Workspace */}
      <div id="active-calculator-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client Math Engine</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'standard' && <StandardCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'scientific' && <ScientificCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'bmi' && <BmiCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'percentage' && <PercentageCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'age' && <AgeCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'date-diff' && <DateDiffCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'gst-vat' && <GstVatCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'discount' && <DiscountCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'loan' && <LoanCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'emi' && <EmiCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'interest' && <InterestCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'tip' && <TipCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'profit' && <ProfitCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'margin' && <MarginCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'break-even' && <BreakEvenCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'time-calc' && <TimeDurationCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'fuel-cost' && <FuelCostCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'average' && <AverageCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'gpa' && <GpaCalculatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'equation-solver' && <EquationSolverTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: Standard Calculator with Memory (M+, M-, MR, MC)
   ========================================================================= */
function StandardCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);

  const handleDigit = (d: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(d);
    } else {
      setDisplay(display + d);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const fullExp = equation + display;
      // Sanitize and evaluate simple math safely
      const sanitized = fullExp.replace(/×/g, '*').replace(/÷/g, '/');
      if (!/^[\d\.\+\-\*\/\s\(\)]+$/.test(sanitized)) throw new Error('Invalid');
      const res = Function(`'use strict'; return (${sanitized})`)();
      const resStr = fmtNum(Number(res), 8);
      setHistory((prev) => [`${fullExp} = ${resStr}`, ...prev.slice(0, 7)]);
      setDisplay(resStr);
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-') => {
    const curVal = parseFloat(display) || 0;
    if (action === 'MC') setMemory(0);
    if (action === 'MR') setDisplay(memory.toString());
    if (action === 'M+') setMemory(memory + curVal);
    if (action === 'M-') setMemory(memory - curVal);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calculator Body */}
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto w-full">
        {/* Display Screen */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-right space-y-1">
          <div className="h-5 text-xs font-mono text-slate-500 truncate">{equation || (memory !== 0 ? `[M = ${memory}]` : '')}</div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight break-all">
            {display}
          </div>
        </div>

        {/* Memory Bar */}
        <div className="grid grid-cols-4 gap-2">
          {['MC', 'MR', 'M+', 'M-'].map((m) => (
            <button
              key={m}
              onClick={() => handleMemory(m as any)}
              className="py-1.5 rounded-xl bg-slate-900 text-xs font-mono font-bold text-cyan-400 hover:bg-slate-800 border border-slate-800"
            >
              {m}
            </button>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2.5">
          <button onClick={handleClear} className="p-3.5 rounded-2xl bg-rose-950/40 text-rose-300 font-bold border border-rose-800/50 hover:bg-rose-900/60">
            C
          </button>
          <button onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')} className="p-3.5 rounded-2xl bg-slate-900 text-slate-300 font-bold border border-slate-800 hover:bg-slate-800">
            ⌫
          </button>
          <button onClick={() => setDisplay((parseFloat(display) * -1).toString())} className="p-3.5 rounded-2xl bg-slate-900 text-slate-300 font-bold border border-slate-800 hover:bg-slate-800">
            ±
          </button>
          <button onClick={() => handleOperator('÷')} className="p-3.5 rounded-2xl bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-800/50 hover:bg-cyan-900/60">
            ÷
          </button>

          {['7', '8', '9'].map((d) => (
            <button key={d} onClick={() => handleDigit(d)} className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-lg border border-slate-800 hover:bg-slate-800">
              {d}
            </button>
          ))}
          <button onClick={() => handleOperator('×')} className="p-3.5 rounded-2xl bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-800/50 hover:bg-cyan-900/60">
            ×
          </button>

          {['4', '5', '6'].map((d) => (
            <button key={d} onClick={() => handleDigit(d)} className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-lg border border-slate-800 hover:bg-slate-800">
              {d}
            </button>
          ))}
          <button onClick={() => handleOperator('-')} className="p-3.5 rounded-2xl bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-800/50 hover:bg-cyan-900/60">
            −
          </button>

          {['1', '2', '3'].map((d) => (
            <button key={d} onClick={() => handleDigit(d)} className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-lg border border-slate-800 hover:bg-slate-800">
              {d}
            </button>
          ))}
          <button onClick={() => handleOperator('+')} className="p-3.5 rounded-2xl bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-800/50 hover:bg-cyan-900/60">
            +
          </button>

          <button onClick={() => handleDigit('0')} className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-lg border border-slate-800 hover:bg-slate-800 col-span-2">
            0
          </button>
          <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-lg border border-slate-800 hover:bg-slate-800">
            .
          </button>
          <button onClick={handleEqual} className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg cursor-pointer">
            =
          </button>
        </div>
      </div>

      {/* History Log & Copy */}
      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Calculation History</span>
          <button onClick={() => setHistory([])} className="text-slate-500 hover:text-slate-300">
            Clear
          </button>
        </div>

        <div className="space-y-2 min-h-[220px]">
          {history.length === 0 ? (
            <div className="text-xs text-slate-600 font-mono text-center pt-10">No calculations recorded yet</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 flex justify-between items-center">
                <span>{h}</span>
                <button onClick={() => onCopy(h.split('=')[1]?.trim() || h, `hist-${i}`)} className="text-slate-400 hover:text-white ml-2">
                  {copiedKey === `hist-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">Current Display:</span>
          <button
            onClick={() => onCopy(display, 'std-disp')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700"
          >
            {copiedKey === 'std-disp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Display</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2: Scientific Calculator
   ========================================================================= */
function ScientificCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [expr, setExpr] = useState<string>('sin(45) * sqrt(16)');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [result, setResult] = useState<string>('2.8284');

  const evaluateScientific = useCallback((expression: string, mode: 'deg' | 'rad') => {
    try {
      if (!expression.trim()) {
        setResult('0');
        return;
      }
      let sanitized = expression
        .replace(/π/g, 'Math.PI')
        .replace(/e(?![a-zA-Z])/g, 'Math.E')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');

      if (mode === 'deg') {
        sanitized = sanitized
          .replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
          .replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
          .replace(/tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
      } else {
        sanitized = sanitized
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(');
      }

      // Safe eval
      const val = Function(`'use strict'; return (${sanitized})`)();
      setResult(fmtNum(Number(val), 8));
    } catch {
      setResult('Invalid Expression');
    }
  }, []);

  const handleAppend = (token: string) => {
    setExpr((prev) => prev + token);
    evaluateScientific(expr + token, angleMode);
  };

  return (
    <div className="space-y-6">
      {/* Expression Screen */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Expression Input</span>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setAngleMode('deg');
                evaluateScientific(expr, 'deg');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${angleMode === 'deg' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              DEG
            </button>
            <button
              onClick={() => {
                setAngleMode('rad');
                evaluateScientific(expr, 'rad');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${angleMode === 'rad' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              RAD
            </button>
          </div>
        </div>

        <input
          type="text"
          value={expr}
          onChange={(e) => {
            setExpr(e.target.value);
            evaluateScientific(e.target.value, angleMode);
          }}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl sm:text-2xl font-mono text-cyan-300 outline-none focus:border-cyan-500"
          placeholder="e.g. sin(30) + log(100)"
        />

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">Result:</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white">{result}</span>
            <button
              onClick={() => onCopy(result, 'sci-res')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
            >
              {copiedKey === 'sci-res' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Scientific Keypad */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {[
          { label: 'sin', val: 'sin(' },
          { label: 'cos', val: 'cos(' },
          { label: 'tan', val: 'tan(' },
          { label: 'log₁₀', val: 'log(' },
          { label: 'ln', val: 'ln(' },
          { label: '√ (sqrt)', val: 'sqrt(' },
          { label: 'x²', val: '^2' },
          { label: 'xʸ', val: '^' },
          { label: 'π', val: 'π' },
          { label: 'e', val: 'e' },
          { label: '(', val: '(' },
          { label: ')', val: ')' },
          { label: '+', val: ' + ' },
          { label: '−', val: ' - ' },
          { label: '×', val: ' * ' },
          { label: '÷', val: ' / ' },
          { label: '1/x', val: '1/(' },
          { label: 'Clear', val: 'CLEAR' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={() => {
              if (btn.val === 'CLEAR') {
                setExpr('');
                setResult('0');
              } else {
                handleAppend(btn.val);
              }
            }}
            className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-200 transition-colors"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: BMI Calculator (Body Mass Index)
   ========================================================================= */
function BmiCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState<string>('175');
  const [weightKg, setWeightKg] = useState<string>('68');
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('9');
  const [weightLbs, setWeightLbs] = useState<string>('150');

  const { bmi, category, color, idealWeight } = useMemo(() => {
    let hM = 0;
    let wKg = 0;

    if (unit === 'metric') {
      hM = (parseFloat(heightCm) || 170) / 100;
      wKg = parseFloat(weightKg) || 70;
    } else {
      const totalInches = (parseFloat(heightFt) || 5) * 12 + (parseFloat(heightIn) || 0);
      hM = totalInches * 0.0254;
      wKg = (parseFloat(weightLbs) || 150) * 0.453592;
    }

    if (hM <= 0 || wKg <= 0) return { bmi: 0, category: 'N/A', color: 'text-slate-400', idealWeight: 'N/A' };

    const score = wKg / (hM * hM);
    const minW = 18.5 * (hM * hM);
    const maxW = 24.9 * (hM * hM);

    let cat = 'Normal weight';
    let clr = 'text-emerald-400';
    if (score < 18.5) {
      cat = 'Underweight';
      clr = 'text-amber-400';
    } else if (score >= 25 && score < 30) {
      cat = 'Overweight';
      clr = 'text-amber-400';
    } else if (score >= 30) {
      cat = 'Obesity';
      clr = 'text-rose-400';
    }

    const idealStr =
      unit === 'metric'
        ? `${fmtNum(minW, 1)} kg – ${fmtNum(maxW, 1)} kg`
        : `${fmtNum(minW * 2.20462, 1)} lbs – ${fmtNum(maxW * 2.20462, 1)} lbs`;

    return { bmi: parseFloat(fmtNum(score, 1)), category: cat, color: clr, idealWeight: idealStr };
  }, [unit, heightCm, weightKg, heightFt, heightIn, weightLbs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Measurement System</span>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setUnit('metric')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${unit === 'metric' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              Metric (cm, kg)
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${unit === 'imperial' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              Imperial (ft, in, lbs)
            </button>
          </div>
        </div>

        {unit === 'metric' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold">Feet (ft)</label>
              <input
                type="number"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold">Inches (in)</label>
              <input
                type="number"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold">Weight (lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Result Card with Health Gauge */}
      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Body Mass Index Result</span>
          <button onClick={() => onCopy(bmi.toString(), 'bmi-res')} className="text-cyan-400 hover:text-cyan-300">
            {copiedKey === 'bmi-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-center py-4 space-y-2 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="text-4xl sm:text-5xl font-mono font-black text-white">{bmi}</div>
          <div className={`text-sm font-bold ${color}`}>{category}</div>
          <div className="text-xs text-slate-400">WHO Standard Range: 18.5 – 24.9</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Healthy Weight Range:</span>
            <span className="font-mono text-cyan-300 font-bold">{idealWeight}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div className="w-[18.5%] bg-amber-400" title="Underweight" />
            <div className="w-[25%] bg-emerald-400" title="Normal" />
            <div className="w-[20%] bg-amber-500" title="Overweight" />
            <div className="w-[36.5%] bg-rose-500" title="Obese" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Percentage Calculator
   ========================================================================= */
function PercentageCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  // Mode 1: What is X% of Y?
  const [p1, setP1] = useState<string>('15');
  const [y1, setY1] = useState<string>('250');

  // Mode 2: X is what % of Y?
  const [x2, setX2] = useState<string>('45');
  const [y2, setY2] = useState<string>('180');

  // Mode 3: Percentage increase / decrease from X to Y
  const [x3, setX3] = useState<string>('100');
  const [y3, setY3] = useState<string>('125');

  const res1 = fmtNum(((parseFloat(p1) || 0) / 100) * (parseFloat(y1) || 0), 4);
  const res2 = fmtNum(((parseFloat(x2) || 0) / (parseFloat(y2) || 1)) * 100, 2);
  const diff3 = (parseFloat(y3) || 0) - (parseFloat(x3) || 0);
  const pct3 = fmtNum((diff3 / (parseFloat(x3) || 1)) * 100, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Mode 1 */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase">What is X% of Y?</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="w-20 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-cyan-300 font-bold"
          />
          <span className="text-xs text-slate-400">% of</span>
          <input
            type="number"
            value={y1}
            onChange={(e) => setY1(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-white font-bold"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
          <span className="text-2xl font-mono font-black text-white">{res1}</span>
          <button onClick={() => onCopy(res1, 'p-1')} className="text-slate-400 hover:text-white">
            {copiedKey === 'p-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mode 2 */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase">X is what % of Y?</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={x2}
            onChange={(e) => setX2(e.target.value)}
            className="w-24 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-cyan-300 font-bold"
          />
          <span className="text-xs text-slate-400">is what % of</span>
          <input
            type="number"
            value={y2}
            onChange={(e) => setY2(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-white font-bold"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
          <span className="text-2xl font-mono font-black text-white">{res2} %</span>
          <button onClick={() => onCopy(res2 + '%', 'p-2')} className="text-slate-400 hover:text-white">
            {copiedKey === 'p-2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mode 3 */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase">% Change (From X to Y)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={x3}
            onChange={(e) => setX3(e.target.value)}
            className="w-24 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-white font-bold"
          />
          <span className="text-xs text-slate-400">→</span>
          <input
            type="number"
            value={y3}
            onChange={(e) => setY3(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-white font-bold"
          />
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
          <span className={`text-2xl font-mono font-black ${parseFloat(pct3) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {parseFloat(pct3) >= 0 ? `+${pct3}%` : `${pct3}%`}
          </span>
          <button onClick={() => onCopy(pct3 + '%', 'p-3')} className="text-slate-400 hover:text-white">
            {copiedKey === 'p-3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: Age Calculator
   ========================================================================= */
function AgeCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [dob, setDob] = useState<string>('1998-05-15');

  const ageData = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    if (isNaN(birth.getTime())) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Next birthday countdown
    let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) {
      nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysToBday = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays, totalHours, totalMinutes, daysToBday };
  }, [dob]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Select Date of Birth</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-300 outline-none focus:border-cyan-500"
        />
        <p className="text-xs text-slate-500">Calculates precise calendar years, months, days & total elapsed time.</p>
      </div>

      {ageData && (
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
            <span>Exact Age Breakdown</span>
            <button
              onClick={() => onCopy(`${ageData.years} Years, ${ageData.months} Months, ${ageData.days} Days`, 'age-res')}
              className="text-cyan-400"
            >
              {copiedKey === 'age-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="text-3xl sm:text-4xl font-mono font-black text-white">{ageData.years}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">Years</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300">{ageData.months}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">Months</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">{ageData.days}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">Days</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block">Total Days</span>
              <span className="text-slate-200 font-bold">{ageData.totalDays.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block">Total Hours</span>
              <span className="text-slate-200 font-bold">{ageData.totalHours.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block">Total Minutes</span>
              <span className="text-slate-200 font-bold">{ageData.totalMinutes.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block">Next Birthday</span>
              <span className="text-amber-400 font-bold">{ageData.daysToBday} days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 6: Date Difference Calculator
   ========================================================================= */
function DateDiffCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [start, setStart] = useState<string>('2026-01-01');
  const [end, setEnd] = useState<string>('2026-12-31');

  const diff = useMemo(() => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;

    const diffMs = Math.abs(e.getTime() - s.getTime());
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeks = fmtNum(totalDays / 7, 1);

    // Calculate business days
    let busDays = 0;
    const cur = new Date(Math.min(s.getTime(), e.getTime()));
    const target = new Date(Math.max(s.getTime(), e.getTime()));
    while (cur < target) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) busDays++;
      cur.setDate(cur.getDate() + 1);
    }

    return { totalDays, weeks, busDays };
  }, [start, end]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-white outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-white outline-none"
          />
        </div>
      </div>

      {diff && (
        <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
            <span>Interval Result</span>
            <button onClick={() => onCopy(`${diff.totalDays} Days`, 'diff-res')} className="text-cyan-400">
              {copiedKey === 'diff-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="text-3xl font-mono font-black text-white">{diff.totalDays}</div>
              <div className="text-xs text-slate-400 mt-1">Calendar Days</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="text-3xl font-mono font-black text-cyan-300">{diff.weeks}</div>
              <div className="text-xs text-slate-400 mt-1">Weeks</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="text-3xl font-mono font-black text-emerald-400">{diff.busDays}</div>
              <div className="text-xs text-slate-400 mt-1">Business Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 7: GST / VAT Tax Calculator
   ========================================================================= */
function GstVatCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [amount, setAmount] = useState<string>('500');
  const [rate, setRate] = useState<string>('18');
  const [mode, setMode] = useState<'add' | 'remove'>('add');

  const { net, tax, total } = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const r = (parseFloat(rate) || 0) / 100;

    if (mode === 'add') {
      const taxAmt = a * r;
      return { net: fmtNum(a, 2), tax: fmtNum(taxAmt, 2), total: fmtNum(a + taxAmt, 2) };
    } else {
      const netAmt = a / (1 + r);
      const taxAmt = a - netAmt;
      return { net: fmtNum(netAmt, 2), tax: fmtNum(taxAmt, 2), total: fmtNum(a, 2) };
    }
  }, [amount, rate, mode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Operation Mode</span>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('add')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${mode === 'add' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              Add GST (Exclusive)
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${mode === 'remove' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              Remove GST (Inclusive)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">Base / Invoice Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400">GST / VAT Rate (%):</span>
          <div className="flex gap-2">
            {['5', '12', '18', '28'].map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border ${
                  rate === r ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase">Tax Invoice Summary</div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Net Amount:</span>
            <span className="text-white font-bold">{net}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Tax Amount ({rate}%):</span>
            <span className="text-amber-400 font-bold">{tax}</span>
          </div>
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/30 flex justify-between items-center text-sm font-mono">
            <span className="text-cyan-400 font-bold">Total Gross:</span>
            <span className="text-2xl font-black text-white">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: Discount & Savings Calculator
   ========================================================================= */
function DiscountCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [price, setPrice] = useState<string>('120');
  const [discountPct, setDiscountPct] = useState<string>('25');

  const { savings, finalPrice } = useMemo(() => {
    const p = parseFloat(price) || 0;
    const d = (parseFloat(discountPct) || 0) / 100;
    const save = p * d;
    return { savings: fmtNum(save, 2), finalPrice: fmtNum(p - save, 2) };
  }, [price, discountPct]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Original Retail Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Discount Percentage:</span>
            <span className="text-cyan-400 font-mono">{discountPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={discountPct}
            onChange={(e) => setDiscountPct(e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase">Final Price & Savings</div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-500">You Pay</span>
          <div className="text-4xl font-mono font-black text-emerald-400">${finalPrice}</div>
          <div className="text-xs font-mono text-amber-400 pt-1">You Save ${savings} ({discountPct}%)</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9 & 10: Loan & EMI Calculator (Equated Monthly Installment)
   ========================================================================= */
function LoanCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  return <EmiCalculatorTool onCopy={onCopy} copiedKey={copiedKey} />;
}

function EmiCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [principal, setPrincipal] = useState<string>('50000');
  const [rateAnnual, setRateAnnual] = useState<string>('8.5');
  const [tenureYears, setTenureYears] = useState<string>('5');

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rateAnnual) || 0) / 12 / 100;
    const n = (parseFloat(tenureYears) || 1) * 12;

    if (P <= 0 || r <= 0 || n <= 0) return { emi: '0', totalInterest: '0', totalPayable: '0' };

    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emiVal = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const payable = emiVal * n;
    const interest = payable - P;

    return {
      emi: fmtNum(emiVal, 2),
      totalInterest: fmtNum(interest, 2),
      totalPayable: fmtNum(payable, 2),
    };
  }, [principal, rateAnnual, tenureYears]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Loan Principal Amount ($)</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Annual Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={rateAnnual}
              onChange={(e) => setRateAnnual(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-lg font-mono font-bold text-cyan-300 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Tenure (Years)</label>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-lg font-mono font-bold text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase">Repayment Schedule</div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-500">Monthly EMI</span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300">${emi}</div>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-xl flex justify-between">
            <span className="text-slate-400">Total Interest:</span>
            <span className="text-amber-400 font-bold">${totalInterest}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl flex justify-between">
            <span className="text-slate-400">Total Payable:</span>
            <span className="text-white font-bold">${totalPayable}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Simple & Compound Interest Calculator
   ========================================================================= */
function InterestCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [p, setP] = useState<string>('10000');
  const [r, setR] = useState<string>('6');
  const [t, setT] = useState<string>('5');
  const [freq, setFreq] = useState<number>(12); // Monthly

  const { simpleInterest, simpleTotal, compoundInterest, compoundTotal } = useMemo(() => {
    const P = parseFloat(p) || 0;
    const rate = (parseFloat(r) || 0) / 100;
    const time = parseFloat(t) || 0;

    const si = P * rate * time;
    const ciTotal = P * Math.pow(1 + rate / freq, freq * time);
    const ci = ciTotal - P;

    return {
      simpleInterest: fmtNum(si, 2),
      simpleTotal: fmtNum(P + si, 2),
      compoundInterest: fmtNum(ci, 2),
      compoundTotal: fmtNum(ciTotal, 2),
    };
  }, [p, r, t, freq]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">Principal ($)</label>
          <input
            type="number"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Annual Rate (%)</label>
            <input
              type="number"
              value={r}
              onChange={(e) => setR(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-cyan-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Time (Years)</label>
            <input
              type="number"
              value={t}
              onChange={(e) => setT(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Simple Interest</span>
          <div className="text-2xl font-mono font-black text-white">${simpleInterest}</div>
          <div className="text-xs text-slate-500 font-mono">Total: ${simpleTotal}</div>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase">Compound Interest</span>
          <div className="text-2xl font-mono font-black text-emerald-400">${compoundInterest}</div>
          <div className="text-xs text-slate-500 font-mono">Total: ${compoundTotal}</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Tip Calculator & Bill Splitter
   ========================================================================= */
function TipCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [bill, setBill] = useState<string>('120');
  const [tipPct, setTipPct] = useState<string>('18');
  const [people, setPeople] = useState<string>('4');

  const { tipAmount, totalBill, perPerson } = useMemo(() => {
    const b = parseFloat(bill) || 0;
    const t = (parseFloat(tipPct) || 0) / 100;
    const p = Math.max(1, parseInt(people) || 1);

    const tip = b * t;
    const tot = b + tip;
    return { tipAmount: fmtNum(tip, 2), totalBill: fmtNum(tot, 2), perPerson: fmtNum(tot / p, 2) };
  }, [bill, tipPct, people]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Total Bill Amount ($)</label>
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Tip (%)</label>
            <input
              type="number"
              value={tipPct}
              onChange={(e) => setTipPct(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-lg font-mono text-cyan-300 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Number of People</label>
            <input
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-lg font-mono text-white font-bold"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase">Amount Per Person</span>
        <div className="text-4xl font-mono font-black text-emerald-400">${perPerson}</div>
        <div className="text-xs font-mono text-slate-500 pt-2">
          Total Bill: ${totalBill} (Tip: ${tipAmount})
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 13: Profit Calculator (Cost vs Selling Price)
   ========================================================================= */
function ProfitCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [cost, setCost] = useState<string>('40');
  const [selling, setSelling] = useState<string>('65');

  const { profit, roi, isProfit } = useMemo(() => {
    const c = parseFloat(cost) || 0;
    const s = parseFloat(selling) || 0;
    const p = s - c;
    const r = c > 0 ? (p / c) * 100 : 0;
    return { profit: fmtNum(p, 2), roi: fmtNum(r, 2), isProfit: p >= 0 };
  }, [cost, selling]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Cost Price ($)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Selling Price ($)</label>
            <input
              type="number"
              value={selling}
              onChange={(e) => setSelling(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Net {isProfit ? 'Profit' : 'Loss'}</span>
        <div className={`text-4xl font-mono font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
          ${profit}
        </div>
        <div className="text-xs font-mono text-slate-400">Return on Investment (ROI): {roi}%</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Margin & Markup Calculator
   ========================================================================= */
function MarginCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [cost, setCost] = useState<string>('50');
  const [revenue, setRevenue] = useState<string>('80');

  const { margin, markup } = useMemo(() => {
    const c = parseFloat(cost) || 0;
    const r = parseFloat(revenue) || 0;
    const profit = r - c;
    const m = r > 0 ? (profit / r) * 100 : 0;
    const mu = c > 0 ? (profit / c) * 100 : 0;
    return { margin: fmtNum(m, 2), markup: fmtNum(mu, 2) };
  }, [cost, revenue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Cost ($)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Revenue / Price ($)</label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 grid grid-cols-2 gap-3">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-center space-y-1">
          <span className="text-xs font-bold text-slate-400">Gross Margin</span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300">{margin}%</div>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-center space-y-1">
          <span className="text-xs font-bold text-slate-400">Markup</span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">{markup}%</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Break-Even Calculator
   ========================================================================= */
function BreakEvenCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [fixedCosts, setFixedCosts] = useState<string>('5000');
  const [variableCost, setVariableCost] = useState<string>('12');
  const [pricePerUnit, setPricePerUnit] = useState<string>('30');

  const { breakEvenUnits, breakEvenRevenue } = useMemo(() => {
    const fc = parseFloat(fixedCosts) || 0;
    const vc = parseFloat(variableCost) || 0;
    const p = parseFloat(pricePerUnit) || 0;
    const cm = p - vc; // Contribution margin

    if (cm <= 0) return { breakEvenUnits: 'N/A', breakEvenRevenue: 'N/A' };
    const units = Math.ceil(fc / cm);
    return { breakEvenUnits: units.toLocaleString(), breakEvenRevenue: fmtNum(units * p, 2) };
  }, [fixedCosts, variableCost, pricePerUnit]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Fixed Overhead Costs ($)</label>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Variable Cost / Unit ($)</label>
            <input
              type="number"
              value={variableCost}
              onChange={(e) => setVariableCost(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Selling Price / Unit ($)</label>
            <input
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-cyan-300"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Break-Even Sales Units</span>
        <div className="text-4xl font-mono font-black text-cyan-300">{breakEvenUnits} Units</div>
        <div className="text-xs font-mono text-slate-500">Break-Even Revenue: ${breakEvenRevenue}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 16: Time Duration Calculator
   ========================================================================= */
function TimeDurationCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [h1, setH1] = useState<string>('2');
  const [m1, setM1] = useState<string>('45');
  const [op, setOp] = useState<'+' | '-'>('+');
  const [h2, setH2] = useState<string>('1');
  const [m2, setM2] = useState<string>('30');

  const { resH, resM, totalMinutes } = useMemo(() => {
    const min1 = (parseInt(h1) || 0) * 60 + (parseInt(m1) || 0);
    const min2 = (parseInt(h2) || 0) * 60 + (parseInt(m2) || 0);
    const tot = op === '+' ? min1 + min2 : Math.max(0, min1 - min2);

    return { resH: Math.floor(tot / 60), resM: tot % 60, totalMinutes: tot };
  }, [h1, m1, op, h2, m2]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Hours</span>
            <input
              type="number"
              value={h1}
              onChange={(e) => setH1(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
          <span className="text-xl font-mono text-slate-500 mt-5">:</span>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Minutes</span>
            <input
              type="number"
              value={m1}
              onChange={(e) => setM1(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mt-5">
            <button
              onClick={() => setOp('+')}
              className={`px-3 py-2 rounded-lg font-bold text-sm ${op === '+' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              +
            </button>
            <button
              onClick={() => setOp('-')}
              className={`px-3 py-2 rounded-lg font-bold text-sm ${op === '-' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
            >
              −
            </button>
          </div>

          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Hours</span>
            <input
              type="number"
              value={h2}
              onChange={(e) => setH2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
          <span className="text-xl font-mono text-slate-500 mt-5">:</span>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Minutes</span>
            <input
              type="number"
              value={m2}
              onChange={(e) => setM2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Resulting Duration</span>
        <div className="text-4xl font-mono font-black text-cyan-300">
          {resH}h {resM}m
        </div>
        <div className="text-xs font-mono text-slate-500">Total: {totalMinutes} minutes</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 17: Fuel Trip Cost Calculator
   ========================================================================= */
function FuelCostCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [distance, setDistance] = useState<string>('350');
  const [efficiency, setEfficiency] = useState<string>('8.5'); // L/100km
  const [fuelPrice, setFuelPrice] = useState<string>('1.45'); // $ per Liter

  const { fuelNeeded, totalCost } = useMemo(() => {
    const d = parseFloat(distance) || 0;
    const eff = parseFloat(efficiency) || 0;
    const price = parseFloat(fuelPrice) || 0;

    const needed = (d / 100) * eff;
    const cost = needed * price;
    return { fuelNeeded: fmtNum(needed, 1), totalCost: fmtNum(cost, 2) };
  }, [distance, efficiency, fuelPrice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Trip Distance (km / miles)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Consumption (L / 100km)</label>
            <input
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-cyan-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Fuel Price per Liter ($)</label>
            <input
              type="number"
              step="0.01"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono font-bold text-white"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Estimated Trip Cost</span>
        <div className="text-4xl font-mono font-black text-emerald-400">${totalCost}</div>
        <div className="text-xs font-mono text-slate-500">Fuel Required: {fuelNeeded} Liters</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 18: Average & Statistics Calculator
   ========================================================================= */
function AverageCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [inputStr, setInputStr] = useState<string>('12, 18, 25, 32, 45, 18, 29, 50');

  const stats = useMemo(() => {
    const numbers = inputStr
      .split(/[,\s]+/)
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) return null;

    const count = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    let median = 0;
    const mid = Math.floor(count / 2);
    if (count % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    // Standard deviation
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      sum: fmtNum(sum, 2),
      mean: fmtNum(mean, 2),
      median: fmtNum(median, 2),
      min: fmtNum(min, 2),
      max: fmtNum(max, 2),
      range: fmtNum(range, 2),
      stdDev: fmtNum(stdDev, 2),
    };
  }, [inputStr]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase">Input Numbers (comma or space separated)</label>
        <textarea
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-300 outline-none focus:border-cyan-500"
        />
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 font-bold uppercase">Mean (Average)</span>
            <div className="text-2xl font-mono font-black text-cyan-300 mt-1">{stats.mean}</div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 font-bold uppercase">Median</span>
            <div className="text-2xl font-mono font-black text-white mt-1">{stats.median}</div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 font-bold uppercase">Min / Max</span>
            <div className="text-2xl font-mono font-black text-white mt-1">
              {stats.min} / {stats.max}
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 font-bold uppercase">Standard Dev (σ)</span>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-1">{stats.stdDev}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 19: GPA Calculator
   ========================================================================= */
interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

function GpaCalculatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Computer Science', grade: 'A', credits: 4 },
    { id: '2', name: 'Calculus III', grade: 'B+', credits: 3 },
    { id: '3', name: 'Physics I', grade: 'A-', credits: 4 },
    { id: '4', name: 'Technical Writing', grade: 'A', credits: 3 },
  ]);

  const GRADE_SCALE: Record<string, number> = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    D: 1.0,
    F: 0.0,
  };

  const gpa = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach((c) => {
      const pts = GRADE_SCALE[c.grade] ?? 0;
      totalPoints += pts * c.credits;
      totalCredits += c.credits;
    });

    if (totalCredits === 0) return '0.00';
    return fmtNum(totalPoints / totalCredits, 2);
  }, [courses]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: `Course ${courses.length + 1}`, grade: 'A', credits: 3 }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
          <span>Courses & Grades</span>
          <button onClick={addCourse} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
            <Plus className="w-3.5 h-3.5" />
            Add Course
          </button>
        </div>

        <div className="space-y-2">
          {courses.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <input
                type="text"
                value={c.name}
                onChange={(e) => {
                  const copy = [...courses];
                  copy[i].name = e.target.value;
                  setCourses(copy);
                }}
                className="flex-1 bg-transparent text-xs text-white outline-none font-medium px-2"
              />
              <select
                value={c.grade}
                onChange={(e) => {
                  const copy = [...courses];
                  copy[i].grade = e.target.value;
                  setCourses(copy);
                }}
                className="bg-slate-950 border border-slate-800 text-cyan-300 text-xs rounded-lg px-2 py-1 font-bold font-mono"
              >
                {Object.keys(GRADE_SCALE).map((g) => (
                  <option key={g} value={g}>
                    {g} ({GRADE_SCALE[g]})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="10"
                value={c.credits}
                onChange={(e) => {
                  const copy = [...courses];
                  copy[i].credits = parseInt(e.target.value) || 1;
                  setCourses(copy);
                }}
                className="w-14 bg-slate-950 border border-slate-800 text-xs text-white text-center rounded-lg py-1 font-mono"
              />
              <button onClick={() => removeCourse(c.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Cumulative GPA (4.0 Scale)</span>
        <div className="text-5xl font-mono font-black text-cyan-300">{gpa}</div>
        <div className="text-xs text-slate-500 font-mono">
          {parseFloat(gpa) >= 3.5 ? 'Dean\'s List / Honors' : parseFloat(gpa) >= 3.0 ? 'Good Standing' : 'Passing'}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 20: Equation Solver (Linear & Quadratic)
   ========================================================================= */
function EquationSolverTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [eqType, setEqType] = useState<'linear' | 'quadratic'>('quadratic');

  // Quadratic: ax² + bx + c = 0
  const [qa, setQa] = useState<string>('1');
  const [qb, setQb] = useState<string>('-5');
  const [qc, setQc] = useState<string>('6');

  // Linear: ax + b = 0
  const [la, setLa] = useState<string>('2');
  const [lb, setLb] = useState<string>('-8');

  const quadRoots = useMemo(() => {
    const a = parseFloat(qa) || 0;
    const b = parseFloat(qb) || 0;
    const c = parseFloat(qc) || 0;

    if (a === 0) return { d: 0, text: 'Not a quadratic equation (a = 0)' };

    const discriminant = b * b - 4 * a * c;
    if (discriminant > 0) {
      const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return {
        d: discriminant,
        text: `Two Real Roots: x₁ = ${fmtNum(r1, 4)}, x₂ = ${fmtNum(r2, 4)}`,
      };
    } else if (discriminant === 0) {
      const r = -b / (2 * a);
      return {
        d: 0,
        text: `One Double Root: x = ${fmtNum(r, 4)}`,
      };
    } else {
      const real = fmtNum(-b / (2 * a), 3);
      const img = fmtNum(Math.sqrt(-discriminant) / (2 * a), 3);
      return {
        d: discriminant,
        text: `Complex Roots: x = ${real} ± ${img}i`,
      };
    }
  }, [qa, qb, qc]);

  const linearRoot = useMemo(() => {
    const a = parseFloat(la) || 0;
    const b = parseFloat(lb) || 0;
    if (a === 0) return b === 0 ? 'Infinite solutions' : 'No solution';
    return `x = ${fmtNum(-b / a, 4)}`;
  }, [la, lb]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setEqType('quadratic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            eqType === 'quadratic' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Quadratic (ax² + bx + c = 0)
        </button>
        <button
          onClick={() => setEqType('linear')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            eqType === 'linear' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Linear (ax + b = 0)
        </button>
      </div>

      {eqType === 'quadratic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Input Coefficients</span>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">a (x²)</label>
                <input
                  type="number"
                  value={qa}
                  onChange={(e) => setQa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">b (x)</label>
                <input
                  type="number"
                  value={qb}
                  onChange={(e) => setQb(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">c (const)</label>
                <input
                  type="number"
                  value={qc}
                  onChange={(e) => setQc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Solved Roots</span>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-base font-bold text-cyan-300">
              {quadRoots.text}
            </div>
            <div className="text-xs text-slate-500 font-mono">Discriminant (Δ = b² - 4ac): {quadRoots.d}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Linear Equation (ax + b = 0)</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">a</label>
                <input
                  type="number"
                  value={la}
                  onChange={(e) => setLa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">b</label>
                <input
                  type="number"
                  value={lb}
                  onChange={(e) => setLb(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Solution</span>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xl font-bold text-cyan-300">
              {linearRoot}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
