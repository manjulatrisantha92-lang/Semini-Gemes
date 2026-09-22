import React, { useState } from 'react';
import {
  Code2,
  Database,
  Server,
  Network,
  Cpu,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  Layers,
  FileCode,
  Zap,
  ExternalLink,
  ChevronRight,
  Activity,
  HardDrive,
  GitBranch,
} from 'lucide-react';
import { AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { MongooseSchemasCode } from '../../models/mongooseSchemas';

interface MongoArchitectureViewProps {
  settings: AppSettings;
  currentUser?: User | null;
}

export const MongoArchitectureView: React.FC<MongoArchitectureViewProps> = ({
  settings,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schemas' | 'pipelines' | 'mongoose'>('overview');
  const [selectedCollection, setSelectedCollection] = useState<string>('products');
  const [isCopiedUri, setIsCopiedUri] = useState(false);
  const [isCopiedMongoose, setIsCopiedMongoose] = useState(false);
  const [pingLatency, setPingLatency] = useState<number>(24);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const connectionUri = `mongodb+srv://ceylon_gems_admin:••••••••••••@cluster0.wcsgems.mongodb.net/ceylon_gems_db?retryWrites=true&w=majority&appName=WCSJewelry`;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(
      `mongodb+srv://ceylon_gems_admin:wcsSecurePass2026@cluster0.wcsgems.mongodb.net/ceylon_gems_db?retryWrites=true&w=majority&appName=WCSJewelry`
    );
    setIsCopiedUri(true);
    setTimeout(() => setIsCopiedUri(false), 3000);
  };

  const handleCopyMongoose = () => {
    navigator.clipboard.writeText(MongooseSchemasCode);
    setIsCopiedMongoose(true);
    setTimeout(() => setIsCopiedMongoose(false), 3000);
  };

  const handleSimulatePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency(Math.floor(22 + Math.random() * 8));
      setIsPinging(false);
    }, 600);
  };

  // Live real data for the document sample preview
  const getSampleDocument = () => {
    switch (selectedCollection) {
      case 'products':
        const prods = StorageService.getProducts();
        return prods[0] || { message: 'No product records' };
      case 'invoices':
        const invs = StorageService.getInvoices();
        return invs[0] || { message: 'No invoice records' };
      case 'customers':
        const custs = StorageService.getCustomers();
        return custs[0] || { message: 'No customer records' };
      case 'purchase_orders':
        const pos = StorageService.getPurchaseOrders();
        return pos[0] || { message: 'No purchase order records' };
      case 'workshop_orders':
        const wos = StorageService.getWorkshopOrders();
        return wos[0] || { message: 'No workshop orders' };
      case 'users':
        const usrs = StorageService.getUsers();
        return usrs[0] || { message: 'No users' };
      default:
        return { collection: selectedCollection, status: 'Ready' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              MongoDB Architecture & Atlas Cloud
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                NoSQL Schema & Mongoose
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              High-availability Replica Set specifications, document schemas, indexing & aggregation pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulatePing}
            disabled={isPinging}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
            <span>Atlas Ping: {pingLatency} ms</span>
          </button>

          <button
            onClick={handleCopyUri}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {isCopiedUri ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopiedUri ? 'URI Copied!' : 'Copy Connection URI'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Replica Set & High Availability</span>
        </button>

        <button
          onClick={() => setActiveTab('schemas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'schemas'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Collections & BSON Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('pipelines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'pipelines'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Aggregation Pipelines</span>
        </button>

        <button
          onClick={() => setActiveTab('mongoose')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'mongoose'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Mongoose Code Generator</span>
        </button>
      </div>

      {/* TAB 1: REPLICA SET OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Connection String Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                MongoDB Atlas Production Connection String
              </span>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                TLS 1.3 Encrypted • SCRAM-SHA-256
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <span className="text-slate-500 select-none">$</span>
              <span className="whitespace-nowrap select-all">{connectionUri}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Compatible with Node.js Mongoose 8.x, MongoDB Compass, Studio 3T, and Vercel Serverless Edge Functions.
            </p>
          </div>

          {/* 3-Node Replica Set Visualization */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              Atlas 3-Node Replica Set Topology (rs0)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Node 1: Primary */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    rs0-primary.mongodb.net
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Primary (RW)
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 mt-3 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Role:</span>
                    <span className="text-white">Write Leader & Master</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Region:</span>
                    <span className="text-white">ap-southeast-1 (Singapore)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Oplog Size:</span>
                    <span className="text-emerald-400">50 GB Circular</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>WiredTiger Cache:</span>
                    <span className="text-white">16 GB Dedicated</span>
                  </div>
                </div>
              </div>

              {/* Node 2: Secondary 1 */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-cyan-400" />
                    rs0-secondary1.mongodb.net
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    Secondary (RO)
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 mt-3 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Role:</span>
                    <span className="text-white">Hot Standby / Read Queries</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sync Lag:</span>
                    <span className="text-emerald-400">0.02 ms (Live Stream)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Heartbeat:</span>
                    <span className="text-cyan-300">Active (2s intervals)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Auto-Failover:</span>
                    <span className="text-white">Elected in &lt; 3 sec</span>
                  </div>
                </div>
              </div>

              {/* Node 3: Secondary 2 / Analytics */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-400" />
                    rs0-secondary2.mongodb.net
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    Analytics Node
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 mt-3 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Role:</span>
                    <span className="text-white">A4 Business Reports & P&L</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Read Preference:</span>
                    <span className="text-purple-300">secondaryPreferred</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Zero Impact:</span>
                    <span className="text-emerald-400">No POS latency impact</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Backup Snaps:</span>
                    <span className="text-white">Hourly Point-in-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLLECTIONS & BSON DOCUMENTS */}
      {activeTab === 'schemas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Collections List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
              Showroom Database Collections
            </h3>

            {[
              { id: 'products', name: 'products', count: StorageService.getProducts().length, desc: 'Jewelry catalog, bullion & Ceylon gems' },
              { id: 'invoices', name: 'invoices', count: StorageService.getInvoices().length, desc: 'POS sales bills & payment splits' },
              { id: 'customers', name: 'customers', count: StorageService.getCustomers().length, desc: 'VIP contacts, NIC/passport & history' },
              { id: 'purchase_orders', name: 'purchase_orders', count: StorageService.getPurchaseOrders().length, desc: 'Bullion intake & refinery receipts' },
              { id: 'workshop_orders', name: 'workshop_orders', count: StorageService.getWorkshopOrders().length, desc: 'Custom bespoke goldsmith orders' },
              { id: 'users', name: 'users', count: StorageService.getUsers().length, desc: 'Staff credentials & access roles' },
            ].map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCollection === col.id
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    db.{col.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {col.count} docs
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{col.desc}</div>
              </button>
            ))}
          </div>

          {/* Right: Live BSON Document Viewer */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Live BSON Record from <span className="text-emerald-400">db.{selectedCollection}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ObjectId & Timestamps Enabled
              </span>
            </div>

            <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[480px]">
              <pre>{JSON.stringify(getSampleDocument(), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGGREGATION PIPELINES */}
      {activeTab === 'pipelines' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                1. Monthly Revenue & Gemstone Margin Pipeline
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Optimized with $match & $group
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <pre>{`// Aggregates monthly revenue grouped by gemstone origin & gold purity
db.invoices.aggregate([
  { $match: { paymentStatus: "paid", date: { $gte: "2026-01-01" } } },
  { $unwind: "$items" },
  {
    $group: {
      _id: {
        month: { $substr: ["$date", 0, 7] },
        category: "$items.category"
      },
      totalSalesLKR: { $sum: { $multiply: ["$items.quantity", "$items.unitPriceLKR"] } },
      totalUnits: { $sum: "$items.quantity" }
    }
  },
  { $sort: { "_id.month": -1, totalSalesLKR: -1 } }
]);`}</pre>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                2. Workshop Goldsmith Casting Gold Loss Variance
              </h3>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Yield Tolerance Audit
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
              <pre>{`// Monitors goldsmith bullion issues vs finished piece return weights
db.workshop_orders.aggregate([
  { $match: { status: "completed" } },
  {
    $project: {
      orderNumber: 1,
      workshopName: 1,
      goldIssuedGrams: 1,
      finishedGoldGrams: 1,
      scrapRecoveredGrams: 1,
      netMeltLossGrams: {
        $subtract: [
          "$goldIssuedGrams",
          { $add: ["$finishedGoldGrams", "$scrapRecoveredGrams"] }
        ]
      }
    }
  },
  { $match: { netMeltLossGrams: { $gt: 0.5 } } } // Flags variance exceeding 500mg
]);`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MONGOOSE CODE GENERATOR */}
      {activeTab === 'mongoose' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Mongoose Schemas for Backend Deployment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-use TypeScript schemas from <code className="text-emerald-300 font-mono">/src/models/mongooseSchemas.ts</code>
              </p>
            </div>

            <button
              onClick={handleCopyMongoose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {isCopiedMongoose ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedMongoose ? 'Copied Code!' : 'Copy Schemas'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
            <pre>{MongooseSchemasCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
