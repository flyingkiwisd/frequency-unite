'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createAnonClient } from './client';
import { useAuth } from './AuthProvider';
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
import {
  teamMembers as staticTeamMembers,
  nodes as staticNodes,
  okrs as staticOKRs,
  kpis as staticKPIs,
  governanceDecisions as staticGovernanceDecisions,
  events as staticEvents,
  tasks as staticTasks,
  chatChannels as staticChatChannels,
  chatMessages as staticChatMessages,
  roadmapPhases as staticRoadmapPhases,
} from '@/lib/data';
import {
  fetchTeamMembers,
  fetchNodes,
  fetchOKRs,
  fetchKPIs,
  fetchGovernanceDecisions,
  fetchEvents,
  fetchTasks,
  fetchChatChannels,
  fetchChatMessages,
  fetchRoadmapPhases,
} from './queries';

// ─── Roadmap Phase type (matches queries.ts return) ───
export interface RoadmapPhase {
  id: string;
  name: string;
  subtitle: string;
  timeline: string;
  status: 'active' | 'upcoming' | 'planned';
  milestones: string[];
  color: string;
}

// ─── Data Context Shape ───
export interface FrequencyDataContextType {
  // Data
  teamMembers: TeamMember[];
  nodes: Node[];
  okrs: OKR[];
  kpis: KPI[];
  governanceDecisions: GovernanceDecision[];
  events: FrequencyEvent[];
  tasks: Task[];
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  roadmapPhases: RoadmapPhase[];
  loading: boolean;
  dataSource: 'supabase' | 'static';

  // Mutations — Tasks
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Mutations — OKRs
  updateOKRStatus: (id: string, status: OKR['status']) => Promise<void>;
  updateKeyResultProgress: (okrId: string, krText: string, progress: number) => Promise<void>;

  // Mutations — Governance
  createGovernanceDecision: (decision: Omit<GovernanceDecision, 'id'>) => Promise<void>;

  // Mutations — Events
  updateEvent: (id: string, updates: Partial<FrequencyEvent>) => Promise<void>;

  // Mutations — Nodes
  updateNodeProgress: (id: string, progress: number) => Promise<void>;

  // Mutations — Chat
  sendChatMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;

  // Refresh all data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<FrequencyDataContextType | null>(null);

export function useFrequencyData(): FrequencyDataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useFrequencyData must be used within <DataProvider>');
  return ctx;
}

// ─── Provider ───
export function DataProvider({ children }: { children: ReactNode }) {
  const { supabase } = useAuth();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(staticTeamMembers);
  const [nodes, setNodes] = useState<Node[]>(staticNodes);
  const [okrs, setOKRs] = useState<OKR[]>(staticOKRs);
  const [kpis, setKPIs] = useState<KPI[]>(staticKPIs);
  const [governanceDecisions, setGovernanceDecisions] = useState<GovernanceDecision[]>(staticGovernanceDecisions);
  const [events, setEvents] = useState<FrequencyEvent[]>(staticEvents);
  const [tasks, setTasks] = useState<Task[]>(staticTasks);
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>(staticChatChannels);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(staticChatMessages);
  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhase[]>(staticRoadmapPhases);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'static'>('static');

  // Load all data from Supabase (with static fallback)
  const loadAllData = useCallback(async () => {
    try {
      const [
        teamData,
        nodeData,
        okrData,
        kpiData,
        govData,
        eventData,
        taskData,
        channelData,
        messageData,
        roadmapData,
      ] = await Promise.all([
        fetchTeamMembers().catch(() => { console.warn('Supabase fetch failed:', 'team_members'); return null; }),
        fetchNodes().catch(() => { console.warn('Supabase fetch failed:', 'nodes'); return null; }),
        fetchOKRs().catch(() => { console.warn('Supabase fetch failed:', 'okrs'); return null; }),
        fetchKPIs().catch(() => { console.warn('Supabase fetch failed:', 'kpis'); return null; }),
        fetchGovernanceDecisions().catch(() => { console.warn('Supabase fetch failed:', 'governance_decisions'); return null; }),
        fetchEvents().catch(() => { console.warn('Supabase fetch failed:', 'events'); return null; }),
        fetchTasks().catch(() => { console.warn('Supabase fetch failed:', 'tasks'); return null; }),
        fetchChatChannels().catch(() => { console.warn('Supabase fetch failed:', 'chat_channels'); return null; }),
        fetchChatMessages().catch(() => { console.warn('Supabase fetch failed:', 'chat_messages'); return null; }),
        fetchRoadmapPhases().catch(() => { console.warn('Supabase fetch failed:', 'roadmap_phases'); return null; }),
      ]);

      let fromSupabase = false;

      if (teamData && teamData.length > 0) { setTeamMembers(teamData); fromSupabase = true; }
      if (nodeData && nodeData.length > 0) { setNodes(nodeData); fromSupabase = true; }
      if (okrData && okrData.length > 0) { setOKRs(okrData); fromSupabase = true; }
      if (kpiData && kpiData.length > 0) { setKPIs(kpiData); fromSupabase = true; }
      if (govData && govData.length > 0) { setGovernanceDecisions(govData); fromSupabase = true; }
      if (eventData && eventData.length > 0) { setEvents(eventData); fromSupabase = true; }
      if (taskData && taskData.length > 0) { setTasks(taskData); fromSupabase = true; }
      if (channelData && channelData.length > 0) { setChatChannels(channelData); fromSupabase = true; }
      if (messageData && messageData.length > 0) { setChatMessages(messageData); fromSupabase = true; }
      if (roadmapData && roadmapData.length > 0) { setRoadmapPhases(roadmapData); fromSupabase = true; }

      if (fromSupabase) setDataSource('supabase');
    } catch {
      // Stay with static data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ─── Mutation: Get a writable client (prefer auth'd, fallback to anon) ───
  const getWriteClient = useCallback(() => {
    if (supabase) return supabase;
    return createAnonClient();
  }, [supabase]);

  // ─── Tasks Mutations ───
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const prevTasks = tasks;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    const client = getWriteClient();
    if (!client) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.owner !== undefined) dbUpdates.owner = updates.owner;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.node !== undefined) dbUpdates.node = updates.node;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    if (Object.keys(dbUpdates).length === 0) return;

    try {
      const { error } = await client.from('tasks').update(dbUpdates).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update task, rolling back:', err);
      setTasks(prevTasks);
    }
  }, [tasks, getWriteClient]);

  const createTask = useCallback(async (task: Omit<Task, 'id'>) => {
    const newId = `t-${Date.now()}`;
    const newTask: Task = { id: newId, ...task };
    setTasks(prev => [...prev, newTask]);

    const client = getWriteClient();
    if (!client) return;

    try {
      await client.from('tasks').insert({
        id: newId,
        title: task.title,
        owner: task.owner,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        node: task.node || null,
        category: task.category,
      });
    } catch (err) {
      console.error('Failed to create task in Supabase:', newId, err);
    }
  }, [getWriteClient]);

  const deleteTask = useCallback(async (id: string) => {
    const prevTasks = tasks;
    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== id));

    const client = getWriteClient();
    if (!client) return;

    try {
      const { error } = await client.from('tasks').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete task, rolling back:', err);
      setTasks(prevTasks);
    }
  }, [tasks, getWriteClient]);

  // ─── OKR Mutations ───
  const updateOKRStatus = useCallback(async (id: string, status: OKR['status']) => {
    setOKRs(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    const client = getWriteClient();
    if (!client) return;
    await client.from('okrs').update({ status }).eq('id', id);
  }, [getWriteClient]);

  const updateKeyResultProgress = useCallback(async (okrId: string, krText: string, progress: number) => {
    setOKRs(prev => prev.map(o => {
      if (o.id !== okrId) return o;
      return {
        ...o,
        keyResults: o.keyResults.map(kr =>
          kr.text === krText ? { ...kr, progress } : kr
        ),
      };
    }));
    const client = getWriteClient();
    if (!client) return;
    await client
      .from('okr_key_results')
      .update({ progress })
      .eq('okr_id', okrId)
      .eq('text', krText);
  }, [getWriteClient]);

  // ─── Governance Mutations ───
  const createGovernanceDecision = useCallback(async (decision: Omit<GovernanceDecision, 'id'>) => {
    const newId = `dec-${Date.now()}`;
    const newDecision: GovernanceDecision = { id: newId, ...decision };
    setGovernanceDecisions(prev => [newDecision, ...prev]);

    const client = getWriteClient();
    if (!client) return;
    await client.from('governance_decisions').insert({
      id: newId,
      date: decision.date,
      title: decision.title,
      description: decision.description,
      decided_by: decision.decidedBy,
      impact: decision.impact,
      category: decision.category,
    });
  }, [getWriteClient]);

  // ─── Event Mutations ───
  const updateEvent = useCallback(async (id: string, updates: Partial<FrequencyEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    const client = getWriteClient();
    if (!client) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.highlights !== undefined) dbUpdates.highlights = updates.highlights;
    await client.from('events').update(dbUpdates).eq('id', id);
  }, [getWriteClient]);

  // ─── Node Mutations ───
  const updateNodeProgress = useCallback(async (id: string, progress: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, progress } : n));
    const client = getWriteClient();
    if (!client) return;
    await client.from('nodes').update({ progress }).eq('id', id);
  }, [getWriteClient]);

  // ─── Chat Mutations ───
  const sendChatMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    const newId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = { id: newId, ...message };
    setChatMessages(prev => [...prev, newMsg]);

    const client = getWriteClient();
    if (!client) return;
    await client.from('chat_messages').insert({
      id: newId,
      channel: message.channel,
      sender: message.sender,
      sender_avatar: message.senderAvatar,
      message: message.message,
      timestamp: message.timestamp,
      reactions: message.reactions || [],
    });
  }, [getWriteClient]);

  const value: FrequencyDataContextType = {
    teamMembers,
    nodes,
    okrs,
    kpis,
    governanceDecisions,
    events,
    tasks,
    chatChannels,
    chatMessages,
    roadmapPhases,
    loading,
    dataSource,
    updateTask,
    createTask,
    deleteTask,
    updateOKRStatus,
    updateKeyResultProgress,
    createGovernanceDecision,
    updateEvent,
    updateNodeProgress,
    sendChatMessage,
    refreshData: loadAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
