import React, { useState, useMemo, useCallback } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Ruler,
  Scale,
  Maximize2,
  Boxes,
  Gauge,
  Thermometer,
  Compass,
  Zap,
  Cpu,
  Clock,
  HardDrive,
  Fuel,
  RotateCw,
  Coins,
  Atom,
  ArrowRightLeft,
  Copy,
  Check,
  Search,
  RefreshCw,
  Sliders,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Info,
} from 'lucide-react';

export type UnitConverterToolId =
  | 'length'
  | 'weight'
  | 'area'
  | 'volume'
  | 'speed'
  | 'temperature'
  | 'pressure'
  | 'energy'
  | 'power'
  | 'time'
  | 'data-storage'
  | 'fuel-economy'
  | 'angle'
  | 'currency'
  | 'scientific';

export interface UnitConverterToolMeta {
  id: UnitConverterToolId;
  name: string;
  category: 'metric' | 'physics' | 'everyday' | 'specialized';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const UNIT_TOOLS_META: UnitConverterToolMeta[] = [
  {
    id: 'length',
    name: 'Length Converter',
    category: 'metric',
    categoryLabel: 'Geometric',
    description: 'Convert millimeters, meters, kilometers, inches, feet, yards, miles, and nautical miles.',
    icon: Ruler,
    badge: 'Popular',
  },
  {
    id: 'weight',
    name: 'Weight & Mass',
    category: 'metric',
    categoryLabel: 'Geometric',
    description: 'Convert milligrams, grams, kilograms, metric tons, ounces, pounds, and stones.',
    icon: Scale,
    badge: 'Standard',
  },
  {
    id: 'area',
    name: 'Area Converter',
    category: 'metric',
    categoryLabel: 'Geometric',
    description: 'Convert sq mm, sq cm, sq meters, hectares, sq km, sq inches, sq feet, and acres.',
    icon: Maximize2,
  },
  {
    id: 'volume',
    name: 'Volume Converter',
    category: 'metric',
    categoryLabel: 'Geometric',
    description: 'Convert milliliters, liters, cubic meters, tsp, tbsp, fl oz, cups, pints, and gallons.',
    icon: Boxes,
  },
  {
    id: 'speed',
    name: 'Speed Converter',
    category: 'physics',
    categoryLabel: 'Physics',
    description: 'Convert meters/sec, km/h, miles/hour (mph), knots, and feet/sec.',
    icon: Gauge,
  },
  {
    id: 'temperature',
    name: 'Temperature Converter',
    category: 'physics',
    categoryLabel: 'Physics',
    description: 'Convert Celsius (°C), Fahrenheit (°F), and Kelvin (K) with dynamic formulas.',
    icon: Thermometer,
    badge: 'Formulas',
  },
  {
    id: 'pressure',
    name: 'Pressure Converter',
    category: 'physics',
    categoryLabel: 'Physics',
    description: 'Convert Pascal (Pa), kPa, bar, PSI (lbf/in²), Atmosphere (atm), and mmHg / Torr.',
    icon: Compass,
  },
  {
    id: 'energy',
    name: 'Energy Converter',
    category: 'physics',
    categoryLabel: 'Physics',
    description: 'Convert Joules (J), kJ, Calories (cal), kcal, Watt-hours (Wh), kWh, and British Thermal Units (BTU).',
    icon: Zap,
  },
  {
    id: 'power',
    name: 'Power Converter',
    category: 'physics',
    categoryLabel: 'Physics',
    description: 'Convert Watts (W), kilowatts (kW), Megawatts (MW), and Mechanical Horsepower (HP).',
    icon: Cpu,
  },
  {
    id: 'time',
    name: 'Time Converter',
    category: 'everyday',
    categoryLabel: 'Everyday',
    description: 'Convert milliseconds, seconds, minutes, hours, days, weeks, months, and years.',
    icon: Clock,
  },
  {
    id: 'data-storage',
    name: 'Data Storage Converter',
    category: 'everyday',
    categoryLabel: 'Everyday',
    description: 'Convert Bits, Bytes, Kilobytes (KB), Megabytes (MB), Gigabytes (GB), Terabytes (TB), and PB.',
    icon: HardDrive,
    badge: 'Binary/Dec',
  },
  {
    id: 'fuel-economy',
    name: 'Fuel Economy Converter',
    category: 'everyday',
    categoryLabel: 'Everyday',
    description: 'Convert US MPG, Imperial UK MPG, km/Liter, and Liters per 100km (L/100km).',
    icon: Fuel,
  },
  {
    id: 'angle',
    name: 'Angle Converter',
    category: 'specialized',
    categoryLabel: 'Specialized',
    description: 'Convert Degrees (°), Radians (rad), Gradians (grad), and Arcminutes/Arcseconds.',
    icon: RotateCw,
  },
  {
    id: 'currency',
    name: 'Offline Currency Calculator',
    category: 'specialized',
    categoryLabel: 'Specialized',
    description: '100% offline currency calculator with customizable exchange rate matrix.',
    icon: Coins,
    badge: 'Offline Safe',
  },
  {
    id: 'scientific',
    name: 'Scientific SI Converter',
    category: 'specialized',
    categoryLabel: 'Specialized',
    description: 'SI prefixes (nano to exa) with scientific notation exponential exponent formatting (1e+6).',
    icon: Atom,
    badge: 'Scientific',
  },
];

// Helper to format float nicely without floating point glitches
function formatNumber(num: number, precision: number = 6): string {
  if (isNaN(num) || !isFinite(num)) return '0';
  if (num === 0) return '0';
  if (Math.abs(num) < 1e-6 || Math.abs(num) >= 1e9) {
    return num.toExponential(4);
  }
  const factor = Math.pow(10, precision);
  const rounded = Math.round(num * factor) / factor;
  return rounded.toString();
}

export function UnitConvertersToolsSuite() {
  const [activeTool, setActiveTool] = useState<UnitConverterToolId>('length');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = UNIT_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Unit Converter';
      logActivity(toolName, `Converted & copied value: ${text}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return UNIT_TOOLS_META.filter((tool) => {
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
    UNIT_TOOLS_META.find((t) => t.id === activeTool) || UNIT_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="unit-converters-suite-root">
      {/* 15 Tools Selector Dashboard */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-cyan-400" />
                Unit Converters Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                15 MATHEMATICAL MODULES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Zero server calls. Pure instant browser IEEE 754 precision calculations with unit matrix tables.
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
                placeholder="Search 15 unit tools..."
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
                { id: 'metric', label: 'Geometric' },
                { id: 'physics', label: 'Physics' },
                { id: 'everyday', label: 'Everyday' },
                { id: 'specialized', label: 'Specialized' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-amber-500 to-cyan-500 text-white shadow-sm'
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
                  document.getElementById('active-unit-converter-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/30 to-cyan-500/20 border-cyan-400/50 shadow-md shadow-amber-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500 to-cyan-500 text-white shadow-sm'
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
      <div id="active-unit-converter-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-cyan-500 p-[1.5px] shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bi-directional Real-Time</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'length' && <GenericLinearConverterTool type="length" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'weight' && <GenericLinearConverterTool type="weight" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'area' && <GenericLinearConverterTool type="area" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'volume' && <GenericLinearConverterTool type="volume" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'speed' && <GenericLinearConverterTool type="speed" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'temperature' && <TemperatureConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'pressure' && <GenericLinearConverterTool type="pressure" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'energy' && <GenericLinearConverterTool type="energy" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'power' && <GenericLinearConverterTool type="power" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'time' && <GenericLinearConverterTool type="time" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'data-storage' && <DataStorageConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'fuel-economy' && <FuelEconomyConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'angle' && <GenericLinearConverterTool type="angle" onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'currency' && <OfflineCurrencyConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'scientific' && <ScientificConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   GENERIC LINEAR CONVERTER FACTORY
   Handles: Length, Weight, Area, Volume, Speed, Pressure, Energy, Power, Time, Angle
   ========================================================================= */

interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  ratio: number; // Multiply by ratio to convert from this unit to the base unit
}

const LINEAR_SYSTEMS: Record<
  string,
  {
    baseUnit: string;
    units: UnitDefinition[];
  }
> = {
  length: {
    baseUnit: 'm',
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm', ratio: 0.001 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', ratio: 0.01 },
      { id: 'm', name: 'Meter', symbol: 'm', ratio: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', ratio: 1000 },
      { id: 'inch', name: 'Inch', symbol: 'in', ratio: 0.0254 },
      { id: 'feet', name: 'Feet', symbol: 'ft', ratio: 0.3048 },
      { id: 'yard', name: 'Yard', symbol: 'yd', ratio: 0.9144 },
      { id: 'mile', name: 'Mile', symbol: 'mi', ratio: 1609.344 },
      { id: 'nautical', name: 'Nautical Mile', symbol: 'nmi', ratio: 1852 },
    ],
  },
  weight: {
    baseUnit: 'kg',
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg', ratio: 1e-6 },
      { id: 'g', name: 'Gram', symbol: 'g', ratio: 0.001 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', ratio: 1 },
      { id: 'ton', name: 'Metric Ton', symbol: 't', ratio: 1000 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', ratio: 0.028349523125 },
      { id: 'lb', name: 'Pound', symbol: 'lb', ratio: 0.45359237 },
      { id: 'stone', name: 'Stone (UK)', symbol: 'st', ratio: 6.35029318 },
    ],
  },
  area: {
    baseUnit: 'sqm',
    units: [
      { id: 'sqmm', name: 'Square Millimeter', symbol: 'mm²', ratio: 1e-6 },
      { id: 'sqcm', name: 'Square Centimeter', symbol: 'cm²', ratio: 0.0001 },
      { id: 'sqm', name: 'Square Meter', symbol: 'm²', ratio: 1 },
      { id: 'hectare', name: 'Hectare', symbol: 'ha', ratio: 10000 },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²', ratio: 1e6 },
      { id: 'sqin', name: 'Square Inch', symbol: 'sq in', ratio: 0.00064516 },
      { id: 'sqft', name: 'Square Feet', symbol: 'sq ft', ratio: 0.09290304 },
      { id: 'acre', name: 'Acre', symbol: 'ac', ratio: 4046.8564224 },
    ],
  },
  volume: {
    baseUnit: 'l',
    units: [
      { id: 'ml', name: 'Milliliter', symbol: 'mL', ratio: 0.001 },
      { id: 'l', name: 'Liter', symbol: 'L', ratio: 1 },
      { id: 'm3', name: 'Cubic Meter', symbol: 'm³', ratio: 1000 },
      { id: 'tsp', name: 'Teaspoon (US)', symbol: 'tsp', ratio: 0.00492892 },
      { id: 'tbsp', name: 'Tablespoon (US)', symbol: 'tbsp', ratio: 0.0147868 },
      { id: 'floz', name: 'Fluid Ounce (US)', symbol: 'fl oz', ratio: 0.0295735 },
      { id: 'cup', name: 'Cup (US)', symbol: 'cup', ratio: 0.236588 },
      { id: 'pint', name: 'Pint (US)', symbol: 'pt', ratio: 0.473176 },
      { id: 'gallon', name: 'Gallon (US)', symbol: 'gal', ratio: 3.785411784 },
    ],
  },
  speed: {
    baseUnit: 'mps',
    units: [
      { id: 'mps', name: 'Meters per Second', symbol: 'm/s', ratio: 1 },
      { id: 'kmh', name: 'Kilometers per Hour', symbol: 'km/h', ratio: 0.2777777778 },
      { id: 'mph', name: 'Miles per Hour', symbol: 'mph', ratio: 0.44704 },
      { id: 'knot', name: 'Knot (Nautical)', symbol: 'kn', ratio: 0.5144444444 },
      { id: 'fps', name: 'Feet per Second', symbol: 'ft/s', ratio: 0.3048 },
    ],
  },
  pressure: {
    baseUnit: 'pa',
    units: [
      { id: 'pa', name: 'Pascal', symbol: 'Pa', ratio: 1 },
      { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', ratio: 1000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', ratio: 100000 },
      { id: 'psi', name: 'Pounds per Sq Inch', symbol: 'psi', ratio: 6894.75729 },
      { id: 'atm', name: 'Standard Atmosphere', symbol: 'atm', ratio: 101325 },
      { id: 'mmhg', name: 'Millimeter of Mercury (Torr)', symbol: 'mmHg', ratio: 133.322368 },
    ],
  },
  energy: {
    baseUnit: 'j',
    units: [
      { id: 'j', name: 'Joule', symbol: 'J', ratio: 1 },
      { id: 'kj', name: 'Kilojoule', symbol: 'kJ', ratio: 1000 },
      { id: 'cal', name: 'Gram Calorie', symbol: 'cal', ratio: 4.184 },
      { id: 'kcal', name: 'Kilocalorie (Food cal)', symbol: 'kcal', ratio: 4184 },
      { id: 'wh', name: 'Watt-hour', symbol: 'Wh', ratio: 3600 },
      { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', ratio: 3.6e6 },
      { id: 'btu', name: 'British Thermal Unit', symbol: 'BTU', ratio: 1055.05585 },
    ],
  },
  power: {
    baseUnit: 'w',
    units: [
      { id: 'w', name: 'Watt', symbol: 'W', ratio: 1 },
      { id: 'kw', name: 'Kilowatt', symbol: 'kW', ratio: 1000 },
      { id: 'mw', name: 'Megawatt', symbol: 'MW', ratio: 1e6 },
      { id: 'hp', name: 'Mechanical Horsepower', symbol: 'HP', ratio: 745.699872 },
    ],
  },
  time: {
    baseUnit: 's',
    units: [
      { id: 'ms', name: 'Millisecond', symbol: 'ms', ratio: 0.001 },
      { id: 's', name: 'Second', symbol: 's', ratio: 1 },
      { id: 'min', name: 'Minute', symbol: 'min', ratio: 60 },
      { id: 'hr', name: 'Hour', symbol: 'hr', ratio: 3600 },
      { id: 'day', name: 'Day', symbol: 'd', ratio: 86400 },
      { id: 'week', name: 'Week', symbol: 'wk', ratio: 604800 },
      { id: 'month', name: 'Month (30.4375 days)', symbol: 'mo', ratio: 2629800 },
      { id: 'year', name: 'Year (365.25 days)', symbol: 'yr', ratio: 31557600 },
    ],
  },
  angle: {
    baseUnit: 'deg',
    units: [
      { id: 'deg', name: 'Degree', symbol: '°', ratio: 1 },
      { id: 'rad', name: 'Radian', symbol: 'rad', ratio: 57.29577951308232 },
      { id: 'grad', name: 'Gradian', symbol: 'grad', ratio: 0.9 },
      { id: 'arcmin', name: 'Arcminute', symbol: 'arcmin', ratio: 1 / 60 },
      { id: 'arcsec', name: 'Arcsecond', symbol: 'arcsec', ratio: 1 / 3600 },
    ],
  },
};

function GenericLinearConverterTool({
  type,
  onCopy,
  copiedKey,
}: {
  type: string;
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const sys = LINEAR_SYSTEMS[type];
  const [fromValue, setFromValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>(sys.units[0].id);
  const [toUnit, setToUnit] = useState<string>(sys.units[1] ? sys.units[1].id : sys.units[0].id);
  const [precision, setPrecision] = useState<number>(6);

  // Conversion Math
  const fromDef = sys.units.find((u) => u.id === fromUnit) || sys.units[0];
  const toDef = sys.units.find((u) => u.id === toUnit) || sys.units[1];

  const valNum = parseFloat(fromValue) || 0;
  const baseValue = valNum * fromDef.ratio;
  const targetValue = baseValue / toDef.ratio;
  const targetFormatted = formatNumber(targetValue, precision);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="space-y-8">
      {/* Primary Input & Output Bi-directional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* From Box */}
        <div className="md:col-span-5 bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>From ({fromDef.name})</span>
            <span className="font-mono text-cyan-400">{fromDef.symbol}</span>
          </div>

          <input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full bg-transparent text-xl sm:text-2xl md:text-3xl font-mono font-black text-white outline-none"
            placeholder="0"
          />

          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-cyan-500"
          >
            {sys.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Action Pill */}
        <div className="md:col-span-2 flex justify-center">
          <button
            onClick={handleSwap}
            title="Swap units"
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-cyan-500 text-white shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* To Box */}
        <div className="md:col-span-5 bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>To ({toDef.name})</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400">{toDef.symbol}</span>
              <button
                onClick={() => onCopy(targetFormatted, `res-${type}`)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1"
              >
                {copiedKey === `res-${type}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === `res-${type}` ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-cyan-300 truncate select-all">
            {targetFormatted}
          </div>

          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-cyan-500"
          >
            {sys.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula & Precision Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>
            Formula: 1 {fromDef.symbol} = {formatNumber(fromDef.ratio / toDef.ratio, 6)} {toDef.symbol}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Decimal Decimals:</span>
          <div className="flex gap-1">
            {[2, 4, 6, 8].map((d) => (
              <button
                key={d}
                onClick={() => setPrecision(d)}
                className={`px-2.5 py-1 rounded-lg font-mono font-semibold border ${
                  precision === d
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full Conversion Matrix Grid (Shows all other unit equivalents) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>All Units Conversion Matrix for {valNum || 0} {fromDef.symbol}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {sys.units.map((u) => {
            const converted = baseValue / u.ratio;
            const formatted = formatNumber(converted, precision);
            const isCurrent = u.id === toUnit;

            return (
              <div
                key={u.id}
                onClick={() => setToUnit(u.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-cyan-500/10 border-cyan-400/50 shadow-md'
                    : 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs text-slate-400 font-medium truncate">{u.name}</div>
                  <div className="text-sm font-mono font-bold text-cyan-300 truncate mt-0.5">
                    {formatted} <span className="text-slate-500 text-xs font-normal">{u.symbol}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(formatted, `matrix-${u.id}`);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                >
                  {copiedKey === `matrix-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Temperature Converter
   ========================================================================= */
function TemperatureConverterTool({
  onCopy,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const [val, setVal] = useState<string>('25');
  const [unit, setUnit] = useState<'C' | 'F' | 'K'>('C');

  const num = parseFloat(val) || 0;

  // Calculate equivalents
  const results = useMemo(() => {
    let celsius = 0;
    if (unit === 'C') celsius = num;
    if (unit === 'F') celsius = ((num - 32) * 5) / 9;
    if (unit === 'K') celsius = num - 273.15;

    const fahrenheit = (celsius * 9) / 5 + 32;
    const kelvin = celsius + 273.15;

    return {
      celsius: formatNumber(celsius, 2),
      fahrenheit: formatNumber(fahrenheit, 2),
      kelvin: formatNumber(kelvin, 2),
    };
  }, [num, unit]);

  return (
    <div className="space-y-8">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Input Temperature Value</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="sm:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white outline-none focus:border-cyan-500"
          />

          <div className="sm:col-span-4 flex gap-2">
            {[
              { id: 'C', label: 'Celsius (°C)' },
              { id: 'F', label: 'Fahrenheit (°F)' },
              { id: 'K', label: 'Kelvin (K)' },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setUnit(u.id as any)}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold border transition-all ${
                  unit === u.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Temperature Triple Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
            <span>Celsius Scale</span>
            <button
              onClick={() => onCopy(results.celsius, 'temp-c')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'temp-c' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <div className="text-3xl font-mono font-black text-white">{results.celsius} °C</div>
          <div className="text-[11px] text-slate-500 font-mono">0°C = Freezing point of water</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400">
            <span>Fahrenheit Scale</span>
            <button
              onClick={() => onCopy(results.fahrenheit, 'temp-f')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'temp-f' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <div className="text-3xl font-mono font-black text-white">{results.fahrenheit} °F</div>
          <div className="text-[11px] text-slate-500 font-mono">32°F = Freezing point of water</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>Kelvin (Absolute)</span>
            <button
              onClick={() => onCopy(results.kelvin, 'temp-k')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'temp-k' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <div className="text-3xl font-mono font-black text-white">{results.kelvin} K</div>
          <div className="text-[11px] text-slate-500 font-mono">0 K = Absolute Zero (-273.15°C)</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Data Storage Converter (Binary 1024 vs Decimal 1000)
   ========================================================================= */
function DataStorageConverterTool({
  onCopy,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const [val, setVal] = useState<string>('1024');
  const [unit, setUnit] = useState<string>('MB');
  const [standard, setStandard] = useState<'binary' | 'decimal'>('binary');

  const base = standard === 'binary' ? 1024 : 1000;

  const UNITS = [
    { id: 'b', name: 'Bits', symbol: 'b', pow: -1 }, // 1 Byte = 8 bits
    { id: 'B', name: 'Bytes', symbol: 'B', pow: 0 },
    { id: 'KB', name: 'Kilobytes', symbol: 'KB', pow: 1 },
    { id: 'MB', name: 'Megabytes', symbol: 'MB', pow: 2 },
    { id: 'GB', name: 'Gigabytes', symbol: 'GB', pow: 3 },
    { id: 'TB', name: 'Terabytes', symbol: 'TB', pow: 4 },
    { id: 'PB', name: 'Petabytes', symbol: 'PB', pow: 5 },
  ];

  const currentUnit = UNITS.find((u) => u.id === unit) || UNITS[3];
  const num = parseFloat(val) || 0;

  // Convert to base Bytes first
  let bytes = 0;
  if (currentUnit.id === 'b') {
    bytes = num / 8;
  } else {
    bytes = num * Math.pow(base, currentUnit.pow);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div className="md:col-span-7 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Input Storage Quantity</label>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div className="md:col-span-5 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Unit & Standard</label>
          <div className="flex gap-2">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-3 text-xs font-semibold"
            >
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStandard('binary')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  standard === 'binary' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                }`}
                title="1024 Byte factor (RAM / OS)"
              >
                1024
              </button>
              <button
                onClick={() => setStandard('decimal')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  standard === 'decimal' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                }`}
                title="1000 Byte factor (Storage Drives)"
              >
                1000
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {UNITS.map((u) => {
          let converted = 0;
          if (u.id === 'b') {
            converted = bytes * 8;
          } else {
            converted = bytes / Math.pow(base, u.pow);
          }
          const formatted = formatNumber(converted, 6);

          return (
            <div
              key={u.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 font-medium">{u.name}</div>
                <div className="text-sm sm:text-base font-mono font-bold text-cyan-300 mt-0.5">
                  {formatted} <span className="text-slate-500 text-xs font-normal">{u.symbol}</span>
                </div>
              </div>

              <button
                onClick={() => onCopy(formatted, `storage-${u.id}`)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                {copiedKey === `storage-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Fuel Economy Converter
   ========================================================================= */
function FuelEconomyConverterTool({
  onCopy,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const [val, setVal] = useState<string>('30');
  const [unit, setUnit] = useState<'mpg_us' | 'mpg_uk' | 'kml' | 'l100km'>('mpg_us');

  const num = parseFloat(val) || 0;

  const results = useMemo(() => {
    let kml = 0;
    if (num <= 0) return { mpg_us: '0', mpg_uk: '0', kml: '0', l100km: '0' };

    if (unit === 'mpg_us') kml = num * 0.425144;
    if (unit === 'mpg_uk') kml = num * 0.354006;
    if (unit === 'kml') kml = num;
    if (unit === 'l100km') kml = 100 / num;

    const mpg_us = kml / 0.425144;
    const mpg_uk = kml / 0.354006;
    const l100km = 100 / kml;

    return {
      mpg_us: formatNumber(mpg_us, 2),
      mpg_uk: formatNumber(mpg_uk, 2),
      kml: formatNumber(kml, 2),
      l100km: formatNumber(l100km, 2),
    };
  }, [num, unit]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase">Input Fuel Consumption</div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="sm:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white outline-none focus:border-cyan-500"
          />

          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="sm:col-span-5 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl px-4 py-4 text-xs font-semibold outline-none"
          >
            <option value="mpg_us">Miles per Gallon (US MPG)</option>
            <option value="mpg_uk">Miles per Gallon (Imperial UK MPG)</option>
            <option value="kml">Kilometers per Liter (km/L)</option>
            <option value="l100km">Liters per 100km (L/100km)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'US MPG', val: results.mpg_us, unit: 'mpg (US)' },
          { label: 'UK MPG (Imperial)', val: results.mpg_uk, unit: 'mpg (UK)' },
          { label: 'Kilometers per Liter', val: results.kml, unit: 'km/L' },
          { label: 'Liters / 100km', val: results.l100km, unit: 'L/100km' },
        ].map((f, i) => (
          <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>{f.label}</span>
              <button
                onClick={() => onCopy(f.val, `fuel-${i}`)}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === `fuel-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-2xl font-mono font-black text-cyan-300">{f.val}</div>
            <div className="text-[10px] text-slate-500 font-mono">{f.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: 100% Offline Currency Calculator with Manual Rates
   ========================================================================= */
function OfflineCurrencyConverterTool({
  onCopy,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rates, setRates] = useState<Record<string, number>>({
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.5,
    CAD: 1.36,
    AUD: 1.52,
    CHF: 0.91,
    INR: 83.4,
    CNY: 7.24,
    SGD: 1.35,
  });

  const CURRENCY_LIST = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  ];

  const valNum = parseFloat(amount) || 0;
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convert: (Amount / FromRateUSD) * ToRateUSD
  const inUSD = valNum / fromRate;
  const targetAmount = inUSD * toRate;
  const formatted = formatNumber(targetAmount, 2);

  const handleUpdateRate = (code: string, newRate: number) => {
    if (newRate > 0) {
      setRates((prev) => ({ ...prev, [code]: newRate }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>100% Offline Calculator: Rates are editable locally without third-party network APIs.</span>
        </span>
      </div>

      {/* Main Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>From Currency</span>
            <span className="font-mono text-cyan-400">{fromCurrency}</span>
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-black text-white outline-none"
          />

          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center">
          <button
            onClick={() => {
              setFromCurrency(toCurrency);
              setToCurrency(fromCurrency);
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-cyan-500 text-white shadow-lg cursor-pointer"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="md:col-span-5 bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>To Currency</span>
            <button
              onClick={() => onCopy(formatted, 'curr-res')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1"
            >
              {copiedKey === 'curr-res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'curr-res' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 truncate select-all">
            {formatted}
          </div>

          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editable Exchange Rate Matrix (1 USD = X) */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Custom Offline Base Rates (Relative to 1.00 USD)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {CURRENCY_LIST.map((c) => (
            <div key={c.code} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 flex justify-between">
                <span>{c.code}</span>
                <span className="text-slate-600">{c.symbol}</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={rates[c.code] || 1}
                onChange={(e) => handleUpdateRate(c.code, parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-cyan-300 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Scientific SI Unit Converter & Scientific Notation
   ========================================================================= */
function ScientificConverterTool({
  onCopy,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const [val, setVal] = useState<string>('0.00000125');
  const [siPrefix, setSiPrefix] = useState<string>('none');

  const SI_PREFIXES = [
    { prefix: 'exa', symbol: 'E', exp: 18 },
    { prefix: 'peta', symbol: 'P', exp: 15 },
    { prefix: 'tera', symbol: 'T', exp: 12 },
    { prefix: 'giga', symbol: 'G', exp: 9 },
    { prefix: 'mega', symbol: 'M', exp: 6 },
    { prefix: 'kilo', symbol: 'k', exp: 3 },
    { prefix: 'none', symbol: 'base (10⁰)', exp: 0 },
    { prefix: 'milli', symbol: 'm', exp: -3 },
    { prefix: 'micro', symbol: 'µ', exp: -6 },
    { prefix: 'nano', symbol: 'n', exp: -9 },
    { prefix: 'pico', symbol: 'p', exp: -12 },
    { prefix: 'femto', symbol: 'f', exp: -15 },
    { prefix: 'atto', symbol: 'a', exp: -18 },
  ];

  const curPrefix = SI_PREFIXES.find((p) => p.prefix === siPrefix) || SI_PREFIXES[6];
  const num = parseFloat(val) || 0;
  const baseValue = num * Math.pow(10, curPrefix.exp);

  const sciNotation = baseValue.toExponential();
  const engNotation = baseValue.toExponential(3);

  return (
    <div className="space-y-8">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Input Scientific Value</label>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="e.g. 1.25e-5 or 0.0005"
            className="sm:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xl font-mono font-bold text-white outline-none focus:border-cyan-500"
          />

          <select
            value={siPrefix}
            onChange={(e) => setSiPrefix(e.target.value)}
            className="sm:col-span-4 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl px-4 py-4 text-xs font-semibold outline-none"
          >
            {SI_PREFIXES.map((p) => (
              <option key={p.prefix} value={p.prefix}>
                {p.prefix} ({p.symbol}) [10^{p.exp}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scientific Formats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Standard Scientific Notation</span>
            <button onClick={() => onCopy(sciNotation, 'sci-std')} className="text-cyan-400">
              {copiedKey === 'sci-std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-cyan-300 break-all select-all">
            {sciNotation}
          </div>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Base SI Unit (10⁰)</span>
            <button onClick={() => onCopy(formatNumber(baseValue, 8), 'sci-base')} className="text-cyan-400">
              {copiedKey === 'sci-base' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-white break-all select-all">
            {formatNumber(baseValue, 8)}
          </div>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Engineering Form</span>
            <button onClick={() => onCopy(engNotation, 'sci-eng')} className="text-cyan-400">
              {copiedKey === 'sci-eng' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 break-all select-all">
            {engNotation}
          </div>
        </div>
      </div>
    </div>
  );
}
