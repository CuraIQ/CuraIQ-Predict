import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInventory, restockInventory, type InventoryResponse } from '../api/endpoints';
import { FlaskConical, TrendingDown, AlertTriangle, CheckCircle2, Plus, Search, RefreshCw, X } from 'lucide-react';

const getStatus = (item: InventoryResponse) => {
  if (item.stock_level === 0)
    return { label: 'CRITICAL', class: 'bg-red-950/50 text-red-300 border-red-800', color: 'red' };
  if (item.stock_level < item.critical_threshold)
    return { label: 'WARNING', class: 'bg-amber-950/50 text-amber-300 border-amber-800', color: 'amber' };
  return { label: 'OK', class: 'bg-emerald-950/50 text-emerald-300 border-emerald-800', color: 'emerald' };
};

const getBarColor = (item: InventoryResponse) => {
  if (item.stock_level === 0) return 'bg-red-500';
  if (item.stock_level < item.critical_threshold) return 'bg-amber-500';
  return 'bg-emerald-500';
};

export const InventoryIntelligence: React.FC = () => {
  const [search, setSearch] = useState('');
  const [restockItem, setRestockItem] = useState<InventoryResponse | null>(null);
  const [restockAmount, setRestockAmount] = useState(100);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
    refetchInterval: 15000,
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      restockInventory(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setRestockItem(null);
    },
  });

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const critical = items.filter((i) => i.stock_level === 0).length;
  const warning = items.filter(
    (i) => i.stock_level > 0 && i.stock_level < i.critical_threshold
  ).length;
  const healthy = items.filter((i) => i.stock_level >= i.critical_threshold).length;

  const formatStockout = (d: string | null) => {
    if (!d) return <span className="text-slate-500">N/A</span>;
    const diff = new Date(d).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return <span className="text-red-400 font-bold">DEPLETED</span>;
    if (days <= 3) return <span className="text-red-400 font-bold">{days}d (URGENT)</span>;
    if (days <= 7) return <span className="text-amber-400">{days}d (Soon)</span>;
    return <span className="text-slate-400">{days}d</span>;
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            Pharmacy & Inventory Intelligence
          </div>
          <h1 className="text-2xl font-extrabold text-white">Stock Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-forecasted stock levels, burn rates, and automated reorder triggers
          </p>
        </div>
        <button
          id="refresh-inventory"
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: items.length, icon: FlaskConical, iconClass: 'text-blue-400', bg: 'border-blue-900/50 bg-blue-950/20' },
          { label: 'Critical (0 Stock)', value: critical, icon: AlertTriangle, iconClass: 'text-red-400', bg: 'border-red-900/50 bg-red-950/20' },
          { label: 'Below Threshold', value: warning, icon: TrendingDown, iconClass: 'text-amber-400', bg: 'border-amber-900/50 bg-amber-950/20' },
          { label: 'Healthy Stock', value: healthy, icon: CheckCircle2, iconClass: 'text-emerald-400', bg: 'border-emerald-900/50 bg-emerald-950/20' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`border rounded-2xl p-5 ${card.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                <Icon className={`w-4 h-4 ${card.iconClass}`} />
              </div>
              <p className={`text-3xl font-extrabold ${card.iconClass}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <input
          id="inventory-search"
          type="text"
          placeholder="Search medicines & supplies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  {['Item / Medicine', 'Stock Level', 'Threshold', 'Burn Rate', 'Stockout In', 'Status', 'Action'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((item) => {
                  const status = getStatus(item);
                  const barColor = getBarColor(item);
                  const maxBar = Math.max(item.stock_level, item.critical_threshold * 2, 1);
                  const barPct = Math.min(100, (item.stock_level / maxBar) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{item.name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-20">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all`}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-bold ${
                              status.color === 'red'
                                ? 'text-red-400'
                                : status.color === 'amber'
                                ? 'text-amber-400'
                                : 'text-white'
                            }`}
                          >
                            {item.stock_level}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-400">{item.critical_threshold}</td>
                      <td className="px-4 py-4 text-slate-400">{item.burn_rate_per_day}/day</td>
                      <td className="px-4 py-4">{formatStockout(item.forecasted_stockout_date)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${status.class}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          id={`restock-${item.id}`}
                          onClick={() => {
                            setRestockItem(item);
                            setRestockAmount(100);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          <Plus className="w-3 h-3" /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Restock Modal ────────────────────────────────────────────── */}
      {restockItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Restock Item</h3>
              <button
                onClick={() => setRestockItem(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-1">Item</p>
            <p className="font-semibold text-white mb-4">{restockItem.name}</p>
            <p className="text-sm text-slate-400 mb-2">
              Current Stock: <span className="text-white font-bold">{restockItem.stock_level}</span>
            </p>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Restock Amount</label>
            <input
              id="restock-amount"
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none mb-4 text-sm"
            />
            <p className="text-xs text-slate-500 mb-4">
              New total will be:{' '}
              <span className="text-emerald-400 font-bold">
                {restockItem.stock_level + restockAmount}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestockItem(null)}
                className="flex-1 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                id="confirm-restock"
                onClick={() =>
                  restockMutation.mutate({ id: restockItem.id, amount: restockAmount })
                }
                disabled={restockMutation.isPending}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60"
              >
                {restockMutation.isPending ? 'Processing...' : 'Confirm Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
