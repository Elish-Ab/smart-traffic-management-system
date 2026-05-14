import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, RefreshCw, Search, X, ChevronLeft, ChevronRight,
  Eye, CheckCircle, XCircle, Clock, Car, MapPin, User, Zap,
  Activity, Shield, Gavel, WifiOff, CreditCard, FileText,
  CalendarDays, SlidersHorizontal,
} from 'lucide-react';
import { violationsApi } from '@/api/admin';
import { openViolationFeed } from '@/api/websocket';
import ViolationDetailModal from '@/components/enforcement/ViolationDetailModal';

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
  UNPAID:         { label: 'Unpaid',         cls: 'bg-red-50 text-red-700 border-red-200' },
  PAID:           { label: 'Paid',           cls: 'bg-green-50 text-green-700 border-green-200' },
  PARTIALLY_PAID: { label: 'Partial',        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  WAIVED:         { label: 'Waived',         cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  DISPUTED:       { label: 'Disputed',       cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const DISPUTE_STATUS_STYLE = {
  SUBMITTED:    { label: 'Pending',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Reviewing',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED:     { label: 'Approved',    cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:     { label: 'Rejected',    cls: 'bg-red-50 text-red-700 border-red-200' },
  WITHDRAWN:    { label: 'Withdrawn',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const STATUS_TABS = [
  { key: '',             label: 'All',          icon: Activity,    color: 'text-foreground',  ring: 'ring-foreground/20' },
  { key: 'DETECTED',    label: 'Detected',      icon: Zap,         color: 'text-blue-600',    ring: 'ring-blue-200' },
  { key: 'UNDER_REVIEW',label: 'Under Review',  icon: Clock,       color: 'text-amber-600',   ring: 'ring-amber-200' },
  { key: 'CONFIRMED',   label: 'Confirmed',     icon: CheckCircle, color: 'text-red-600',     ring: 'ring-red-200' },
  { key: 'DISMISSED',   label: 'Dismissed',     icon: XCircle,     color: 'text-gray-500',    ring: 'ring-gray-200' },
];

const fmtShort = (dt) => dt
  ? new Date(dt).toLocaleString('en-ET', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  : '—';

const fmtETB = (n) => (n != null && n !== 0)
  ? `ETB ${parseFloat(n).toLocaleString('en-ET', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  : '—';

// ── Sub-components ────────────────────────────────────────────────────────

function SkeletonRow({ cols }) {
  return (
    <tr className="border-b border-border/40 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 rounded bg-muted" style={{ width: [40,90,130,130,72,68,60,100,80,72,80,36][i] || 60 }} />
        </td>
      ))}
    </tr>
  );
}

function StatusPill({ map, value, placeholder = '—' }) {
  if (!value) return <span className="text-[10px] text-muted-foreground/50">{placeholder}</span>;
  const s = map[value] || { label: value, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

function SummaryCard({ tab, count, isActive, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 text-left w-full transition-all group ${
        isActive
          ? `border-primary/40 bg-primary/5 ring-2 ${tab.ring} shadow-sm`
          : 'border-border bg-card hover:border-primary/20 hover:shadow-sm'
      }`}
    >
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

// ── Main Page ─────────────────────────────────────────────────────────────

export default function ViolationsCenter() {
  const queryClient = useQueryClient();

  // ── Filters ───────────────────────────────────────────────────────────
  const [activeStatus, setActiveStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [source, setSource]     = useState('');
  // Search fields
  const [plateInput, setPlateInput]   = useState('');
  const [nameInput, setNameInput]     = useState('');
  const [generalInput, setGeneralInput] = useState('');
  const [plate, setPlate]             = useState('');
  const [name, setName]               = useState('');
  const [general, setGeneral]         = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [timeFrom, setTimeFrom]       = useState('');
  const [timeTo, setTimeTo]           = useState('');
  const [showSearch, setShowSearch]   = useState(false);
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 20;

  // ── Detail modal ──────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null);

  // ── WebSocket ─────────────────────────────────────────────────────────
  const [wsOk, setWsOk] = useState(false);
  useEffect(() => {
    let ws;
    try {
      ws = openViolationFeed(() => {
        queryClient.invalidateQueries({ queryKey: ['adm-viol'] });
      });
      setWsOk(true);
    } catch { setWsOk(false); }
    return () => { try { ws?.close(); } catch {} };
  }, [queryClient]);

  // ── Debounce typed inputs ─────────────────────────────────────────────
  useEffect(() => { const t = setTimeout(() => setPlate(plateInput.trim()), 350); return () => clearTimeout(t); }, [plateInput]);
  useEffect(() => { const t = setTimeout(() => setName(nameInput.trim()), 350);   return () => clearTimeout(t); }, [nameInput]);
  useEffect(() => { const t = setTimeout(() => setGeneral(generalInput.trim()), 350); return () => clearTimeout(t); }, [generalInput]);

  // ── Reset page on any filter change ──────────────────────────────────
  useEffect(() => { setPage(1); }, [activeStatus, severity, source, plate, name, general, dateFrom, dateTo, timeFrom, timeTo]);

  const buildParams = (extra = {}) => ({
    ...(activeStatus && { status: activeStatus }),
    ...(severity && { severity }),
    ...(source && { source }),
    ...(plate && { plate }),
    ...(name && { search: name }),
    ...(general && !name && { search: general }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo   && { date_to: dateTo }),
    ...extra,
  });

  // ── Per-status counts ─────────────────────────────────────────────────
  const countQueries = STATUS_TABS.map(tab =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['adm-viol-count', tab.key, severity, source, plate, name, general, dateFrom, dateTo],
      queryFn: () => violationsApi.list({ ...buildParams(), ...(tab.key && { status: tab.key }), page_size: 1 })
        .then(r => r.data.count),
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

  const violations  = data?.results ?? [];
  const totalCount  = data?.count   ?? 0;
  const totalPages  = Math.ceil(totalCount / PAGE_SIZE);

  const hasFilters = activeStatus || severity || source || plate || name || general || dateFrom || dateTo || timeFrom || timeTo;
  const clearAll   = () => {
    setActiveStatus(''); setSeverity(''); setSource('');
    setPlateInput(''); setPlate('');
    setNameInput('');  setName('');
    setGeneralInput(''); setGeneral('');
    setDateFrom(''); setDateTo(''); setTimeFrom(''); setTimeTo('');
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3 border-b border-border bg-card/50 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Violations &amp; Enforcement</h1>
              <p className="text-[11px] text-muted-foreground">
                Monitor, review, and act on all traffic violations
              </p>
            </div>
            <div className={`flex items-center gap-1.5 ml-1 px-2 py-1 rounded-full border text-[10px] font-medium ${
              wsOk ? 'bg-green-50 border-green-200 text-green-700' : 'bg-muted border-border text-muted-foreground'
            }`}>
              {wsOk
                ? <><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live</>
                : <><WifiOff className="w-3 h-3" />Offline</>
              }
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

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {STATUS_TABS.map((tab, i) => (
            <SummaryCard
              key={tab.key}
              tab={tab}
              count={countQueries[i].data}
              isActive={activeStatus === tab.key}
              onClick={() => setActiveStatus(a => a === tab.key ? '' : tab.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="px-5 py-3 border-b border-border bg-muted/10 flex-shrink-0 space-y-2.5">
        {/* Top row: always visible */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plate search */}
          <div className="relative">
            <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={plateInput}
              onChange={e => setPlateInput(e.target.value)}
              placeholder="Plate number…"
              className="pl-8 pr-8 py-1.5 text-[11px] w-36 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono placeholder:font-sans placeholder:text-muted-foreground/60 uppercase"
            />
            {plateInput && (
              <button onClick={() => { setPlateInput(''); setPlate(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Name search */}
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Owner / driver name…"
              className="pl-8 pr-8 py-1.5 text-[11px] w-44 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60"
            />
            {nameInput && (
              <button onClick={() => { setNameInput(''); setName(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* General search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={generalInput}
              onChange={e => setGeneralInput(e.target.value)}
              placeholder="Type, location, officer…"
              className="w-full pl-8 pr-8 py-1.5 text-[11px] rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60"
            />
            {generalInput && (
              <button onClick={() => { setGeneralInput(''); setGeneral(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Toggle advanced filters */}
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
              showSearch ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />}
          </button>

          {hasFilters && (
            <button onClick={clearAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* Expanded filter row */}
        {showSearch && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 border-t border-border/50">
            {/* Severity */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-14">Severity</span>
              <div className="flex gap-1">
                {['', 'MINOR', 'MAJOR', 'CRITICAL'].map(s => (
                  <button key={s} onClick={() => setSeverity(s)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                      severity === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}>
                    {s || 'All'}
                  </button>
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
                    }`}>
                    {s.l}
                  </button>
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

      {/* ── Table ── */}
      <div className="flex-1 overflow-hidden flex flex-col px-5 py-3 gap-2.5">
        <div className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-xs min-w-[1100px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/70 border-b border-border">
                {[
                  '#', 'Plate', 'Owner / Driver', 'Violation Type',
                  'Severity', 'Source', 'Location',
                  'Violation Status', 'Payment Status', 'Dispute Status',
                  'Fine Amount', 'Detected At', '',
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
                const rowNum = (page - 1) * PAGE_SIZE + i + 1;
                const vst  = STATUS_STYLE[v.status]       || { label: v.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
                const sev  = SEV_STYLE[v.severity]        || 'bg-gray-100 text-gray-500';
                const displayPerson = v.owner_name || v.driver_name;
                const displayInfo   = v.owner_phone || v.owner_national_id || v.driver_license;

                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`border-b border-border/40 cursor-pointer hover:bg-primary/5 transition-colors group ${
                      selectedId === v.id ? 'bg-primary/5' : i % 2 !== 0 ? 'bg-muted/10' : ''
                    }`}
                  >
                    {/* # */}
                    <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground/70">
                      {String(rowNum).padStart(3, '0')}
                    </td>

                    {/* Plate */}
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold text-sm tracking-widest text-foreground">
                        {v.plate_number}
                      </span>
                    </td>

                    {/* Owner / Driver */}
                    <td className="px-3 py-2.5">
                      {displayPerson ? (
                        <div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-[11px] truncate max-w-[120px]">{displayPerson}</span>
                          </div>
                          {displayInfo && (
                            <p className="text-[10px] text-muted-foreground ml-4 font-mono truncate max-w-[120px]">
                              {displayInfo}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">Unknown</span>
                      )}
                    </td>

                    {/* Violation Type */}
                    <td className="px-3 py-2.5">
                      <div className="max-w-[145px]">
                        <p className="font-medium text-[11px] truncate">{v.violation_type?.name ?? v.type_code ?? '—'}</p>
                        {v.detected_speed && (
                          <p className="text-[10px] text-red-600 font-mono">{v.detected_speed} km/h</p>
                        )}
                      </div>
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
                      <div className="flex items-center gap-1 text-muted-foreground max-w-[130px]">
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

                    {/* Payment / Fine Status */}
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
                        <span className="text-[10px] text-muted-foreground/50">None</span>
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

                    {/* View */}
                    <td className="px-3 py-2.5">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
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
                    }`}>
                    {p}
                  </button>
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

      {/* ── Detail slide-in ── */}
      {selectedId && (
        <ViolationDetailModal violationId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
