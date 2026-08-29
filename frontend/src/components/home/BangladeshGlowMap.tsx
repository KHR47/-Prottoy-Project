"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Bus, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  Activity,
  Route
} from "lucide-react";
import Link from "next/link";

interface DistrictNode {
  id: string;
  name: string;
  divisionId: string;
  x: number;
  y: number;
  isMajor: boolean;
}

interface DivisionInfo {
  id: string;
  name: string;
  bnName: string;
  role: string;
  hubX: number;
  hubY: number;
  stats: {
    buses: number;
    gridStability: string;
    incidentsResolved: string;
    trafficFlow: string;
    subroutes: number;
  };
  color: string;
  glow: string;
  path: string; // Real geographic division boundary path
}

const divisions: DivisionInfo[] = [
  {
    id: "dhaka",
    name: "Dhaka Central",
    bnName: "ঢাকা",
    role: "National Command & High-Speed Transit Core",
    hubX: 410,
    hubY: 480,
    stats: { buses: 142, gridStability: "99.4%", incidentsResolved: "98.2%", trafficFlow: "Normal Mesh", subroutes: 18 },
    color: "#00F5A0",
    glow: "rgba(0, 245, 160, 0.4)",
    path: "M 340,370 L 420,360 L 470,390 L 510,430 L 490,520 L 450,560 L 380,570 L 320,530 L 310,460 L 340,370 Z",
  },
  {
    id: "chattogram",
    name: "Chattogram",
    bnName: "চট্টগ্রাম",
    role: "Maritime, Port & Hill Tracts Transit Corridor",
    hubX: 620,
    hubY: 700,
    stats: { buses: 68, gridStability: "99.1%", incidentsResolved: "96.5%", trafficFlow: "Optimal", subroutes: 14 },
    color: "#00C2FF",
    glow: "rgba(0, 194, 255, 0.4)",
    path: "M 500,530 L 570,510 L 610,540 L 730,550 L 770,640 L 780,780 L 750,910 L 735,970 L 710,930 L 670,810 L 620,710 L 570,660 L 520,620 L 500,530 Z",
  },
  {
    id: "sylhet",
    name: "Sylhet",
    bnName: "সিলেট",
    role: "Northeastern Ecological & Haor Basin Grid",
    hubX: 630,
    hubY: 290,
    stats: { buses: 34, gridStability: "99.8%", incidentsResolved: "99.0%", trafficFlow: "Clear", subroutes: 9 },
    color: "#CA56ED",
    glow: "rgba(202, 86, 237, 0.4)",
    path: "M 530,230 L 620,200 L 710,190 L 760,260 L 720,350 L 650,380 L 580,390 L 530,340 L 530,230 Z",
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    bnName: "রাজশাহী",
    role: "Northwestern Agri-Tech & Border Artery",
    hubX: 160,
    hubY: 370,
    stats: { buses: 42, gridStability: "98.9%", incidentsResolved: "97.4%", trafficFlow: "Clear", subroutes: 11 },
    color: "#FFBC09",
    glow: "rgba(255, 188, 9, 0.4)",
    path: "M 160,240 L 250,220 L 310,250 L 330,350 L 280,410 L 190,430 L 120,420 L 70,360 L 90,300 L 160,240 Z",
  },
  {
    id: "rangpur",
    name: "Rangpur",
    bnName: "রংপুর",
    role: "Northern Frontier & Solar Corridor",
    hubX: 220,
    hubY: 140,
    stats: { buses: 31, gridStability: "99.0%", incidentsResolved: "96.9%", trafficFlow: "Optimal", subroutes: 8 },
    color: "#00C2FF",
    glow: "rgba(0, 194, 255, 0.4)",
    path: "M 210,40 L 250,80 L 290,130 L 300,200 L 250,220 L 160,240 L 120,180 L 140,110 L 210,40 Z",
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    bnName: "ময়মনসিংহ",
    role: "Garo Hills & Brahmaputra Transport Link",
    hubX: 420,
    hubY: 290,
    stats: { buses: 26, gridStability: "99.2%", incidentsResolved: "97.5%", trafficFlow: "Normal", subroutes: 7 },
    color: "#CA56ED",
    glow: "rgba(202, 86, 237, 0.4)",
    path: "M 320,240 L 440,220 L 530,230 L 530,340 L 470,390 L 420,360 L 340,370 L 310,300 L 320,240 Z",
  },
  {
    id: "khulna",
    name: "Khulna",
    bnName: "খুলনা",
    role: "Southwestern Mangrove & Industrial Port Mesh",
    hubX: 250,
    hubY: 620,
    stats: { buses: 38, gridStability: "99.3%", incidentsResolved: "98.1%", trafficFlow: "Optimal", subroutes: 12 },
    color: "#FA3F06",
    glow: "rgba(250, 63, 6, 0.4)",
    path: "M 190,430 L 280,410 L 330,470 L 320,570 L 350,680 L 310,810 L 230,810 L 170,690 L 140,560 L 130,470 L 190,430 Z",
  },
  {
    id: "barishal",
    name: "Barishal",
    bnName: "বরিশাল",
    role: "Southern Riverine Delta & Coastal Gateway",
    hubX: 410,
    hubY: 680,
    stats: { buses: 29, gridStability: "98.7%", incidentsResolved: "95.8%", trafficFlow: "Clear", subroutes: 9 },
    color: "#00F5A0",
    glow: "rgba(0, 245, 160, 0.4)",
    path: "M 330,570 L 440,560 L 490,570 L 520,620 L 500,750 L 470,820 L 380,820 L 350,680 L 330,570 Z",
  },
];

// Rich set of national district nodes and regional junctions
const districtNodes: DistrictNode[] = [
  // Dhaka Division Nodes
  { id: "dhaka_hub", name: "Dhaka Central", divisionId: "dhaka", x: 410, y: 480, isMajor: true },
  { id: "gazipur", name: "Gazipur", divisionId: "dhaka", x: 410, y: 430, isMajor: false },
  { id: "narayanganj", name: "Narayanganj", divisionId: "dhaka", x: 430, y: 510, isMajor: false },
  { id: "tangail", name: "Tangail", divisionId: "dhaka", x: 350, y: 390, isMajor: false },
  { id: "faridpur", name: "Faridpur", divisionId: "dhaka", x: 340, y: 510, isMajor: false },
  { id: "narsingdi", name: "Narsingdi", divisionId: "dhaka", x: 460, y: 440, isMajor: false },

  // Chattogram Division Nodes
  { id: "ctg_hub", name: "Chattogram City", divisionId: "chattogram", x: 620, y: 700, isMajor: true },
  { id: "cumilla", name: "Cumilla", divisionId: "chattogram", x: 500, y: 500, isMajor: true },
  { id: "feni", name: "Feni", divisionId: "chattogram", x: 550, y: 590, isMajor: false },
  { id: "coxsbazar", name: "Cox's Bazar", divisionId: "chattogram", x: 670, y: 820, isMajor: true },
  { id: "teknaf", name: "Teknaf", divisionId: "chattogram", x: 730, y: 950, isMajor: false },
  { id: "brahmanbaria", name: "Brahmanbaria", divisionId: "chattogram", x: 500, y: 410, isMajor: false },
  { id: "noakhali", name: "Noakhali", divisionId: "chattogram", x: 490, y: 630, isMajor: false },
  { id: "chandpur", name: "Chandpur", divisionId: "chattogram", x: 450, y: 560, isMajor: false },
  { id: "rangamati", name: "Rangamati", divisionId: "chattogram", x: 700, y: 640, isMajor: false },
  { id: "bandarban", name: "Bandarban", divisionId: "chattogram", x: 710, y: 760, isMajor: false },
  { id: "khagrachhari", name: "Khagrachhari", divisionId: "chattogram", x: 680, y: 560, isMajor: false },

  // Sylhet Division Nodes
  { id: "sylhet_hub", name: "Sylhet City", divisionId: "sylhet", x: 630, y: 290, isMajor: true },
  { id: "sreemangal", name: "Sreemangal", divisionId: "sylhet", x: 600, y: 360, isMajor: false },
  { id: "habiganj", name: "Habiganj", divisionId: "sylhet", x: 550, y: 350, isMajor: false },
  { id: "sunamganj", name: "Sunamganj", divisionId: "sylhet", x: 580, y: 240, isMajor: false },
  { id: "jaflong", name: "Jaflong/Tamabil", divisionId: "sylhet", x: 680, y: 220, isMajor: false },

  // Rajshahi Division Nodes
  { id: "rajshahi_hub", name: "Rajshahi City", divisionId: "rajshahi", x: 160, y: 370, isMajor: true },
  { id: "bogura", name: "Bogura", divisionId: "rajshahi", x: 270, y: 280, isMajor: true },
  { id: "pabna", name: "Pabna", divisionId: "rajshahi", x: 260, y: 430, isMajor: false },
  { id: "natore", name: "Natore", divisionId: "rajshahi", x: 210, y: 360, isMajor: false },
  { id: "sirajganj", name: "Sirajganj", divisionId: "rajshahi", x: 330, y: 340, isMajor: false },
  { id: "naogaon", name: "Naogaon", divisionId: "rajshahi", x: 180, y: 290, isMajor: false },
  { id: "chapai", name: "Chapai Nawabganj", divisionId: "rajshahi", x: 100, y: 350, isMajor: false },

  // Rangpur Division Nodes
  { id: "rangpur_hub", name: "Rangpur City", divisionId: "rangpur", x: 220, y: 140, isMajor: true },
  { id: "dinajpur", name: "Dinajpur", divisionId: "rangpur", x: 150, y: 170, isMajor: false },
  { id: "saidpur", name: "Saidpur", divisionId: "rangpur", x: 190, y: 120, isMajor: false },
  { id: "panchagarh", name: "Panchagarh/Tetulia", divisionId: "rangpur", x: 170, y: 60, isMajor: false },
  { id: "kurigram", name: "Kurigram", divisionId: "rangpur", x: 280, y: 130, isMajor: false },
  { id: "gaibandha", name: "Gaibandha", divisionId: "rangpur", x: 270, y: 200, isMajor: false },

  // Mymensingh Division Nodes
  { id: "mymensingh_hub", name: "Mymensingh City", divisionId: "mymensingh", x: 420, y: 290, isMajor: true },
  { id: "jamalpur", name: "Jamalpur", divisionId: "mymensingh", x: 330, y: 260, isMajor: false },
  { id: "netrokona", name: "Netrokona", divisionId: "mymensingh", x: 490, y: 260, isMajor: false },
  { id: "sherpur", name: "Sherpur", divisionId: "mymensingh", x: 380, y: 230, isMajor: false },

  // Khulna Division Nodes
  { id: "khulna_hub", name: "Khulna City", divisionId: "khulna", x: 250, y: 620, isMajor: true },
  { id: "jashore", name: "Jashore", divisionId: "khulna", x: 220, y: 530, isMajor: false },
  { id: "kushtia", name: "Kushtia", divisionId: "khulna", x: 210, y: 440, isMajor: false },
  { id: "satkhira", name: "Satkhira", divisionId: "khulna", x: 180, y: 650, isMajor: false },
  { id: "jhenaidah", name: "Jhenaidah", divisionId: "khulna", x: 230, y: 480, isMajor: false },
  { id: "mongla", name: "Mongla Port", divisionId: "khulna", x: 270, y: 720, isMajor: false },
  { id: "bagerhat", name: "Bagerhat", divisionId: "khulna", x: 290, y: 640, isMajor: false },

  // Barishal Division Nodes
  { id: "barishal_hub", name: "Barishal City", divisionId: "barishal", x: 410, y: 680, isMajor: true },
  { id: "patuakhali", name: "Patuakhali", divisionId: "barishal", x: 400, y: 750, isMajor: false },
  { id: "kuakata", name: "Kuakata Coast", divisionId: "barishal", x: 390, y: 820, isMajor: false },
  { id: "bhola", name: "Bhola Island", divisionId: "barishal", x: 470, y: 720, isMajor: false },
  { id: "pirojpur", name: "Pirojpur", divisionId: "barishal", x: 340, y: 660, isMajor: false },
];

// Primary National Arteries (High-Capacity Highways & High-Speed Fiber Routes)
const primaryCorridors = [
  // N1: Dhaka -> Cumilla -> Feni -> Chattogram -> Cox's Bazar -> Teknaf
  ["dhaka_hub", "narayanganj"],
  ["narayanganj", "cumilla"],
  ["cumilla", "feni"],
  ["feni", "ctg_hub"],
  ["ctg_hub", "coxsbazar"],
  ["coxsbazar", "teknaf"],

  // N2: Dhaka -> Narsingdi -> Brahmanbaria -> Habiganj -> Sreemangal -> Sylhet -> Jaflong
  ["dhaka_hub", "narsingdi"],
  ["narsingdi", "brahmanbaria"],
  ["brahmanbaria", "habiganj"],
  ["habiganj", "sreemangal"],
  ["sreemangal", "sylhet_hub"],
  ["sylhet_hub", "jaflong"],

  // N3: Dhaka -> Gazipur -> Mymensingh
  ["dhaka_hub", "gazipur"],
  ["gazipur", "mymensingh_hub"],

  // N4 / N5: Dhaka -> Tangail -> Sirajganj -> Bogura -> Gaibandha -> Rangpur -> Saidpur -> Dinajpur -> Panchagarh
  ["gazipur", "tangail"],
  ["tangail", "sirajganj"],
  ["sirajganj", "bogura"],
  ["bogura", "gaibandha"],
  ["gaibandha", "rangpur_hub"],
  ["rangpur_hub", "saidpur"],
  ["saidpur", "dinajpur"],
  ["saidpur", "panchagarh"],

  // N6: Bogura -> Natore -> Rajshahi -> Chapai
  ["bogura", "natore"],
  ["natore", "rajshahi_hub"],
  ["rajshahi_hub", "chapai"],

  // N7: Dhaka -> Padma Bridge (Faridpur) -> Magura/Jhenaidah -> Jashore -> Khulna -> Mongla
  ["dhaka_hub", "faridpur"],
  ["faridpur", "jhenaidah"],
  ["jhenaidah", "jashore"],
  ["jashore", "khulna_hub"],
  ["khulna_hub", "mongla"],

  // N8: Dhaka -> Faridpur -> Barishal -> Patuakhali -> Kuakata
  ["faridpur", "barishal_hub"],
  ["barishal_hub", "patuakhali"],
  ["patuakhali", "kuakata"],
];

// Secondary Feeder Sub-Routes & Regional Interconnects
const subRoutes = [
  // Northern Subroutes
  ["rangpur_hub", "kurigram"],
  ["dinajpur", "panchagarh"],
  ["bogura", "naogaon"],
  ["naogaon", "rajshahi_hub"],
  ["natore", "pabna"],
  ["pabna", "sirajganj"],
  ["pabna", "kushtia"], // Lalon Shah bridge corridor

  // Western Subroutes
  ["kushtia", "jhenaidah"],
  ["jashore", "satkhira"],
  ["khulna_hub", "satkhira"],
  ["khulna_hub", "bagerhat"],
  ["bagerhat", "pirojpur"],
  ["pirojpur", "barishal_hub"],

  // Central-Eastern Subroutes
  ["mymensingh_hub", "sherpur"],
  ["mymensingh_hub", "jamalpur"],
  ["mymensingh_hub", "netrokona"],
  ["netrokona", "sunamganj"], // Haor bridge
  ["sunamganj", "sylhet_hub"],
  ["tangail", "mymensingh_hub"],
  ["narsingdi", "mymensingh_hub"],
  ["brahmanbaria", "cumilla"],

  // Southern Coastal & Delta Subroutes
  ["barishal_hub", "bhola"],
  ["chandpur", "cumilla"],
  ["chandpur", "narayanganj"],
  ["noakhali", "feni"],
  ["chandpur", "noakhali"],

  // Chittagong Hill Tracts Subroutes
  ["ctg_hub", "rangamati"],
  ["ctg_hub", "bandarban"],
  ["ctg_hub", "khagrachhari"],
  ["feni", "khagrachhari"],
  ["bandarban", "coxsbazar"],
];

// Accurate National Geographic Boundary
const authenticBangladeshBorder = `
  M 210,40
  C 230,55 260,85 285,120
  C 305,150 300,195 295,225
  C 330,225 390,220 445,220
  C 490,220 525,230 550,225
  C 590,205 640,190 690,190
  C 730,190 765,220 765,260
  C 765,300 735,340 705,370
  C 670,400 645,410 635,445
  C 625,480 645,510 680,530
  C 725,545 765,585 770,640
  C 775,700 785,760 775,820
  C 765,875 745,935 735,975
  C 720,975 705,945 690,890
  C 675,845 650,780 630,735
  C 605,685 570,660 535,635
  C 515,670 495,745 475,820
  C 440,825 405,825 375,820
  C 350,780 340,730 330,680
  C 305,735 275,785 240,815
  C 205,815 180,760 170,700
  C 155,640 140,580 135,515
  C 125,470 140,440 175,430
  C 145,420 100,405 75,365
  C 55,320 70,270 115,225
  C 145,190 120,145 145,100
  C 165,70 190,45 210,40
  Z
`;

// Major River Veins
const rivers = [
  "M 295,225 Q 320,330 350,420 T 400,500", // Jamuna River
  "M 75,365 Q 230,420 400,500", // Padma River
  "M 400,500 Q 465,590 490,750", // Lower Meghna Estuary
  "M 690,190 Q 560,340 400,500", // Surma-Meghna Channel
  "M 630,735 Q 675,830 735,975", // Karnaphuli Coastal Artery
];

export function BangladeshGlowMap() {
  const [selectedDiv, setSelectedDiv] = useState<DivisionInfo>(divisions[0]);
  const [hoveredDiv, setHoveredDiv] = useState<DivisionInfo | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictNode | null>(null);
  const filterId = useId();

  const activeDiv = hoveredDiv || selectedDiv;

  return (
    <section className="relative my-20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)] mb-3 shadow-sm">
              <Route className="w-3.5 h-3.5" />
              National Transit & Fiber Mesh Network
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              Comprehensive Route Infrastructure
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2 font-light leading-relaxed">
              Explore primary national highways (N1–N8) and regional subroutes linking all 64 districts across 8 divisions with live telemetry synchronization.
            </p>
          </div>

          {/* Division Selector Pills */}
          <div className="flex flex-wrap gap-1.5 max-w-lg">
            {divisions.map((div) => {
              const isSelected = activeDiv.id === div.id;
              return (
                <button
                  key={div.id}
                  onClick={() => setSelectedDiv(div)}
                  onMouseEnter={() => setHoveredDiv(div)}
                  onMouseLeave={() => setHoveredDiv(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all duration-200 border ${
                    isSelected
                      ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md shadow-teal-500/10 scale-105"
                      : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {div.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* The Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--bg-surface)]/85 backdrop-blur-2xl border border-[var(--border)] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-hidden relative">
          
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

          {/* Left: Accurate Vector Map with Comprehensive Primary & Secondary Routes (7 Cols) */}
          <div className="lg:col-span-7 relative w-full aspect-[800/1000] max-h-[660px] flex items-center justify-center select-none">
            <svg
              viewBox="0 0 800 1000"
              className="w-full h-full filter drop-shadow-[0_0_25px_rgba(0,245,160,0.15)]"
            >
              <defs>
                {/* Neon Glow Filters */}
                <filter id={`mesh-glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id={`mesh-strong-${filterId}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="bigBlur" />
                  <feGaussianBlur stdDeviation="2" result="sharpBlur" />
                  <feMerge>
                    <feMergeNode in="bigBlur" />
                    <feMergeNode in="sharpBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Saffron-Style Glowing Gradients */}
                <linearGradient id={`bd-border-grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#00F5A0" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#CA56ED" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FA3F06" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id={`river-grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#00F5A0" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Division Territory Polygons (Interactive hover regions) */}
              {divisions.map((div) => {
                const isActive = activeDiv.id === div.id;
                return (
                  <path
                    key={`div-poly-${div.id}`}
                    d={div.path}
                    fill={isActive ? div.glow : "rgba(13, 148, 136, 0.03)"}
                    stroke={isActive ? div.color : "rgba(255, 255, 255, 0.07)"}
                    strokeWidth={isActive ? "2" : "0.8"}
                    strokeDasharray={isActive ? "none" : "3 3"}
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    onClick={() => setSelectedDiv(div)}
                    onMouseEnter={() => setHoveredDiv(div)}
                    onMouseLeave={() => setHoveredDiv(null)}
                    style={{
                      filter: isActive ? `url(#mesh-glow-${filterId})` : "none",
                    }}
                  />
                );
              })}

              {/* Geographic National Boundary Contour */}
              <path
                d={authenticBangladeshBorder}
                fill="none"
                stroke={`url(#bd-border-grad-${filterId})`}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `url(#mesh-glow-${filterId})` }}
                className="opacity-85"
              />

              {/* Major River Arteries (Padma, Jamuna, Meghna, Karnaphuli) */}
              {rivers.map((d, i) => (
                <path
                  key={`river-${i}`}
                  d={d}
                  fill="none"
                  stroke={`url(#river-grad-${filterId})`}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{ filter: `url(#mesh-glow-${filterId})` }}
                  className="opacity-45"
                />
              ))}

              {/* Layer 1: Secondary Feeder Sub-Routes (Subtle Dashed Glowing Mesh) */}
              {subRoutes.map(([fromId, toId], idx) => {
                const fromNode = districtNodes.find((n) => n.id === fromId);
                const toNode = districtNodes.find((n) => n.id === toId);
                if (!fromNode || !toNode) return null;

                const isInActiveDiv =
                  fromNode.divisionId === activeDiv.id || toNode.divisionId === activeDiv.id;

                return (
                  <line
                    key={`subroute-${fromId}-${toId}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isInActiveDiv ? activeDiv.color : "rgba(202, 86, 237, 0.4)"}
                    strokeWidth={isInActiveDiv ? "1.6" : "0.9"}
                    strokeDasharray="2 3"
                    className="transition-all duration-300"
                    style={{
                      opacity: isInActiveDiv ? 0.8 : 0.25,
                      filter: isInActiveDiv ? `url(#mesh-glow-${filterId})` : "none",
                    }}
                  />
                );
              })}

              {/* Layer 2: Primary National Highways (Solid High-Capacity Corridors) */}
              {primaryCorridors.map(([fromId, toId], idx) => {
                const fromNode = districtNodes.find((n) => n.id === fromId);
                const toNode = districtNodes.find((n) => n.id === toId);
                if (!fromNode || !toNode) return null;

                const isInActiveDiv =
                  fromNode.divisionId === activeDiv.id || toNode.divisionId === activeDiv.id;

                return (
                  <g key={`primary-${fromId}-${toId}`}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isInActiveDiv ? activeDiv.color : "#00F5A0"}
                      strokeWidth={isInActiveDiv ? "3" : "1.8"}
                      className="transition-all duration-300"
                      style={{
                        opacity: isInActiveDiv ? 1 : 0.5,
                        filter: `url(#mesh-glow-${filterId})`,
                      }}
                    />

                    {/* Animated High-Speed Light Pulses along Primary Corridors */}
                    {(isInActiveDiv || idx % 2 === 0) && (
                      <circle r={isInActiveDiv ? "3.2" : "2.2"} fill={isInActiveDiv ? "#FFFFFF" : "#00F5A0"}>
                        <animateMotion
                          path={`M ${fromNode.x},${fromNode.y} L ${toNode.x},${toNode.y}`}
                          dur={`${2.2 + (idx % 3)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Layer 3: District Junction Nodes */}
              {districtNodes.map((d) => {
                const isInActiveDiv = d.divisionId === activeDiv.id;
                const isHovered = hoveredDistrict?.id === d.id;

                return (
                  <g
                    key={`district-${d.id}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDistrict(d)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  >
                    {/* Pulsing Radar Halo on Major Hubs */}
                    {d.isMajor && isInActiveDiv && (
                      <>
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r="18"
                          fill="none"
                          stroke={activeDiv.color}
                          strokeWidth="1.2"
                          strokeDasharray="3 2"
                          className="animate-[spin_10s_linear_infinite]"
                          style={{ filter: `url(#mesh-glow-${filterId})` }}
                        />
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r="10"
                          fill={activeDiv.glow}
                          className="animate-pulse"
                        />
                      </>
                    )}

                    {/* Node Core */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={d.isMajor ? (isInActiveDiv ? "5.5" : "4.5") : (isHovered ? "4" : "2.5")}
                      fill={d.isMajor ? (isInActiveDiv ? "#FFFFFF" : activeDiv.color) : (isHovered ? "#00F5A0" : "rgba(255,255,255,0.7)")}
                      stroke={d.isMajor ? activeDiv.color : "rgba(0,0,0,0.5)"}
                      strokeWidth={d.isMajor ? "2" : "1"}
                      style={{
                        filter: d.isMajor || isHovered ? `url(#mesh-strong-${filterId})` : "none",
                      }}
                    />

                    {/* District Label (Major or Hovered) */}
                    {(d.isMajor || isHovered || isInActiveDiv) && (
                      <text
                        x={d.x}
                        y={d.y - (d.isMajor ? 9 : 6)}
                        textAnchor="middle"
                        className={`font-mono tracking-wider pointer-events-none select-none transition-all duration-200 ${
                          d.isMajor
                            ? "fill-white text-[10.5px] font-black drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
                            : "fill-[var(--text-secondary)] text-[8.5px] font-bold opacity-80"
                        }`}
                      >
                        {d.name.split(" ")[0]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[var(--border)]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded-full bg-[#00F5A0]" />
                  <span>Primary Highways (N1–N8)</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <span className="h-1.5 w-3 rounded-full border border-dashed border-[#CA56ED]" />
                  <span>Regional Subroutes</span>
                </span>
              </div>
              <span className="font-bold text-[var(--accent)]">
                {primaryCorridors.length + subRoutes.length} Corridors Monitored
              </span>
            </div>
          </div>

          {/* Right: Live Regional Telemetry Console (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDiv.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Division Title Card */}
                <div className="p-6 rounded-3xl bg-[var(--bg-base)]/90 border border-[var(--border)] shadow-lg relative overflow-hidden">
                  <div
                    className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ background: activeDiv.color }}
                  />

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)]">
                      {activeDiv.bnName} DIVISION
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      SYNCHRONIZED
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    {activeDiv.name}
                  </h3>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                    {activeDiv.role}
                  </p>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[var(--bg-base)]/70 border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-sky-400 mb-2">
                      <Bus className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono uppercase text-[var(--text-muted)]">
                        Active Fleet
                      </span>
                    </div>
                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      {activeDiv.stats.buses}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Buses on Route</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--bg-base)]/70 border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono uppercase text-[var(--text-muted)]">
                        Grid Health
                      </span>
                    </div>
                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      {activeDiv.stats.gridStability}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Resilience Index</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--bg-base)]/70 border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                      <Route className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono uppercase text-[var(--text-muted)]">
                        Subroutes
                      </span>
                    </div>
                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      {activeDiv.stats.subroutes} Links
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">District Feeders</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--bg-base)]/70 border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono uppercase text-[var(--text-muted)]">
                        Traffic Flow
                      </span>
                    </div>
                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      {activeDiv.stats.trafficFlow}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Mesh Optimization</p>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/transport/intercity"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-lg shadow-teal-600/20"
                  >
                    View 30 Intercity Routes <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/reports/public"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm transition-all"
                  >
                    Regional Issues
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
