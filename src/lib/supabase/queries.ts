'use client';

import { createBrowserClient } from '@supabase/ssr';
import type {
  TeamMember,
  Node,
  OKR,
  KPI,
  GovernanceDecision,
  FrequencyEvent,
  Task,
  ChatChannel,
  ChatMessage,
} from '@/lib/data';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Team Members ───

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('team_members').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    shortRole: row.short_role,
    avatar: row.avatar,
    color: row.color,
    roleOneSentence: row.role_one_sentence,
    domains: row.domains,
    kpis: row.kpis,
    nonNegotiables: row.non_negotiables,
    status: row.status,
    tier: row.tier,
    hoursPerWeek: row.hours_per_week,
  }));
}

// ─── Nodes ───

export async function fetchNodes(): Promise<Node[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('nodes').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    icon: row.icon,
    color: row.color,
    gradient: row.gradient,
    purpose: row.purpose,
    capabilities: row.capabilities,
    leads: row.leads,
    status: row.status,
    priority: row.priority,
    progress: row.progress,
  }));
}

// ─── OKRs (with nested key results) ───

export async function fetchOKRs(): Promise<OKR[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('okrs')
    .select('*, okr_key_results(*)');
  if (error) throw error;
  return (data || []).map((okr) => ({
    id: okr.id,
    objective: okr.objective,
    quarter: okr.quarter,
    status: okr.status,
    keyResults: (okr.okr_key_results || [])
      .sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      )
      .map((kr: { text: string; progress: number; owner: string }) => ({
        text: kr.text,
        progress: kr.progress,
        owner: kr.owner,
      })),
  }));
}

// ─── KPIs ───

export async function fetchKPIs(): Promise<KPI[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('kpis').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    value: row.value,
    target: row.target,
    trend: row.trend,
    category: row.category,
  }));
}

// ─── Governance Decisions ───

export async function fetchGovernanceDecisions(): Promise<GovernanceDecision[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('governance_decisions')
    .select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    title: row.title,
    description: row.description,
    decidedBy: row.decided_by,
    impact: row.impact,
    category: row.category,
  }));
}

// ─── Events ───

export async function fetchEvents(): Promise<FrequencyEvent[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('events').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    date: row.date,
    location: row.location,
    description: row.description,
    capacity: row.capacity,
    status: row.status,
    highlights: row.highlights,
  }));
}

// ─── Tasks ───

export async function fetchTasks(): Promise<Task[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    owner: row.owner,
    status: row.status,
    priority: row.priority,
    deadline: row.deadline,
    node: row.node,
    category: row.category,
  }));
}

// ─── Chat Channels ───

export async function fetchChatChannels(): Promise<ChatChannel[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('chat_channels').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    unread: row.unread,
    lastMessage: row.last_message,
  }));
}

// ─── Chat Messages ───

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from('chat_messages').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    channel: row.channel,
    sender: row.sender,
    senderAvatar: row.sender_avatar,
    message: row.message,
    timestamp: row.timestamp,
    reactions: row.reactions,
  }));
}

// ─── Roadmap Phases ───

export async function fetchRoadmapPhases() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('roadmap_phases')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    timeline: row.timeline,
    status: row.status as 'active' | 'upcoming' | 'planned',
    milestones: row.milestones,
    color: row.color,
  }));
}
