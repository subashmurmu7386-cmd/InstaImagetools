import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Dices,
  User,
  Hash,
  Type,
  Smile,
  Lock,
  Coins,
  Palette,
  Quote,
  Sparkles,
  Globe,
  MapPin,
  Flame,
  Utensils,
  Film,
  BookOpen,
  Trophy,
  Disc,
  Gift,
  Users,
  Copy,
  Check,
  Search,
  RefreshCw,
  Play,
  RotateCcw,
  Volume2,
  ShieldCheck,
  Plus,
  Trash2,
  ListOrdered,
  Shuffle,
} from 'lucide-react';

export type RandomToolId =
  | 'random-name'
  | 'random-number'
  | 'random-letter'
  | 'random-emoji'
  | 'random-password'
  | 'dice-roller'
  | 'coin-flip'
  | 'random-color'
  | 'random-quote'
  | 'random-fact'
  | 'random-country'
  | 'random-city'
  | 'random-animal'
  | 'random-food'
  | 'random-movie'
  | 'random-book'
  | 'random-challenge'
  | 'decision-wheel'
  | 'lucky-draw'
  | 'team-generator';

export interface RandomToolMeta {
  id: RandomToolId;
  name: string;
  category: 'core' | 'games-chance' | 'discovery' | 'pickers-teams';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const RANDOM_TOOLS_META: RandomToolMeta[] = [
  {
    id: 'random-name',
    name: 'Random Name',
    category: 'core',
    categoryLabel: 'Core Generators',
    description: 'Generate first names, last names, or full names with gender filters.',
    icon: User,
    badge: 'Popular',
  },
  {
    id: 'random-number',
    name: 'Random Number Range',
    category: 'core',
    categoryLabel: 'Core Generators',
    description: 'Generate random numbers with min/max range, quantity count, and duplicate controls.',
    icon: Hash,
  },
  {
    id: 'random-letter',
    name: 'Random Letters',
    category: 'core',
    categoryLabel: 'Core Generators',
    description: 'Generate random uppercase, lowercase, or mixed alphabetic characters.',
    icon: Type,
  },
  {
    id: 'random-emoji',
    name: 'Random Emoji Picker',
    category: 'core',
    categoryLabel: 'Core Generators',
    description: 'Pick random emojis categorized by smileys, animals, food, and activities.',
    icon: Smile,
  },
  {
    id: 'random-password',
    name: 'Secure Password',
    category: 'core',
    categoryLabel: 'Core Generators',
    description: 'Generate cryptographically strong passwords with custom character sets.',
    icon: Lock,
    badge: 'Crypto',
  },
  {
    id: 'dice-roller',
    name: 'Animated Dice Roller',
    category: 'games-chance',
    categoryLabel: 'Games & Chance',
    description: 'Roll 1-6 animated dice with d4, d6, d8, d10, d12, and d20 RPG polyhedral support.',
    icon: Dices,
    badge: 'Animated',
  },
  {
    id: 'coin-flip',
    name: 'Interactive Coin Toss',
    category: 'games-chance',
    categoryLabel: 'Games & Chance',
    description: '3D animated heads or tails coin toss with streak counters and probability statistics.',
    icon: Coins,
  },
  {
    id: 'random-color',
    name: 'Random Color & Palette',
    category: 'games-chance',
    categoryLabel: 'Games & Chance',
    description: 'Generate random HEX, RGB, and HSL colors with instant visual card preview.',
    icon: Palette,
  },
  {
    id: 'decision-wheel',
    name: 'Decision Spinner Wheel',
    category: 'games-chance',
    categoryLabel: 'Games & Chance',
    description: 'Interactive HTML5 canvas wheel to spin and make decisions with custom choices.',
    icon: Disc,
    badge: 'Canvas Physics',
  },
  {
    id: 'lucky-draw',
    name: 'Lucky Draw Picker',
    category: 'pickers-teams',
    categoryLabel: 'Pickers & Groups',
    description: 'Pick 1 or multiple random winners from a custom list with celebration animations.',
    icon: Gift,
  },
  {
    id: 'team-generator',
    name: 'Team Randomizer',
    category: 'pickers-teams',
    categoryLabel: 'Pickers & Groups',
    description: 'Evenly split names or players into balanced randomized custom teams.',
    icon: Users,
    badge: 'Organizer',
  },
  {
    id: 'random-quote',
    name: 'Random Wisdom Quote',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Curated offline library of inspirational, tech, and philosophical quotes.',
    icon: Quote,
  },
  {
    id: 'random-fact',
    name: 'Random Science & Trivia Fact',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Interesting trivia, science, nature, and history facts from an offline encyclopedia.',
    icon: Sparkles,
  },
  {
    id: 'random-country',
    name: 'Random Country',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Pick world countries with capitals, continents, flag emojis, and populations.',
    icon: Globe,
  },
  {
    id: 'random-city',
    name: 'Random Global City',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Discover major world cities, their country, continent, and famous landmarks.',
    icon: MapPin,
  },
  {
    id: 'random-animal',
    name: 'Random Animal',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Generate random animals categorized by mammals, birds, marine, and reptiles.',
    icon: Flame,
  },
  {
    id: 'random-food',
    name: 'Random Meal & Food',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Suggest delicious random dishes, cuisines, and snack ideas for breakfast/lunch/dinner.',
    icon: Utensils,
  },
  {
    id: 'random-movie',
    name: 'Random Movie Picker',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Filter and discover top-rated movies across genres and release decades.',
    icon: Film,
  },
  {
    id: 'random-book',
    name: 'Random Book Recommendation',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Discover classic and modern must-read books across varied genres.',
    icon: BookOpen,
  },
  {
    id: 'random-challenge',
    name: 'Daily Challenge Generator',
    category: 'discovery',
    categoryLabel: 'Discovery & Trivia',
    description: 'Fun mini-challenges spanning fitness, creativity, productivity, and coding.',
    icon: Trophy,
  },
];

/* =========================================================================
   OFFLINE DATASETS FOR RANDOM GENERATORS
   ========================================================================= */

const FIRST_NAMES_MALE = [
  'Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore',
  'Mateo', 'Levi', 'Sebastian', 'Daniel', 'Jack', 'Alexander', 'Owen', 'Asher', 'Samuel', 'Ethan',
  'Leo', 'Jackson', 'Mason', 'Ezra', 'John', 'Hudson', 'Luca', 'David', 'Joseph', 'Julian',
];

const FIRST_NAMES_FEMALE = [
  'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Evelyn', 'Luna',
  'Harper', 'Camila', 'Sofia', 'Scarlett', 'Elizabeth', 'Eleanor', 'Emily', 'Chloe', 'Mila', 'Violet',
  'Penelope', 'Gianna', 'Aria', 'Abigail', 'Ella', 'Avery', 'Hazel', 'Nora', 'Layla', 'Lily',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
];

const QUOTES_DATABASE = [
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman', tag: 'Tech' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', tag: 'Inspirational' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck', tag: 'Coding' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', tag: 'Wisdom' },
  { text: 'Code is like humor. When you have to explain it, it’s bad.', author: 'Cory House', tag: 'Tech' },
  { text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', author: 'Antoine de Saint-Exupéry', tag: 'Design' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', tag: 'Coding' },
  { text: 'The best error message is the one that never shows up.', author: 'Thomas Fuchs', tag: 'UX' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela', tag: 'Inspirational' },
  { text: 'Knowledge is power.', author: 'Francis Bacon', tag: 'Philosophy' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds', tag: 'Tech' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James', tag: 'Inspirational' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson', tag: 'Coding' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt', tag: 'Wisdom' },
  { text: 'Stay hungry, stay foolish.', author: 'Whole Earth Catalog', tag: 'Inspirational' },
];

const FACTS_DATABASE = [
  { fact: 'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.', tag: 'Science' },
  { fact: 'Octopuses have three hearts, nine brains, and blue copper-based blood.', tag: 'Nature' },
  { fact: 'The first computer mouse was invented in 1964 by Douglas Engelbart and made out of wood.', tag: 'Tech' },
  { fact: 'Bananas are berries botanically, but strawberries are not!', tag: 'Biology' },
  { fact: 'Sound travels about 4.3 times faster in water than in air.', tag: 'Physics' },
  { fact: 'A day on Venus is longer than a year on Venus.', tag: 'Space' },
  { fact: 'The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion of the iron.', tag: 'Engineering' },
  { fact: 'There are more possible iterations of a game of chess than there are atoms in the known observable universe.', tag: 'Math' },
  { fact: 'Wombat cubes: Wombats are the only known animals whose feces are cube-shaped.', tag: 'Nature' },
  { fact: 'The JavaScript programming language was originally created in just 10 days by Brendan Eich in May 1995.', tag: 'Tech' },
  { fact: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.', tag: 'History' },
  { fact: 'Hot water freezes faster than cold water under certain circumstances, a phenomenon known as the Mpemba effect.', tag: 'Physics' },
];

const COUNTRIES_DATABASE = [
  { name: 'Japan', capital: 'Tokyo', continent: 'Asia', flag: '🇯🇵', pop: '125M' },
  { name: 'Norway', capital: 'Oslo', continent: 'Europe', flag: '🇳🇴', pop: '5.4M' },
  { name: 'Brazil', capital: 'Brasília', continent: 'South America', flag: '🇧🇷', pop: '214M' },
  { name: 'Canada', capital: 'Ottawa', continent: 'North America', flag: '🇨🇦', pop: '38M' },
  { name: 'Australia', capital: 'Canberra', continent: 'Oceania', flag: '🇦🇺', pop: '26M' },
  { name: 'Egypt', capital: 'Cairo', continent: 'Africa', flag: '🇪🇬', pop: '104M' },
  { name: 'Germany', capital: 'Berlin', continent: 'Europe', flag: '🇩🇪', pop: '84M' },
  { name: 'India', capital: 'New Delhi', continent: 'Asia', flag: '🇮🇳', pop: '1.4B' },
  { name: 'South Korea', capital: 'Seoul', continent: 'Asia', flag: '🇰🇷', pop: '51M' },
  { name: 'Iceland', capital: 'Reykjavik', continent: 'Europe', flag: '🇮🇸', pop: '375K' },
  { name: 'Italy', capital: 'Rome', continent: 'Europe', flag: '🇮🇹', pop: '59M' },
  { name: 'New Zealand', capital: 'Wellington', continent: 'Oceania', flag: '🇳🇿', pop: '5.1M' },
  { name: 'Switzerland', capital: 'Bern', continent: 'Europe', flag: '🇨🇭', pop: '8.7M' },
  { name: 'Mexico', capital: 'Mexico City', continent: 'North America', flag: '🇲🇽', pop: '128M' },
  { name: 'Singapore', capital: 'Singapore', continent: 'Asia', flag: '🇸🇬', pop: '5.6M' },
];

const CITIES_DATABASE = [
  { city: 'Kyoto', country: 'Japan', continent: 'Asia', landmark: 'Fushimi Inari Shrine' },
  { city: 'Amsterdam', country: 'Netherlands', continent: 'Europe', landmark: 'Canal Ring' },
  { city: 'San Francisco', country: 'United States', continent: 'North America', landmark: 'Golden Gate Bridge' },
  { city: 'Cape Town', country: 'South Africa', continent: 'Africa', landmark: 'Table Mountain' },
  { city: 'Sydney', country: 'Australia', continent: 'Oceania', landmark: 'Sydney Opera House' },
  { city: 'Barcelona', country: 'Spain', continent: 'Europe', landmark: 'Sagrada Família' },
  { city: 'Vancouver', country: 'Canada', continent: 'North America', landmark: 'Stanley Park' },
  { city: 'Buenos Aires', country: 'Argentina', continent: 'South America', landmark: 'Teatro Colón' },
  { city: 'Seoul', country: 'South Korea', continent: 'Asia', landmark: 'Gyeongbokgung Palace' },
  { city: 'Prague', country: 'Czech Republic', continent: 'Europe', landmark: 'Charles Bridge' },
  { city: 'Reykjavik', country: 'Iceland', continent: 'Europe', landmark: 'Hallgrímskirkja' },
  { city: 'Dubai', country: 'United Arab Emirates', continent: 'Asia', landmark: 'Burj Khalifa' },
];

const ANIMALS_DATABASE = [
  { name: 'Snow Leopard', category: 'Mammal', emoji: '🐆', habitat: 'Central Asian Mountains' },
  { name: 'Peregrine Falcon', category: 'Bird', emoji: '🦅', habitat: 'Worldwide cliffs & skies' },
  { name: 'Giant Manta Ray', category: 'Aquatic', emoji: '🐟', habitat: 'Tropical oceans' },
  { name: 'Chameleon', category: 'Reptile', emoji: '🦎', habitat: 'Madagascar & rainforests' },
  { name: 'Red Panda', category: 'Mammal', emoji: '🐼', habitat: 'Eastern Himalayas' },
  { name: 'Emperor Penguin', category: 'Bird', emoji: '🐧', habitat: 'Antarctica' },
  { name: 'Blue Whale', category: 'Aquatic', emoji: '🐋', habitat: 'Global open oceans' },
  { name: 'Monarch Butterfly', category: 'Insect', emoji: '🦋', habitat: 'North America' },
  { name: 'Axolotl', category: 'Amphibian', emoji: '🦎', habitat: 'Lake Xochimilco, Mexico' },
  { name: 'Arctic Fox', category: 'Mammal', emoji: '🦊', habitat: 'Arctic tundra' },
];

const FOOD_DATABASE = [
  { name: 'Wood-fired Margherita Pizza', cuisine: 'Italian', type: 'Dinner', icon: '🍕' },
  { name: 'Salmon Nigiri & Dragon Roll', cuisine: 'Japanese', type: 'Dinner', icon: '🍣' },
  { name: 'Street Tacos al Pastor', cuisine: 'Mexican', type: 'Lunch/Dinner', icon: '🌮' },
  { name: 'Butter Chicken with Garlic Naan', cuisine: 'Indian', type: 'Dinner', icon: '🍛' },
  { name: 'Avocado Toast with Poached Egg', cuisine: 'Cafe / Healthy', type: 'Breakfast', icon: '🥑' },
  { name: 'Vietnamese Beef Pho', cuisine: 'Vietnamese', type: 'Lunch', icon: '🍜' },
  { name: 'Greek Salad with Feta & Olives', cuisine: 'Mediterranean', type: 'Lunch', icon: '🥗' },
  { name: 'Classic Smash Burger & Truffle Fries', cuisine: 'American', type: 'Dinner', icon: '🍔' },
  { name: 'Matcha Green Tea Crepe Cake', cuisine: 'Dessert', type: 'Sweet Snack', icon: '🍰' },
  { name: 'Falafel Wrap with Tahini & Pickles', cuisine: 'Middle Eastern', type: 'Lunch', icon: '🥙' },
];

const MOVIES_DATABASE = [
  { title: 'Interstellar', year: 2014, genre: 'Sci-Fi', director: 'Christopher Nolan' },
  { title: 'Spirited Away', year: 2001, genre: 'Animation', director: 'Hayao Miyazaki' },
  { title: 'Inception', year: 2010, genre: 'Sci-Fi / Action', director: 'Christopher Nolan' },
  { title: 'The Grand Budapest Hotel', year: 2014, genre: 'Comedy / Drama', director: 'Wes Anderson' },
  { title: 'Pulp Fiction', year: 1994, genre: 'Crime / Drama', director: 'Quentin Tarantino' },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, genre: 'Animation / Superhero', director: 'Bob Persichetti' },
  { title: 'Parasite', year: 2019, genre: 'Thriller / Drama', director: 'Bong Joon-ho' },
  { title: 'Whiplash', year: 2014, genre: 'Drama / Music', director: 'Damien Chazelle' },
  { title: 'The Matrix', year: 1999, genre: 'Sci-Fi / Action', director: 'The Wachowskis' },
  { title: 'WALL-E', year: 2008, genre: 'Animation / Sci-Fi', director: 'Andrew Stanton' },
];

const BOOKS_DATABASE = [
  { title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'Sci-Fi Masterpiece' },
  { title: '1984', author: 'George Orwell', year: 1949, genre: 'Dystopian Classic' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'High Fantasy' },
  { title: 'Atomic Habits', author: 'James Clear', year: 2018, genre: 'Self-Improvement' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960, genre: 'Literary Classic' },
  { title: 'The Pragmatic Programmer', author: 'Andy Hunt & Dave Thomas', year: 1999, genre: 'Software Craft' },
  { title: 'Project Hail Mary', author: 'Andy Weir', year: 2021, genre: 'Hard Sci-Fi' },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', year: 2011, genre: 'History & Science' },
  { title: 'The Alchemist', author: 'Paulo Coelho', year: 1988, genre: 'Philosophical Fiction' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', year: 2017, genre: 'Computer Science' },
];

const CHALLENGES_DATABASE = [
  { title: '15-Minute Micro-Workout', description: 'Do 3 sets of 20 push-ups, 30 bodyweight squats, and a 60-second plank.', category: 'Fitness' },
  { title: 'Digital Declutter Sprint', description: 'Clean out 20 unneeded files from your Downloads folder or desktop.', category: 'Productivity' },
  { title: 'Hydration Challenge', description: 'Drink 2 full glasses of clean water and stretch your neck and back.', category: 'Wellness' },
  { title: 'One-Function Code Refactor', description: 'Take a messy piece of code and refactor it into clean, pure functional helpers.', category: 'Coding' },
  { title: 'Gratitude Message', description: 'Send a genuine 2-sentence appreciation message to a friend, colleague, or mentor.', category: 'Social' },
  { title: 'Learn 1 New Concept', description: 'Read a short technical documentation page or Wikipedia article about a topic you know nothing about.', category: 'Learning' },
];

/* Helper to get cryptographically random integer in range [min, max] */
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) return min;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
}

export function RandomGeneratorToolsSuite() {
  const [activeTool, setActiveTool] = useState<RandomToolId>('random-name');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = RANDOM_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Random Generator';
      const preview = text.length > 50 ? `${text.slice(0, 50)}...` : text;
      logActivity(toolName, `Generated & copied: ${preview}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return RANDOM_TOOLS_META.filter((tool) => {
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
    RANDOM_TOOLS_META.find((t) => t.id === activeTool) || RANDOM_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="random-generator-suite-root">
      {/* 20 Tools Dashboard Switcher */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500" />
                Random Generator Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                20 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Random names, numbers, passwords, animated dice, coin toss, decision wheel, lucky draw, teams & trivia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 20 random tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-pink-500 font-sans"
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
                { id: 'core', label: 'Core Generators' },
                { id: 'games-chance', label: 'Games & Chance' },
                { id: 'pickers-teams', label: 'Pickers & Teams' },
                { id: 'discovery', label: 'Discovery' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 20 Tools Multi-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  document.getElementById('active-random-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-600/30 to-amber-500/20 border-pink-400/50 shadow-md shadow-pink-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-500 to-amber-500 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-pink-400 group-hover:text-pink-300'
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
      <div id="active-random-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 p-[1.5px] shadow-lg shadow-pink-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Cryptographic Local RNG</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'random-name' && <RandomNameTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-number' && <RandomNumberTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-letter' && <RandomLetterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-emoji' && <RandomEmojiTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-password' && <RandomPasswordTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'dice-roller' && <DiceRollerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'coin-flip' && <CoinFlipTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-color' && <RandomColorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'decision-wheel' && <DecisionWheelTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'lucky-draw' && <LuckyDrawTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'team-generator' && <TeamGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-quote' && <RandomQuoteTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-fact' && <RandomFactTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-country' && <RandomCountryTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-city' && <RandomCityTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-animal' && <RandomAnimalTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-food' && <RandomFoodTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-movie' && <RandomMovieTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-book' && <RandomBookTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-challenge' && <RandomChallengeTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: Random Name Generator
   ========================================================================= */
function RandomNameTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any');
  const [format, setFormat] = useState<'full' | 'first' | 'last'>('full');
  const [count, setCount] = useState<number>(5);
  const [names, setNames] = useState<string[]>([]);

  const generateNames = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let pool = gender === 'male' ? FIRST_NAMES_MALE : gender === 'female' ? FIRST_NAMES_FEMALE : [...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE];
      const f = pool[getSecureRandomInt(0, pool.length - 1)];
      const l = LAST_NAMES[getSecureRandomInt(0, LAST_NAMES.length - 1)];
      if (format === 'first') list.push(f);
      else if (format === 'last') list.push(l);
      else list.push(`${f} ${l}`);
    }
    setNames(list);
  }, [gender, format, count]);

  useEffect(() => {
    generateNames();
  }, [generateNames]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['any', 'male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${gender === g ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400'}`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['full', 'first', 'last'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${format === fmt ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400'}`}
              >
                {fmt} Name
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Count:</span>
            <input
              type="number"
              min="1"
              max="25"
              value={count}
              onChange={(e) => setCount(Math.min(25, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
            />
          </div>
        </div>

        <button
          onClick={generateNames}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {names.map((name, idx) => (
          <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-sm font-bold text-white">{name}</span>
            <button onClick={() => onCopy(name, `name-${idx}`)} className="text-slate-400 hover:text-white p-1">
              {copiedKey === `name-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2: Random Number Generator
   ========================================================================= */
function RandomNumberTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(5);
  const [unique, setUnique] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<number[]>([]);

  const generateNumbers = useCallback(() => {
    const list: number[] = [];
    const availableRange = max - min + 1;
    if (unique && quantity > availableRange) {
      setUnique(false);
    }
    const set = new Set<number>();
    while (list.length < quantity) {
      const n = getSecureRandomInt(min, max);
      if (unique) {
        if (!set.has(n)) {
          set.add(n);
          list.push(n);
        }
      } else {
        list.push(n);
      }
    }
    setNumbers(list);
  }, [min, max, quantity, unique]);

  useEffect(() => {
    generateNumbers();
  }, [generateNumbers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Min:</span>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value) || 0)}
              className="w-20 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Max:</span>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value) || 100)}
              className="w-20 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Count:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-pink-500"
            />
            <span>No Duplicates</span>
          </label>
        </div>

        <button
          onClick={generateNumbers}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Roll Numbers</span>
        </button>
      </div>

      <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Generated Numbers ({numbers.length})</span>
          <button
            onClick={() => onCopy(numbers.join(', '), 'num-all')}
            className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
          >
            {copiedKey === 'num-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All CSV</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {numbers.map((n, idx) => (
            <div
              key={idx}
              className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-lg font-black text-amber-300 shadow-sm flex items-center gap-2"
            >
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: Random Letters Generator
   ========================================================================= */
function RandomLetterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [caseType, setCaseType] = useState<'upper' | 'lower' | 'mixed'>('upper');
  const [count, setCount] = useState<number>(8);
  const [letters, setLetters] = useState<string[]>([]);

  const generateLetters = useCallback(() => {
    const list: string[] = [];
    const upperAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerAlpha = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < count; i++) {
      let pool = caseType === 'upper' ? upperAlpha : caseType === 'lower' ? lowerAlpha : upperAlpha + lowerAlpha;
      list.push(pool[getSecureRandomInt(0, pool.length - 1)]);
    }
    setLetters(list);
  }, [caseType, count]);

  useEffect(() => {
    generateLetters();
  }, [generateLetters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['upper', 'lower', 'mixed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCaseType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${caseType === t ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400'}`}
              >
                {t}case
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Count:</span>
            <input
              type="number"
              min="1"
              max="30"
              value={count}
              onChange={(e) => setCount(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
            />
          </div>
        </div>

        <button
          onClick={generateLetters}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Pick Letters</span>
        </button>
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-wrap justify-center gap-3">
        {letters.map((char, idx) => (
          <div
            key={idx}
            className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center font-mono text-2xl font-black text-pink-300 shadow-md"
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Random Emoji Picker
   ========================================================================= */
const EMOJI_POOLS: Record<string, string[]> = {
  smileys: ['😀', '😎', '🥳', '🤩', '🚀', '🔥', '✨', '⚡', '🎉', '💡', '🌈', '💎'],
  animals: ['🐶', '🐱', '🦊', '🦁', '🐼', '🐨', '🦄', '🦅', '🐬', '🐙', '🦖', '🦋'],
  food: ['🍕', '🍔', '🍟', '🍣', '🌮', '🍩', '🥑', '🍓', '🍜', '☕', '🍦', '🥞'],
  activities: ['⚽', '🏀', '🎮', '🎸', '🎨', '🎯', '🏄‍♂️', '🚴‍♀️', '🏆', '🎪', '🎲', '🎤'],
};

function RandomEmojiTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [category, setCategory] = useState<string>('all');
  const [picked, setPicked] = useState<string>('🚀');

  const pickRandomEmoji = useCallback(() => {
    const pool = category === 'all' ? Object.values(EMOJI_POOLS).flat() : EMOJI_POOLS[category] || EMOJI_POOLS.smileys;
    setPicked(pool[getSecureRandomInt(0, pool.length - 1)]);
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['all', 'smileys', 'animals', 'food', 'activities'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${category === cat ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={pickRandomEmoji}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Pick Emoji</span>
        </button>
      </div>

      <div className="p-12 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4">
        <div className="text-7xl sm:text-8xl select-all filter drop-shadow-2xl animate-bounce">
          {picked}
        </div>
        <button
          onClick={() => onCopy(picked, 'emoji-copy')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2"
        >
          {copiedKey === 'emoji-copy' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>Copy Emoji</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: Secure Random Password Generator
   ========================================================================= */
function RandomPasswordTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');

  const generatePassword = useCallback(() => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars[getSecureRandomInt(0, chars.length - 1)];
    }
    setPassword(res);
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Generated Password</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">128-bit Cryptographic Entropy</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
          <span className="font-mono text-lg font-black text-pink-300 select-all tracking-wider break-all">
            {password}
          </span>
          <button
            onClick={() => onCopy(password, 'pwd-gen')}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white shrink-0 ml-2"
          >
            {copiedKey === 'pwd-gen' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Length: {length}</span>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value) || 16)}
            className="w-32 accent-pink-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: 'A-Z', state: useUpper, set: setUseUpper },
            { label: 'a-z', state: useLower, set: setUseLower },
            { label: '0-9', state: useNumbers, set: setUseNumbers },
            { label: '!@#', state: useSymbols, set: setUseSymbols },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.set(e.target.checked)}
                className="rounded bg-slate-900 border-slate-800 text-pink-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={generatePassword}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Password</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Animated Dice Roller (d4, d6, d8, d10, d12, d20)
   ========================================================================= */
function DiceRollerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [sides, setSides] = useState<number>(6);
  const [diceCount, setDiceCount] = useState<number>(2);
  const [results, setResults] = useState<number[]>([4, 6]);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const list = [];
      for (let i = 0; i < diceCount; i++) {
        list.push(getSecureRandomInt(1, sides));
      }
      setResults(list);
      setIsRolling(false);
    }, 400);
  };

  const totalSum = results.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[4, 6, 8, 10, 12, 20].map((d) => (
              <button
                key={d}
                onClick={() => setSides(d)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${sides === d ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400'}`}
              >
                d{d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Dice Count:</span>
            <input
              type="number"
              min="1"
              max="6"
              value={diceCount}
              onChange={(e) => setDiceCount(Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
            />
          </div>
        </div>

        <button
          onClick={rollDice}
          disabled={isRolling}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20"
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>Roll Dice!</span>
        </button>
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-6">
        <div className="flex flex-wrap justify-center gap-4">
          {results.map((val, idx) => (
            <div
              key={idx}
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-pink-500/30 shadow-xl flex flex-col items-center justify-center transition-transform ${
                isRolling ? 'rotate-45 scale-90' : 'scale-100'
              }`}
            >
              <span className="text-xs text-slate-500 font-bold">d{sides}</span>
              <span className="font-mono text-3xl font-black text-amber-300">{val}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <span className="text-xs text-slate-400 uppercase font-bold">Total Roll Sum</span>
          <div className="text-3xl font-black text-white font-mono">{totalSum}</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Interactive Coin Toss (3D Flipping Animation)
   ========================================================================= */
function CoinFlipTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [result, setResult] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [headsCount, setHeadsCount] = useState<number>(0);
  const [tailsCount, setTailsCount] = useState<number>(0);

  const flipCoin = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const next = getSecureRandomInt(0, 1) === 0 ? 'heads' : 'tails';
      setResult(next);
      if (next === 'heads') setHeadsCount((c) => c + 1);
      else setTailsCount((c) => c + 1);
      setIsFlipping(false);
    }, 600);
  };

  const total = headsCount + tailsCount;

  return (
    <div className="space-y-6">
      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-6">
        {/* Animated Coin */}
        <div
          onClick={!isFlipping ? flipCoin : undefined}
          className={`w-32 h-32 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1.5 shadow-2xl shadow-amber-500/20 cursor-pointer transition-transform duration-500 ${
            isFlipping ? 'scale-110 rotate-[720deg]' : 'hover:scale-105'
          }`}
        >
          <div className="w-full h-full rounded-full bg-slate-950 border border-amber-400/40 flex flex-col items-center justify-center text-amber-300">
            <Coins className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-sm font-black uppercase tracking-widest">{result}</span>
          </div>
        </div>

        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>Flip Coin</span>
        </button>

        {/* History Stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-800 text-xs">
          <div className="text-center">
            <span className="text-slate-400 block font-semibold">Heads</span>
            <span className="font-mono text-amber-300 font-bold text-base">{headsCount}</span>
          </div>
          <div className="text-center">
            <span className="text-slate-400 block font-semibold">Tails</span>
            <span className="font-mono text-amber-300 font-bold text-base">{tailsCount}</span>
          </div>
          <div className="text-center">
            <span className="text-slate-400 block font-semibold">Total Tosses</span>
            <span className="font-mono text-white font-bold text-base">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: Random Color & Palette Generator
   ========================================================================= */
function RandomColorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [color, setColor] = useState<string>('#ec4899');
  const [palette, setPalette] = useState<string[]>(['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4']);

  const generateColor = useCallback(() => {
    const randomHex = () =>
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    const main = randomHex();
    setColor(main);
    setPalette([main, randomHex(), randomHex(), randomHex(), randomHex()]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase">Primary Random Color</span>
        <button
          onClick={generateColor}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Palette</span>
        </button>
      </div>

      <div
        className="h-36 rounded-3xl p-6 flex flex-col justify-end shadow-2xl transition-colors duration-300"
        style={{ backgroundColor: color }}
      >
        <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl w-fit flex items-center gap-3">
          <span className="font-mono font-bold text-white text-sm">{color}</span>
          <button onClick={() => onCopy(color, 'color-hex')} className="text-slate-300 hover:text-white">
            {copiedKey === 'color-hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Harmonious 5-Color Swatch</span>
        <div className="grid grid-cols-5 gap-2">
          {palette.map((c, i) => (
            <div key={i} className="space-y-1.5 text-center">
              <div className="h-16 rounded-2xl shadow" style={{ backgroundColor: c }} />
              <span className="text-[10px] font-mono text-slate-400 block">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Decision Spinner Wheel (HTML5 Canvas)
   ========================================================================= */
function DecisionWheelTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [items, setItems] = useState<string[]>(['Pizza', 'Burgers', 'Sushi', 'Tacos', 'Salad', 'Pasta']);
  const [newItem, setNewItem] = useState<string>('');
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);

  const colors = ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e', '#6366f1'];

  const drawWheel = useCallback((angleOffset: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const arc = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, width, height);

    items.forEach((item, i) => {
      const angle = angleOffset + i * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(width / 2, height / 2);
      ctx.arc(width / 2, height / 2, radius, angle, angle + arc);
      ctx.lineTo(width / 2, height / 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(item, radius - 15, 4);
      ctx.restore();
    });

    // Center pin
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [items]);

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  const spinWheel = () => {
    if (isSpinning || items.length < 2) return;
    setIsSpinning(true);
    setWinner(null);

    const spinDuration = 3000;
    const startAngle = currentAngleRef.current;
    const totalRotation = Math.PI * 2 * 6 + Math.random() * Math.PI * 2;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / spinDuration);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + totalRotation * easeOut;
      currentAngleRef.current = current;
      drawWheel(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const arc = (2 * Math.PI) / items.length;
        const normalizedAngle = (2 * Math.PI - (current % (2 * Math.PI))) % (2 * Math.PI);
        const winningIndex = Math.floor(normalizedAngle / arc) % items.length;
        setWinner(items[winningIndex]);
      }
    }

    requestAnimationFrame(animate);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem('');
  };

  const removeItem = (idx: number) => {
    if (items.length <= 2) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Canvas Spinner Area */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4 relative">
        {/* Pointer Triangle */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[16px] border-r-amber-400 z-10 filter drop-shadow" />

        <canvas ref={canvasRef} width={260} height={260} className="rounded-full shadow-2xl" />

        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Disc className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : 'Spin the Wheel!'}</span>
        </button>

        {winner && (
          <div className="p-3 bg-pink-500/10 border border-pink-500/40 rounded-xl text-center">
            <span className="text-xs text-pink-300 font-bold">Selected Winner:</span>
            <div className="text-xl font-black text-amber-300">{winner}</div>
          </div>
        )}
      </div>

      {/* Choices Editor */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new choice..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
          />
          <button onClick={addItem} className="px-3 py-1.5 bg-pink-500 text-white rounded-xl text-xs font-bold">
            Add
          </button>
        </div>

        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-slate-900 rounded-xl text-xs text-slate-200">
              <span>{item}</span>
              {items.length > 2 && (
                <button onClick={() => removeItem(idx)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 10: Lucky Draw Winner Picker
   ========================================================================= */
function LuckyDrawTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [namesText, setNamesText] = useState<string>('Alex\nSophia\nLiam\nEmma\nNoah\nOlivia\nJames\nLucas');
  const [winnersCount, setWinnersCount] = useState<number>(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState<boolean>(false);

  const drawWinners = () => {
    const list = namesText.split('\n').map((n) => n.trim()).filter(Boolean);
    if (!list.length) return;
    setIsPicking(true);
    setTimeout(() => {
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      setWinners(shuffled.slice(0, Math.min(winnersCount, list.length)));
      setIsPicking(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Participants (1 per line)</label>
          <textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            rows={8}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-white outline-none focus:border-pink-500"
          />
        </div>

        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Winners to pick:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={winnersCount}
                onChange={(e) => setWinnersCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
              />
            </div>

            {winners.length > 0 && (
              <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lucky Winners!</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {winners.map((w, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-900 border border-pink-500/40 rounded-xl text-amber-300 font-black text-sm">
                      🎉 {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={drawWinners}
            disabled={isPicking}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <Gift className="w-4 h-4" />
            <span>{isPicking ? 'Drawing...' : 'Draw Lucky Winners'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Team Generator
   ========================================================================= */
function TeamGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [playersText, setPlayersText] = useState<string>('Alex\nSophia\nLiam\nEmma\nNoah\nOlivia\nJames\nLucas\nBenjamin\nMia');
  const [teamCount, setTeamCount] = useState<number>(2);
  const [teams, setTeams] = useState<string[][]>([]);

  const splitTeams = useCallback(() => {
    const list = playersText.split('\n').map((p) => p.trim()).filter(Boolean);
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    const res: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((player, idx) => {
      res[idx % teamCount].push(player);
    });
    setTeams(res);
  }, [playersText, teamCount]);

  useEffect(() => {
    splitTeams();
  }, [splitTeams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Number of Teams:</span>
          <input
            type="number"
            min="2"
            max="10"
            value={teamCount}
            onChange={(e) => setTeamCount(Math.min(10, Math.max(2, parseInt(e.target.value) || 2)))}
            className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-pink-300 font-bold text-xs"
          />
        </div>

        <button
          onClick={splitTeams}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Reshuffle Teams</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, idx) => (
          <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
              Team {idx + 1} ({team.length} players)
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {team.map((member, mIdx) => (
                <li key={mIdx} className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{member}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12, 13, 14, 15, 16, 17, 18, 19, 20: Trivia, Quotes, Facts & Pickers
   ========================================================================= */
function RandomQuoteTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [quote, setQuote] = useState(QUOTES_DATABASE[0]);
  const pick = () => setQuote(QUOTES_DATABASE[getSecureRandomInt(0, QUOTES_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl space-y-6 text-center">
      <Quote className="w-8 h-8 text-pink-400 mx-auto opacity-60" />
      <blockquote className="text-lg sm:text-xl font-bold text-white max-w-xl mx-auto leading-relaxed">
        "{quote.text}"
      </blockquote>
      <div className="text-xs font-mono text-amber-300 font-bold">— {quote.author} ({quote.tag})</div>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow hover:bg-pink-400">
        New Quote
      </button>
    </div>
  );
}

function RandomFactTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [fact, setFact] = useState(FACTS_DATABASE[0]);
  const pick = () => setFact(FACTS_DATABASE[getSecureRandomInt(0, FACTS_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl space-y-6 text-center">
      <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
      <p className="text-base sm:text-lg text-slate-200 max-w-xl mx-auto leading-relaxed font-medium">
        {fact.fact}
      </p>
      <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold">
        {fact.tag} Trivia
      </span>
      <div>
        <button onClick={pick} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow">
          Random Fact
        </button>
      </div>
    </div>
  );
}

function RandomCountryTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [country, setCountry] = useState(COUNTRIES_DATABASE[0]);
  const pick = () => setCountry(COUNTRIES_DATABASE[getSecureRandomInt(0, COUNTRIES_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-4 text-center">
      <span className="text-6xl">{country.flag}</span>
      <h3 className="text-2xl font-black text-white">{country.name}</h3>
      <div className="flex gap-4 text-xs font-mono text-slate-400">
        <div>Capital: <span className="text-amber-300 font-bold">{country.capital}</span></div>
        <div>Continent: <span className="text-pink-300 font-bold">{country.continent}</span></div>
        <div>Pop: <span className="text-emerald-300 font-bold">{country.pop}</span></div>
      </div>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow">
        Pick Country
      </button>
    </div>
  );
}

function RandomCityTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [city, setCity] = useState(CITIES_DATABASE[0]);
  const pick = () => setCity(CITIES_DATABASE[getSecureRandomInt(0, CITIES_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 text-center">
      <MapPin className="w-8 h-8 text-pink-400" />
      <h3 className="text-2xl font-black text-white">{city.city}</h3>
      <span className="text-xs font-mono text-slate-400">{city.country} • {city.continent}</span>
      <span className="text-xs text-amber-300 font-semibold">Famous Landmark: {city.landmark}</span>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow mt-2">
        Pick City
      </button>
    </div>
  );
}

function RandomAnimalTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [animal, setAnimal] = useState(ANIMALS_DATABASE[0]);
  const pick = () => setAnimal(ANIMALS_DATABASE[getSecureRandomInt(0, ANIMALS_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 text-center">
      <span className="text-5xl">{animal.emoji}</span>
      <h3 className="text-2xl font-black text-white">{animal.name}</h3>
      <span className="text-xs font-mono text-pink-300 font-bold">{animal.category}</span>
      <span className="text-xs text-slate-400">Habitat: {animal.habitat}</span>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow mt-2">
        Pick Animal
      </button>
    </div>
  );
}

function RandomFoodTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [food, setFood] = useState(FOOD_DATABASE[0]);
  const pick = () => setFood(FOOD_DATABASE[getSecureRandomInt(0, FOOD_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 text-center">
      <span className="text-5xl">{food.icon}</span>
      <h3 className="text-2xl font-black text-white">{food.name}</h3>
      <div className="flex gap-3 text-xs font-mono text-slate-400">
        <span>Cuisine: <b className="text-amber-300">{food.cuisine}</b></span>
        <span>Type: <b className="text-pink-300">{food.type}</b></span>
      </div>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow mt-2">
        What to Eat?
      </button>
    </div>
  );
}

function RandomMovieTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [movie, setMovie] = useState(MOVIES_DATABASE[0]);
  const pick = () => setMovie(MOVIES_DATABASE[getSecureRandomInt(0, MOVIES_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 text-center">
      <Film className="w-8 h-8 text-amber-400" />
      <h3 className="text-2xl font-black text-white">{movie.title}</h3>
      <span className="text-xs font-mono text-slate-400">{movie.year} • {movie.genre}</span>
      <span className="text-xs text-pink-300 font-semibold">Directed by {movie.director}</span>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow mt-2">
        Pick Movie
      </button>
    </div>
  );
}

function RandomBookTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [book, setBook] = useState(BOOKS_DATABASE[0]);
  const pick = () => setBook(BOOKS_DATABASE[getSecureRandomInt(0, BOOKS_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 text-center">
      <BookOpen className="w-8 h-8 text-pink-400" />
      <h3 className="text-2xl font-black text-white">{book.title}</h3>
      <span className="text-xs font-mono text-amber-300 font-bold">By {book.author} ({book.year})</span>
      <span className="text-xs text-slate-400">{book.genre}</span>
      <button onClick={pick} className="px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow mt-2">
        Pick Book
      </button>
    </div>
  );
}

function RandomChallengeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [challenge, setChallenge] = useState(CHALLENGES_DATABASE[0]);
  const pick = () => setChallenge(CHALLENGES_DATABASE[getSecureRandomInt(0, CHALLENGES_DATABASE.length - 1)]);

  return (
    <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-4 text-center">
      <Trophy className="w-8 h-8 text-amber-400" />
      <h3 className="text-xl font-black text-white">{challenge.title}</h3>
      <p className="text-sm text-slate-300 max-w-md leading-relaxed">{challenge.description}</p>
      <span className="text-[10px] font-mono uppercase bg-pink-500/20 text-pink-300 px-2.5 py-1 rounded-full border border-pink-500/30 font-bold">
        {challenge.category} Challenge
      </span>
      <button onClick={pick} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow">
        New Challenge
      </button>
    </div>
  );
}
