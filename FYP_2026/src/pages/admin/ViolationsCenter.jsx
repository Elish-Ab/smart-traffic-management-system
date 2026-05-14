import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, RefreshCw, Search, X, ChevronLeft, ChevronRight,
  Eye, CheckCircle, XCircle, Clock, Car, MapPin, User, Zap,
  Activity, Shield, WifiOff, CalendarDays, SlidersHorizontal,
  ShieldAlert, TrendingUp, DollarSign, Gavel, BarChart2,
  Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { violationsApi, finesApi, disputesApi } from '@/api/admin';
import { openViolationFeed } from '@/api/websocket';
import ViolationDetailModal from '@/components/enforcement/ViolationDetailModal';
import toast from 'react-hot-toast';

// ── Style maps ────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  DETECTED:     { label: 'Detected',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED:    { label: 'Confirmed',    cls: 'bg-red-50 text-red-700 border-red-200' },
  DISMISSED:    { label: 'Dismissed',    cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  SUBMITTED:    { label: 'Submitted',    cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  SYNCED:       { label: 'Synced',       cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  DRAFT:        { label: 'Draft',        cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};
const SEV_STYLE = {
  MINOR:    'bg-sky-50 text-sky-700',
  MAJOR:    'bg-amber-50 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700 font-bold',
};
const FINE_STATUS_STYLE = {
  UNPAID:         { label: 'Unpaid',   cls: 'bg-red-50 text-red-700 border-red-200' },
  PAID:           { label: 'Paid',     cls: 'bg-green-50 text-green-700 border-green-200' },
  PARTIALLY_PAID: { label: 'Partial',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  WAIVED:         { label: 'Waived',   cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  DISPUTED:       { label: 'Disputed', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};
const DISPUTE_STATUS_STYLE = {
  SUBMITTED:    { label: 'Pending',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Reviewing', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED:     { label: 'Approved',  cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:     { label: 'Rejected',  cls: 'bg-red-50 text-red-700 border-red-200' },
  WITHDRAWN:    { label: 'Withdrawn', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};
const STATUS_TABS = [
  { key: '',             label: 'All',          icon: Activity,    color: 'text-foreground',  ringCls: 'ring-foreground/20' },
  { key: 'DETECTED',    label: 'Detected',      icon: Zap,         color: 'text-blue-600',    ringCls: 'ring-blue-200' },
  { key: 'UNDER_REVIEW',label: 'Under Review',  icon: Clock,       color: 'text-amber-600',   ringCls: 'ring-amber-200' },
  { key: 'CONFIRMED',   label: 'Confirmed',     icon: CheckCircle, color: 'text-red-600',     ringCls: 'ring-red-200' },
  { key: 'DISMISSED',   label: 'Dismissed',     icon: XCircle,     color: 'text-gray-500',    ringCls: 'ring-gray-200' },
];

const PAGE_TABS = [
  { id: 'violations', label: 'Violations',    icon: ShieldAlert },
  { id: 'analytics',  label: 'Analytics',     icon: TrendingUp  },
];

const fmtShort = (dt) => dt
  ? new Date(dt).toLocaleString('en-ET', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  : '—';
const fmtETB = (n) => (n != null && n !== 0)
  ? `ETB ${parseFloat(n).toLocaleString('en-ET', { minimumFractionDigits: 0 })}`
  : '—';

// ── Helpers ───────────────────────────────────────────────────────────────
function StatusPill({ map, value, placeholder = '—' }) {
  if (!value) return <span className="text-[10px] text-muted-foreground/40">{placeholder}</span>;
  const s = map[value] || { label: value, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

function SkeletonRow({ cols }) {
  const widths = [36, 88, 130, 140, 72, 68, 60, 100, 80, 72, 80, 36];
  return (
    <tr className="border-b border-border/40 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 rounded bg-muted" style={{ width: widths[i] || 60 }} />
        </td>
      ))}
    </tr>
  );
}

function SummaryCard({ tab, count, isActive, onClick }) {
  const Icon = tab.icon;
  return (
    <button onClick={onClick}
      className={`rounded-xl border p-3 text-left w-full transition-all group ${
        isActive
          ? `border-primary/40 bg-primary/5 ring-2 ${tab.ringCls} shadow-sm`
          : 'border-border bg-card hover:border-primary/20 hover:shadow-sm'
      }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-muted/50 group-hover:bg-primary/5'} transition-colors`}>
          <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
        </div>
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
      </div>
      <p className={`text-xl font-bold font-mono ${tab.color}`}>
        {count ?? <span className="inline-block w-6 h-4 bg-muted rounded animate-pulse" />}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate">{tab.label}</p>
    </button>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { data: disputesData, isLoading: dLoading } = useQuery({
    queryKey: ['analytics-disputes'],
    queryFn: () => disputesApi.list({ page_size: 200 }).then(r => r.data),
    staleTime: 30000,
  });
  const { data: finesData, isLoading: fLoading } = useQuery({
    queryKey: ['analytics-fines'],
    queryFn: () => finesApi.list({ page_size: 200 }).then(r => r.data),
    staleTime: 30000,
  });
  const { data: violData } = useQuery({
    queryKey: ['analytics-violations-all'],
    queryFn: () => violationsApi.list({ page_size: 200 }).then(r => r.data),
    staleTime: 30000,
  });

  const disputes  = disputesData?.results ?? [];
  const fines     = finesData?.results    ?? [];
  const viols     = violData?.results     ?? [];

  const disputeStats = ['SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','WITHDRAWN'].map(s => ({
    name: s.replace('_', ' '), count: disputes.filter(d => d.status === s).length,
  }));
  const fineStats = ['UNPAID','PAID','PARTIALLY_PAID','DISPUTED','WAIVED'].map(s => ({
    name: s.replace('_',' '), count: fines.filter(f => f.status === s).length,
    color: s === 'UNPAID' ? '#ef4444' : s === 'PAID' ? '#22c55e' : s === 'DISPUTED' ? '#f97316' : s === 'WAIVED' ? '#a855f7' : '#f59e0b',
  }));

  // Violations by type (top 8)
  const byType = Object.entries(
    viols.reduce((acc, v) => {
      const name = v.violation_type?.name ?? 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

  // Violations by severity
  const bySeverity = ['CRITICAL','MAJOR','MINOR'].map(s => ({
    name: s, count: viols.filter(v => v.severity === s).length,
    fill: s === 'CRITICAL' ? '#ef4444' : s === 'MAJOR' ? '#f59e0b' : '#38bdf8',
  }));

  const paidTotal   = fines.filter(f => f.status === 'PAID').reduce((s, f) => s + parseFloat(f.amount || 0), 0);
  const unpaidTotal = fines.filter(f => f.status === 'UNPAID').reduce((s, f) => s + parseFloat(f.amount || 0), 0);

  return (
    <div className="space-y-5 px-5 py-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Violations', value: violData?.count ?? '—', icon: ShieldAlert, color: 'text-foreground' },
          { label: 'Total Disputes',   value: disputesData?.count ?? '—', icon: Gavel,    color: 'text-blue-600' },
          { label: 'Collected (ETB)',  value: fmtETB(paidTotal),  icon: DollarSign, color: 'text-green-600' },
          { label: 'Pending Fines',    value: fmtETB(unpaidTotal),icon: DollarSign, color: 'text-red-600'   },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</p>
                <k.icon className={`w-3.5 h-3.5 opacity-60 ${k.color}`} />
              </div>
              <p className={`text-xl font-bold font-mono ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Violations by Type */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-primary" /> Violations by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {byType.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-8">No data</p>
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byType} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>

        {/* Violations by Severity */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" /> Severity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bySeverity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`} labelLine={false} fontSize={10}>
                  {bySeverity.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disputes by Status */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-primary" /> Disputes by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {dLoading
              ? <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
              : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {disputeStats.map(d => (
                    <div key={d.name} className="rounded-xl bg-muted/40 px-3 py-3 text-center border border-border">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">{d.name}</p>
                      <p className="text-2xl font-bold font-mono">{d.count}</p>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Fines Overview */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-primary" /> Fines Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {fLoading
              ? <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
              : (
                <div className="grid grid-cols-2 gap-2">
                  {fineStats.map(f => (
                    <div key={f.name} className="rounded-xl px-3 py-3 text-center border"
                      style={{ backgroundColor: `${f.color}10`, borderColor: `${f.color}30` }}>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">{f.name}</p>
                      <p className="text-2xl font-bold font-mono" style={{ color: f.color }}>{f.count}</p>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function ViolationsCenter() {
  const queryClient = useQueryClient();

  // ── Page tab (violations | analytics) ────────────────────────────────
  const [pageTab, setPageTab] = useState('violations');

  // ── Status filter cards ───────────────────────────────────────────────
  const [activeStatus, setActiveStatus] = useState('');

  // ── Additional filters ────────────────────────────────────────────────
  const [severity, setSeverity] = useState('');
  const [source, setSource]     = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  // ── Search inputs (debounced) ─────────────────────────────────────────
  const [plateInput, setPlateInput]     = useState('');
  const [nameInput, setNameInput]       = useState('');
  const [generalInput, setGeneralInput] = useState('');
  const [plate, setPlate]               = useState('');
  const [name, setName]                 = useState('');
  const [general, setGeneral]           = useState('');

  useEffect(() => { const t = setTimeout(() => setPlate(plateInput.trim()), 350);   return () => clearTimeout(t); }, [plateInput]);
  useEffect(() => { const t = setTimeout(() => setName(nameInput.trim()), 350);     return () => clearTimeout(t); }, [nameInput]);
  useEffect(() => { const t = setTimeout(() => setGeneral(generalInput.trim()), 350); return () => clearTimeout(t); }, [generalInput]);

  // ── Pagination ────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [activeStatus, severity, source, plate, name, general, dateFrom, dateTo]);

  // ── Detail modal ──────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null);

  // ── WebSocket ─────────────────────────────────────────────────────────
  const [wsOk, setWsOk] = useState(false);
  useEffect(() => {
    let ws;
    try {
      ws = openViolationFeed(() => {
        queryClient.invalidateQueries({ queryKey: ['adm-viol'] });
        queryClient.invalidateQueries({ queryKey: ['adm-viol-count'] });
      });
      setWsOk(true);
    } catch { setWsOk(false); }
    return () => { try { ws?.close(); } catch {} };
  }, [queryClient]);

  // ── Query params builder ──────────────────────────────────────────────
  const buildParams = (extra = {}) => ({
    ...(activeStatus && { status: activeStatus }),
    ...(severity     && { severity }),
    ...(source       && { source }),
    ...(plate        && { plate }),
    ...(name         && { search: name }),
    ...(!name && general && { search: general }),
    ...(dateFrom     && { date_from: dateFrom }),
    ...(dateTo       && { date_to: dateTo }),
    ...extra,
  });

  // ── Per-status counts ─────────────────────────────────────────────────
  const countQueries = STATUS_TABS.map(tab =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['adm-viol-count', tab.key, severity, source, plate, name, general, dateFrom, dateTo],
      queryFn: () => violationsApi.list({
        ...buildParams(), ...(tab.key && { status: tab.key }), page_size: 1,
      }).then(r => r.data.count),
      staleTime: 20000,
    })
  );

  // ── Main list ─────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adm-viol', activeStatus, severity, source, plate, name, general, dateFrom, dateTo, page],
    queryFn: () => violationsApi.list({ ...buildParams({ page, page_size: PAGE_SIZE }) }).then(r => r.data),
    staleTime: 10000,
    keepPreviousData: true,
  });

  // ── Quick-action mutation ─────────────────────────────────────────────
  const quickAction = useMutation({
    mutationFn: ({ id, status }) => violationsApi.update(id, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['adm-viol'] });
      queryClient.invalidateQueries({ queryKey: ['adm-viol-count'] });
      if (selectedId) queryClient.invalidateQueries({ queryKey: ['violation-detail', selectedId] });
      toast.success(`Marked as ${status.replace('_', ' ').toLowerCase()}`);
    },
    onError: () => toast.error('Action failed'),
  });

  const violations = data?.results ?? [];
  const totalCount = data?.count   ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasFilters = activeStatus || severity || source || plate || name || general || dateFrom || dateTo;

  const clearAll = () => {
    setActiveStatus(''); setSeverity(''); setSource('');
    setPlateInput(''); setPlate('');
    setNameInput('');  setName('');
    setGeneralInput(''); setGeneral('');
    setDateFrom(''); setDateTo('');
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">

      {/* ── Header + summary cards ── */}
      <div className="px-5 pt-5 pb-3 border-b border-border bg-card/50 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Violations &amp; Enforcement</h1>
              <p className="text-[11px] text-muted-foreground">
                Monitor, review, and enforce all traffic violations
              </p>
            </div>
            <div className={`flex items-center gap-1.5 ml-1 px-2 py-1 rounded-full border text-[10px] font-medium ${
              wsOk ? 'bg-green-50 border-green-200 text-green-700' : 'bg-muted border-border text-muted-foreground'
            }`}>
              {wsOk
                ? <><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live</>
                : <><WifiOff className="w-3 h-3" />Offline</>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono tabular-nums">
              {totalCount.toLocaleString()} violations
            </Badge>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5"
              onClick={() => { refetch(); queryClient.invalidateQueries({ queryKey: ['adm-viol-count'] }); }}
              disabled={isFetching}>
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {STATUS_TABS.map((tab, i) => (
            <SummaryCard key={tab.key} tab={tab} count={countQueries[i].data}
              isActive={activeStatus === tab.key}
              onClick={() => { setActiveStatus(a => a === tab.key ? '' : tab.key); setPageTab('violations'); }} />
          ))}
        </div>

        {/* Page tabs */}
        <div className="flex border-b border-border -mb-3 gap-0">
          {PAGE_TABS.map(tab => (
            <button key={tab.id} onClick={() => setPageTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                pageTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Analytics Tab ── */}
      {pageTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto">
          <AnalyticsTab />
        </div>
      )}

      {/* ── Violations Tab ── */}
      {pageTab === 'violations' && (
        <>
          {/* Search & filters */}
          <div className="px-5 py-3 border-b border-border bg-muted/10 flex-shrink-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Plate */}
              <div className="relative">
                <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input value={plateInput} onChange={e => setPlateInput(e.target.value)}
                  placeholder="Plate number…"
                  className="pl-8 pr-7 py-1.5 text-[11px] w-36 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono placeholder:font-sans placeholder:text-muted-foreground/60 uppercase" />
                {plateInput && (
                  <button onClick={() => { setPlateInput(''); setPlate(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Name */}
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                  placeholder="Owner / driver name…"
                  className="pl-8 pr-7 py-1.5 text-[11px] w-44 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60" />
                {nameInput && (
                  <button onClick={() => { setNameInput(''); setName(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* General */}
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input value={generalInput} onChange={e => setGeneralInput(e.target.value)}
                  placeholder="Type, location, officer…"
                  className="w-full pl-8 pr-7 py-1.5 text-[11px] rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60" />
                {generalInput && (
                  <button onClick={() => { setGeneralInput(''); setGeneral(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <button onClick={() => setShowFilters(s => !s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                  showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted text-muted-foreground'
                }`}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />}
              </button>

              {hasFilters && (
                <button onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 border-t border-border/50">
                {/* Severity */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-14">Severity</span>
                  <div className="flex gap-1">
                    {['', 'MINOR', 'MAJOR', 'CRITICAL'].map(s => (
                      <button key={s} onClick={() => setSeverity(s)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                          severity === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}>{s || 'All'}</button>
                    ))}
                  </div>
                </div>
                {/* Source */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-14">Source</span>
                  <div className="flex gap-1">
                    {[{ v: '', l: 'All' }, { v: 'AI_DETECTION', l: '🤖 AI' }, { v: 'OFFICER_FIELD', l: '👮 Officer' }].map(s => (
                      <button key={s.v} onClick={() => setSource(s.v)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                          source === s.v ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}>{s.l}</button>
                    ))}
                  </div>
                </div>
                {/* Date range */}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">From</span>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="text-[10px] rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  <span className="text-[10px] text-muted-foreground">To</span>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="text-[10px] rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40" />
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden flex flex-col px-5 py-3 gap-2.5">
            <div className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-xs min-w-[1120px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/70 border-b border-border">
                    {[
                      '#', 'Plate', 'Owner / Driver', 'Violation Type',
                      'Sev.', 'Source', 'Location',
                      'Status', 'Payment', 'Dispute',
                      'Fine', 'Detected At', 'Actions',
                    ].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={13} />)}

                  {!isLoading && violations.length === 0 && (
                    <tr>
                      <td colSpan={13} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Shield className="w-10 h-10 opacity-20" />
                          <p className="text-sm font-medium">No violations found</p>
                          {hasFilters && (
                            <button onClick={clearAll} className="text-xs text-primary hover:underline">
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {violations.map((v, i) => {
                    const rowNum  = (page - 1) * PAGE_SIZE + i + 1;
                    const vst     = STATUS_STYLE[v.status] || { label: v.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
                    const sev     = SEV_STYLE[v.severity]  || 'bg-gray-100 text-gray-500';
                    const person  = v.owner_name || v.driver_name;
                    const personSub = v.owner_phone || v.owner_national_id || v.driver_license;
                    const isPending = quickAction.isPending && quickAction.variables?.id === v.id;

                    return (
                      <tr key={v.id}
                        onClick={() => setSelectedId(v.id)}
                        className={`border-b border-border/40 cursor-pointer hover:bg-primary/5 transition-colors group ${
                          selectedId === v.id ? 'bg-primary/5' : i % 2 !== 0 ? 'bg-muted/10' : ''
                        }`}>

                        {/* # */}
                        <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground/60">
                          {String(rowNum).padStart(3, '0')}
                        </td>

                        {/* Plate */}
                        <td className="px-3 py-2.5">
                          <span className="font-mono font-bold text-[13px] tracking-widest">{v.plate_number}</span>
                        </td>

                        {/* Owner / Driver */}
                        <td className="px-3 py-2.5">
                          {person ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium text-[11px] truncate max-w-[115px]">{person}</span>
                              </div>
                              {personSub && (
                                <p className="text-[10px] text-muted-foreground ml-4 font-mono truncate max-w-[115px]">{personSub}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40">Unknown</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-[11px] truncate max-w-[135px]">
                            {v.violation_type?.name ?? v.type_code ?? '—'}
                          </p>
                          {v.detected_speed && (
                            <p className="text-[10px] text-red-600 font-mono">{v.detected_speed} km/h</p>
                          )}
                        </td>

                        {/* Severity */}
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sev}`}>
                            {v.severity}
                          </span>
                        </td>

                        {/* Source */}
                        <td className="px-3 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
                          {v.source === 'AI_DETECTION' ? '🤖 AI' : '👮 Officer'}
                        </td>

                        {/* Location */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1 text-muted-foreground max-w-[120px]">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate text-[11px]">{v.location_name || '—'}</span>
                          </div>
                        </td>

                        {/* Violation Status */}
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${vst.cls}`}>
                            {vst.label}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="px-3 py-2.5">
                          <StatusPill map={FINE_STATUS_STYLE} value={v.fine_status} placeholder="No fine" />
                        </td>

                        {/* Dispute Status */}
                        <td className="px-3 py-2.5">
                          {v.dispute_count > 0 ? (
                            <div className="flex items-center gap-1">
                              <StatusPill map={DISPUTE_STATUS_STYLE} value={v.dispute_status} />
                              {v.dispute_count > 1 && (
                                <span className="text-[9px] text-muted-foreground">×{v.dispute_count}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40">None</span>
                          )}
                        </td>

                        {/* Fine Amount */}
                        <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {fmtETB(v.fine_amount)}
                        </td>

                        {/* Detected At */}
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                          {fmtShort(v.detected_at)}
                        </td>

                        {/* Quick Actions */}
                        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Detail */}
                            <button title="View Details"
                              onClick={() => setSelectedId(v.id)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* Confirm (only when DETECTED or UNDER_REVIEW) */}
                            {['DETECTED','UNDER_REVIEW'].includes(v.status) && (
                              <button title="Confirm Violation" disabled={isPending}
                                onClick={() => quickAction.mutate({ id: v.id, status: 'CONFIRMED' })}
                                className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors disabled:opacity-40">
                                {isPending && quickAction.variables?.status === 'CONFIRMED'
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {/* Under Review (only when DETECTED) */}
                            {v.status === 'DETECTED' && (
                              <button title="Send to Review" disabled={isPending}
                                onClick={() => quickAction.mutate({ id: v.id, status: 'UNDER_REVIEW' })}
                                className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors disabled:opacity-40">
                                {isPending && quickAction.variables?.status === 'UNDER_REVIEW'
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Clock className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {/* Dismiss (not if already dismissed) */}
                            {v.status !== 'DISMISSED' && (
                              <button title="Dismiss" disabled={isPending}
                                onClick={() => quickAction.mutate({ id: v.id, status: 'DISMISSED' })}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors disabled:opacity-40">
                                {isPending && quickAction.variables?.status === 'DISMISSED'
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <XCircle className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between flex-shrink-0">
              <p className="text-[11px] text-muted-foreground">
                {totalCount > 0
                  ? <>Showing <b>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)}</b> of <b>{totalCount.toLocaleString()}</b>{hasFilters ? ' (filtered)' : ''}</>
                  : 'No results'}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const p = totalPages <= 7 ? i + 1
                      : page <= 4 ? i + 1
                      : page >= totalPages - 3 ? totalPages - 6 + i
                      : page - 3 + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-colors ${
                          p === page ? 'bg-primary text-white' : 'border border-border hover:bg-muted text-muted-foreground'
                        }`}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Detail slide-in */}
      {selectedId && (
        <ViolationDetailModal violationId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
