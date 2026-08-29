"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Flame, TrendingDown, AlertTriangle, CheckCircle, Activity, Settings2, ArrowDownToLine, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function GasSupplyMonitoringPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [loading, setLoading] = useState(true);
  const [demandData, setDemandData] = useState<Record<string, number>>({});
  const [stations, setStations] = useState<Record<string, { output: number, capacity: number }>>({});

  useEffect(() => {
    if (isReady) {
      const fetchData = async () => {
        try {
          const res = await api.get("/gas/meters");
          const activeMeters = res.data.filter((m: any) => m.status === "active");
          
          const currentDemand: Record<string, number> = {};
          activeMeters.forEach((m: any) => {
            const zone = m.zone || m.district || "Unknown";
            currentDemand[zone] = (currentDemand[zone] || 0) + (m.lastReading || 0);
          });
          setDemandData(currentDemand);

          const savedStations = localStorage.getItem("gas_distribution_stations");
          if (savedStations) {
            const parsedStations = JSON.parse(savedStations);
            Object.keys(currentDemand).forEach(zone => {
              if (!parsedStations[zone]) {
                parsedStations[zone] = {
                  output: Math.ceil(currentDemand[zone] * 1.1),
                  capacity: Math.ceil(currentDemand[zone] * 2.0) || 500
                };
              }
            });
            setStations(parsedStations);
          } else {
            const initialStations: Record<string, { output: number, capacity: number }> = {};
            Object.keys(currentDemand).forEach(zone => {
              initialStations[zone] = {
                output: Math.ceil(currentDemand[zone] * 1.1),
                capacity: Math.ceil(currentDemand[zone] * 2.0) || 500
              };
            });
            if (Object.keys(currentDemand).length === 0) {
              initialStations["Central Terminal"] = { output: 100, capacity: 500 };
            }
            setStations(initialStations);
            localStorage.setItem("gas_distribution_stations", JSON.stringify(initialStations));
          }
        } catch (err: any) {
          if (err?.code !== "ERR_NETWORK") console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
      const interval = setInterval(fetchData, 10000); 
      return () => clearInterval(interval);
    }
  }, [isReady]);

  const handleAdjustFlow = (zone: string, adjustment: number) => {
    setStations(prev => {
      const current = prev[zone];
      let newOutput = current.output + adjustment;
      
      if (newOutput < 0) newOutput = 0;
      if (newOutput > current.capacity) newOutput = current.capacity;
      
      const newStations = { ...prev, [zone]: { ...current, output: newOutput } };
      localStorage.setItem("gas_distribution_stations", JSON.stringify(newStations));
      return newStations;
    });
    toast.success(`Adjusted valve pressure for ${zone} station.`);
  };

  if (!isReady) return null;

  let totalOutput = 0;
  let totalDemand = 0;
  let criticalZones = 0;

  const analysisCards = Object.keys(stations).map(zone => {
    const output = stations[zone].output;
    const demand = demandData[zone] || 0;
    
    totalOutput += output;
    totalDemand += demand;

    const systemLoss = output - demand; 
    let status = "optimal"; 
    let message = "Supply meets demand efficiently.";

    if (systemLoss < 0) {
      status = "shortage"; 
      message = "CRITICAL: Pressure drop! Citizens are not receiving requested gas flow.";
      criticalZones++;
    } else if (systemLoss > (demand * 0.2) && demand > 0) {
      status = "leak"; 
      message = "WARNING: Massive system loss detected. Suspected main pipeline leak!";
      criticalZones++;
    }

    return { zone, output, capacity: stations[zone].capacity, demand, systemLoss, status, message };
  });

  const overallEfficiency = totalOutput > 0 ? ((totalDemand / totalOutput) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <Flame className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold uppercase text-orange-700">Distribution Control</p>
          </div>
          <h1 className="text-3xl font-black text-slate-950">Gas Supply & Valve Monitoring</h1>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Real-time physical grid monitoring. The system continuously compares central terminal output against actual metered citizen consumption to detect physical network losses and high-pressure leaks.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Grid Output</p>
            <p className="mt-2 text-3xl font-black text-orange-700">{totalOutput.toLocaleString()} m³</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Live Demand</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{totalDemand.toLocaleString()} m³</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Network Efficiency</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">{overallEfficiency}%</p>
            <p className="text-xs text-slate-400 mt-1">Metered vs Supplied</p>
          </div>
          <div className={`rounded-xl border p-5 shadow-sm ${criticalZones > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
            <p className={`text-sm font-bold ${criticalZones > 0 ? 'text-rose-700' : 'text-slate-500'}`}>Critical Grid Alerts</p>
            <div className="mt-2 flex items-center gap-2">
              {criticalZones > 0 ? <AlertTriangle className="h-8 w-8 text-rose-600" /> : <CheckCircle className="h-8 w-8 text-emerald-500" />}
              <p className={`text-3xl font-black ${criticalZones > 0 ? 'text-rose-900' : 'text-slate-900'}`}>{criticalZones}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analysisCards.map((card) => (
            <div key={card.zone} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  {card.zone} Pressure Station
                </h3>
                {card.status === "optimal" && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">Optimal</span>}
                {card.status === "shortage" && <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">Pressure Drop</span>}
                {card.status === "leak" && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">Main Line Leak</span>}
              </div>

              <div className="p-6 flex-1 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <ArrowDownToLine className="h-3 w-3" /> Citizen Demand
                  </p>
                  <p className="text-2xl font-black text-slate-900">{card.demand.toLocaleString()} m³</p>
                  <p className="text-xs text-slate-500 mt-1">Aggregated from live meters</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <ArrowUpRight className="h-3 w-3" /> Station Output
                  </p>
                  <p className={`text-2xl font-black ${card.status === 'shortage' ? 'text-rose-600' : 'text-orange-600'}`}>
                    {card.output.toLocaleString()} m³
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Max Cap: {card.capacity.toLocaleString()} m³</p>
                </div>
              </div>

              {card.status !== "optimal" && (
                <div className={`mx-6 mb-4 px-4 py-3 rounded-lg flex items-start gap-3 text-sm font-bold border ${card.status === 'shortage' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>{card.message}</p>
                </div>
              )}
              {card.status === "optimal" && card.systemLoss > 0 && (
                 <div className="mx-6 mb-4 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm border border-slate-100 flex items-center justify-between">
                    <span>Expected physical pipe loss:</span>
                    <span className="font-mono font-bold text-slate-400">{card.systemLoss} m³</span>
                 </div>
              )}

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                  <Settings2 className="h-4 w-4" /> Valve Control
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAdjustFlow(card.zone, -50)}
                    disabled={card.output <= 0}
                    className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 font-black hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <div className="w-24 text-center font-mono text-sm font-bold text-slate-900 border border-slate-200 bg-white py-2 rounded-md">
                    {Math.round((card.output / card.capacity) * 100)}% Flow
                  </div>
                  <button 
                    onClick={() => handleAdjustFlow(card.zone, 50)}
                    disabled={card.output >= card.capacity}
                    className="w-10 h-10 rounded-full border border-orange-300 bg-orange-50 flex items-center justify-center text-orange-700 font-black hover:bg-orange-100 transition disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {analysisCards.length === 0 && (
            <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-center">
              <Flame className="h-16 w-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No Distribution Stations Active</h3>
              <p className="text-slate-500 mt-2 max-w-md">There is no active metered demand in the city grid yet. Approve citizen meters to activate regional distribution stations.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
