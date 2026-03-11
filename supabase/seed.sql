-- ============================================================
-- Frequency Unite — Seed Data
-- Run this AFTER schema.sql to populate all reference tables
-- ============================================================

-- ─── Team Members (14) ───

INSERT INTO team_members (id, name, role, short_role, avatar, color, role_one_sentence, domains, kpis, non_negotiables, status, tier, hours_per_week) VALUES
(
  'james',
  'James Hodges',
  'Founder & Executive Chair',
  'Founder',
  'JH',
  'bg-amber-500',
  'Founder, strategic vision-holder, and bridge between Frequency''s being and doing hemispheres.',
  ARRAY['Strategic vision and North Star stewardship', 'Board governance and leadership council', 'Capital strategy and DAF architecture', 'Amphibian Capital bridge and fundraising', 'Culture and coherence tone-setting'],
  ARRAY['144 well-stewards by year-end', '$2M 2026 revenue target', 'CEO hire post-Blue Spirit', 'DAF structure operational'],
  ARRAY['Coherence before action', 'Systems change, not extraction', 'Transparency with humility'],
  'active',
  'core-team',
  '5-15'
),
(
  'sian',
  'Sian Hodges',
  'Interim COO',
  'COO',
  'SH',
  'bg-rose-400',
  'Only full-time ops person — stabilizes membership operations, cash forecasting, and team coordination.',
  ARRAY['Day-to-day operations and membership management', 'Event logistics and coordination', 'Cash forecasting and budget tracking', 'Team scheduling and communication', 'Member onboarding and retention'],
  ARRAY['85%+ member retention', 'Operations running without heroics', 'Event logistics on-budget', 'Member NPS 9+'],
  ARRAY['Sustainable operations pace', 'Member experience excellence', 'Clear communication cadence'],
  'active',
  'core-team',
  '40'
),
(
  'fairman',
  'Alex James Fairman',
  'Co-Founder & Strategic Architect',
  'Strategic Architect',
  'AF',
  'bg-violet-500',
  'Co-founder and strategic integration lead — VP of Doing, thesis architecture, and node ecosystem design.',
  ARRAY['Strategic integration across all nodes', 'Thesis of Change architecture', 'Map Node design and platform vision', 'Deal flow curation and project diligence', 'DAF and holdco structure design'],
  ARRAY['Thesis framework operational', 'Map Node MVP launched', '3-5 geoships identified and funded', 'Node coordination flowing'],
  ARRAY['Systemic thinking over quick fixes', 'Coherence of vision across nodes', 'Regeneration, not extraction'],
  'active',
  'core-team',
  '15-20'
),
(
  'max',
  'Maximillian',
  'Strategic Enrollment',
  'Enrollment',
  'MX',
  'bg-sky-400',
  'Leads membership enrollment pipeline — identifying, attracting, and onboarding exceptional well-stewards.',
  ARRAY['Membership enrollment pipeline', 'Prospect identification and outreach', 'Essence interviews for new members', 'Enrollment strategy and conversion'],
  ARRAY['25-30+ new well-stewards at events', 'Pipeline of qualified prospects', 'Enrollment conversion rate'],
  ARRAY['Quality over quantity in membership', 'Authentic connection in outreach'],
  'active',
  'core-team',
  '5-10'
),
(
  'dave',
  'Dave Weale',
  'Board Member & Pods/Culture',
  'Board & Culture',
  'DW',
  'bg-emerald-500',
  'Board member leading pods and culture infrastructure — creating containers for deep member engagement.',
  ARRAY['Pod facilitation and design', 'Culture infrastructure', 'Member engagement touchpoints', 'Board governance'],
  ARRAY['Active pods with consistent attendance', 'Member engagement between events', 'Culture health indicators'],
  ARRAY['Space for authentic connection', 'Both being and doing honored'],
  'active',
  'board',
  '5-10'
),
(
  'andrew',
  'Andrew',
  'Culture & Coherence Lead',
  'Coherence',
  'AN',
  'bg-purple-500',
  'Leads culture and coherence work — ensuring alignment, embodiment, and integration practices across the community.',
  ARRAY['Coherence practices and rituals', 'Cultural alignment facilitation', 'Inner work and embodiment leadership', 'Gender balance and integration'],
  ARRAY['Coherence score across events', 'Integration of practices into operations', 'Community alignment indicators'],
  ARRAY['Inner work is non-negotiable', 'Masculine/feminine balance', 'Coherence before strategy'],
  'active',
  'core-team',
  'Surgical'
),
(
  'felicia',
  'Felicia Isabella',
  'Culture & Coherence',
  'Culture',
  'FI',
  'bg-pink-400',
  'Co-leads culture and coherence alongside Andrew — holding space for the feminine wisdom and embodied practice.',
  ARRAY['Feminine leadership and wisdom', 'Community coherence practices', 'Event ceremony and ritual', 'Women''s Council support'],
  ARRAY['Depth of coherence at events', 'Feminine voice integration'],
  ARRAY['Embodied practice over theory', 'Receptivity and witnessing'],
  'active',
  'core-team',
  'Surgical'
),
(
  'mafe',
  'Mafe',
  'PM & Virtual Assistant',
  'PM/VA',
  'MF',
  'bg-teal-400',
  'Project management and operations support — Airtable, communications, and coordination backbone.',
  ARRAY['Airtable management and tracking', 'Email campaigns and communications', 'Project management support', 'Administrative coordination'],
  ARRAY['Systems running smoothly', 'Communications on schedule', 'Data accuracy in Airtable'],
  ARRAY['Reliable execution', 'Clear documentation'],
  'active',
  'core-team',
  '20'
),
(
  'colleen',
  'Colleen Galbraith',
  'DAF & Financial Stewardship',
  'DAF Steward',
  'CG',
  'bg-amber-400',
  'Leads DAF structure and financial stewardship — ensuring funds flow with integrity to mission-aligned projects.',
  ARRAY['DAF administration and compliance', 'Financial stewardship and reporting', 'Donor relations and acknowledgment', 'Fund deployment oversight'],
  ARRAY['DAF operational and compliant', 'Donor acknowledgment within compliance', 'Fund deployment aligned with thesis'],
  ARRAY['Financial transparency', 'Compliance-first approach'],
  'active',
  'core-team',
  '5-10'
),
(
  'greg',
  'Greg Berry',
  'Capital Node Lead',
  'Capital Lead',
  'GB',
  'bg-green-500',
  'Leads the Capital Node — evaluating deal flow, investor relations, and project scoring for fund deployment.',
  ARRAY['Deal flow evaluation and scoring', 'Capital deployment strategy', 'Investor relations', 'Project diligence facilitation'],
  ARRAY['Deal flow quality and quantity', 'Project scoring accuracy', 'Capital deployed to aligned projects'],
  ARRAY['Rigorous diligence', 'Mission alignment over returns'],
  'active',
  'node-lead',
  '5-10'
),
(
  'gareth',
  'Gareth Hermann',
  'Bioregions Node Lead',
  'Bioregions',
  'GH',
  'bg-lime-500',
  'Leads the Bioregions Node — pioneering community regeneration starting with the Nicoya Blue Zone pilot.',
  ARRAY['Bioregional initiative design', 'Nicoya pilot program', 'Local community partnerships', 'Regenerative development models'],
  ARRAY['Nicoya pilot showing progress', 'Community engagement metrics', 'Replicable bioregion model'],
  ARRAY['Local empowerment first', 'Harmony with nature', 'Community-led, not imposed'],
  'active',
  'node-lead',
  '10-15'
),
(
  'raamayan',
  'Raamayan Ananda',
  'Megaphone Node Lead',
  'Megaphone',
  'RA',
  'bg-orange-500',
  'Leads the Megaphone Node — cultural narrative, movement building, distribution, and the Anthem crown jewel.',
  ARRAY['Cultural narrative and storytelling', 'Movement building and distribution', 'Anthem project leadership', 'Culture Studios and AI integration', 'Partner network (Live Nation, etc.)'],
  ARRAY['Distribution capacity built', 'Anthem progress and impact', 'Cultural narrative reach'],
  ARRAY['Authentic storytelling', 'Movement over marketing'],
  'active',
  'node-lead',
  '10-15'
),
(
  'sarah',
  'Sarah Speers',
  'School of Energy',
  'Energy',
  'SS',
  'bg-indigo-400',
  'Leads The School of Energy — educational programming and energetic practices within the community.',
  ARRAY['Educational programming', 'Energetic practices and workshops', 'Community learning facilitation'],
  ARRAY['Program engagement', 'Member learning outcomes'],
  ARRAY['Embodied education', 'Integrity of practice'],
  'active',
  'member',
  '5-10'
),
(
  'nipun',
  'Nipun',
  'Bookkeeper',
  'Finance',
  'NP',
  'bg-slate-400',
  'Long-standing bookkeeper (10-year relationship) — keeps the financial books accurate and clean.',
  ARRAY['Bookkeeping and accounting', 'Financial record management', 'Tax preparation support'],
  ARRAY['Books clean and current', 'Timely financial reports'],
  ARRAY['Accuracy above all'],
  'active',
  'core-team',
  '5'
);


-- ─── Nodes (6) ───

INSERT INTO nodes (id, name, short_name, icon, color, gradient, purpose, capabilities, leads, status, priority, progress) VALUES
(
  'map',
  'Map Node',
  'Map',
  'Globe',
  'text-violet-400',
  'from-violet-500/10 to-indigo-500/10',
  'Create the ecosystem infrastructure — coordination layer, deal intelligence platform, and architecture enabling all other work.',
  ARRAY['Ecosystem mapping and coordination', 'Deal intelligence platform', 'Project tracking and scoring', 'Cross-node integration layer', 'AI-powered ecosystem analysis'],
  ARRAY['fairman'],
  'active',
  'critical',
  35
),
(
  'bioregions',
  'Bioregions Node',
  'Bioregions',
  'TreePine',
  'text-emerald-400',
  'from-emerald-500/10 to-green-500/10',
  'Inspire communities to flourish in harmony with nature — pioneering bioregional regeneration starting with Nicoya Blue Zone.',
  ARRAY['Community regeneration design', 'Nicoya Blue Zone pilot (Costa Rica)', 'Nosara School partnerships', 'Local empowerment frameworks', 'Replicable bioregion templates'],
  ARRAY['gareth'],
  'pilot',
  'high',
  20
),
(
  'capital',
  'Capital Node',
  'Capital',
  'Gem',
  'text-amber-400',
  'from-amber-500/10 to-yellow-500/10',
  'Evaluate, select, and deploy capital to the highest-impact projects aligned with the thesis of change.',
  ARRAY['Deal flow evaluation and scoring', 'Rubric-based project selection (15-30+ score)', 'Investor relations and LP engagement', 'Diligence framework (3-5 finalists per event)', 'DAF deployment oversight'],
  ARRAY['greg', 'james'],
  'active',
  'critical',
  40
),
(
  'megaphone',
  'Megaphone Node',
  'Megaphone',
  'Megaphone',
  'text-orange-400',
  'from-orange-500/10 to-red-500/10',
  'Cultural narrative, movement building, and distribution — amplifying the signal of regeneration through story, music, and media.',
  ARRAY['Anthem project (crown jewel)', 'Cultural narrative and storytelling', 'Distribution and aggregation layer', 'Intelligence layer (Culture Studios, AI, Beam)', 'Venture agency partnerships'],
  ARRAY['raamayan'],
  'building',
  'high',
  25
),
(
  'capitalism2',
  'Capitalism 2.0 Node',
  'Cap 2.0',
  'Sprout',
  'text-teal-400',
  'from-teal-500/10 to-cyan-500/10',
  'Design new economic paradigm models — DECO frameworks, regenerative finance structures, and dharmic capitalism in practice.',
  ARRAY['DECO (Donor Equity Conversion Option) framework', 'Regenerative finance model design', 'Holdco and SPV architecture', 'New economic paradigm research', 'Impact-first investment structures'],
  ARRAY['fairman', 'james'],
  'building',
  'medium',
  15
),
(
  'thesis',
  'Thesis of Change',
  'Thesis',
  'BookOpen',
  'text-purple-400',
  'from-purple-500/10 to-fuchsia-500/10',
  'Define how systems change happens — the intellectual and spiritual backbone guiding all Frequency investments and actions.',
  ARRAY['Systems Transformation Council facilitation', 'Geoship identification framework', 'Thesis documentation and evolution', 'Cross-node alignment on change theory', 'Research and knowledge synthesis'],
  ARRAY['fairman'],
  'active',
  'critical',
  45
);


-- ─── OKRs (5) ───

INSERT INTO okrs (id, objective, quarter, status) VALUES
('okr-1', 'Build community of 144 deeply coherent well-stewards unified around systems change', 'H1 2026', 'on-track'),
('okr-2', 'Operationalize the DAF and deploy first capital to mission-aligned projects', 'H1 2026', 'at-risk'),
('okr-3', 'Activate all 6 nodes with clear leads, OKRs, and visible progress', 'H1 2026', 'at-risk'),
('okr-4', 'Execute Blue Spirit event that deepens coherence and accelerates momentum', 'Q3 2026', 'on-track'),
('okr-5', 'Stabilize operations and transition from heroics to systems', 'H1 2026', 'on-track');


-- ─── OKR Key Results ───

-- okr-1 key results
INSERT INTO okr_key_results (okr_id, text, progress, owner, sort_order) VALUES
('okr-1', 'Reach 144 active well-stewards by December 2026', 45, 'james', 0),
('okr-1', 'Achieve 85%+ member retention rate', 60, 'sian', 1),
('okr-1', 'Onboard 25-30+ new well-stewards at Blue Spirit', 10, 'max', 2),
('okr-1', 'Launch 6+ active pods with consistent attendance', 30, 'dave', 3);

-- okr-2 key results
INSERT INTO okr_key_results (okr_id, text, progress, owner, sort_order) VALUES
('okr-2', 'DAF structure fully operational and compliant', 50, 'colleen', 0),
('okr-2', 'Raise $500K-$1M in DAF contributions', 20, 'james', 1),
('okr-2', 'Select and fund 3-5 geoship projects through diligence', 15, 'greg', 2),
('okr-2', 'DECO framework documented and ready for first deployment', 25, 'fairman', 3);

-- okr-3 key results
INSERT INTO okr_key_results (okr_id, text, progress, owner, sort_order) VALUES
('okr-3', 'Each node has a designated lead and quarterly OKRs', 55, 'fairman', 0),
('okr-3', 'Map Node MVP operational as coordination layer', 30, 'fairman', 1),
('okr-3', 'Megaphone Node cranking with distribution capacity', 20, 'raamayan', 2),
('okr-3', 'Bioregions Nicoya pilot showing measurable community impact', 15, 'gareth', 3);

-- okr-4 key results
INSERT INTO okr_key_results (okr_id, text, progress, owner, sort_order) VALUES
('okr-4', 'Blue Spirit sells out (50-80 participants)', 10, 'sian', 0),
('okr-4', 'NPS of 9.3+ (matching or exceeding prior events)', 0, 'sian', 1),
('okr-4', 'At least 3 deal presentations with community vote', 5, 'greg', 2),
('okr-4', 'Post-event: CEO candidate identified and in conversation', 0, 'james', 3);

-- okr-5 key results
INSERT INTO okr_key_results (okr_id, text, progress, owner, sort_order) VALUES
('okr-5', 'Monthly burn stable at $22-25K (core team)', 70, 'sian', 0),
('okr-5', 'Cash runway visible for 12+ months', 45, 'nipun', 1),
('okr-5', 'Decision log maintained for every council meeting', 35, 'james', 2),
('okr-5', 'Hire or identify CEO candidate by Q3 2026', 5, 'james', 3);


-- ─── KPIs (10) ───

INSERT INTO kpis (id, name, value, target, trend, category) VALUES
('kpi-1', 'Well-Stewards', '~65', '144', 'up', 'Membership'),
('kpi-2', 'Member Retention', '78%', '85%+', 'up', 'Membership'),
('kpi-3', 'Monthly Burn (Core)', '$22K', '$25K cap', 'flat', 'Financial'),
('kpi-4', '2026 Revenue', '$180K', '$2M', 'up', 'Financial'),
('kpi-5', 'DAF Raised', '$85K', '$500K-$1M', 'up', 'Financial'),
('kpi-6', 'Active Nodes', '4/6', '6/6', 'up', 'Operations'),
('kpi-7', 'Event NPS', '9.3', '9.5', 'flat', 'Community'),
('kpi-8', 'Projects Funded', '2', '5', 'up', 'Impact'),
('kpi-9', 'Team Size', '14', '18', 'up', 'Operations'),
('kpi-10', 'Coherence Rating', '7.2/10', '8.5/10', 'up', 'Community');


-- ─── Governance Decisions (7) ───

INSERT INTO governance_decisions (id, date, title, description, decided_by, impact, category) VALUES
(
  'dec-1',
  '2026-02-02',
  'Teal Governance Model Adopted',
  'Moved from Green-stage consensus to Teal governance with responsibility-weighted voice, decision logs required for every meeting, and subsidiarity principle.',
  'Wisdom Council',
  'high',
  'governance'
),
(
  'dec-2',
  '2026-01-30',
  'DAF Structure Approved',
  'Approved Donor-Advised Fund structure with DECO framework for project investments. Holdco (Delaware LLC) established for equity management.',
  'Board + Leadership Council',
  'high',
  'financial'
),
(
  'dec-3',
  '2026-02-15',
  'Membership Pricing Finalized',
  'Individual membership set at $1,200/month, couple at $1,700/month. Tax-deductible as 501(c)(3) contribution.',
  'Core Stewardship Team',
  'high',
  'membership'
),
(
  'dec-4',
  '2026-02-20',
  'Two-Hemisphere Operating Model',
  'Formalized the Right Side (Being/Nonprofit) and Left Side (Doing/Capital) model with Board + Leadership Council as integration center.',
  'Leadership Council',
  'high',
  'governance'
),
(
  'dec-5',
  '2026-03-01',
  'Blue Spirit July 2026 Confirmed',
  'Blue Spirit 6.0 confirmed for July 18, 2026 in Nosara, Costa Rica. Budget allocated. Registration to open in April.',
  'Core Stewardship Team',
  'medium',
  'strategy'
),
(
  'dec-6',
  '2026-03-05',
  'CEO Search to Begin Post-Blue Spirit',
  'Agreed to formally begin CEO search after Blue Spirit event. James transitions from exec chair to strategic advisor role.',
  'Board',
  'high',
  'strategy'
),
(
  'dec-7',
  '2026-02-10',
  'Node Lead Accountability Framework',
  'Each node lead required to submit quarterly OKRs, monthly progress updates, and participate in bi-weekly node sync calls.',
  'Core Stewardship Team',
  'medium',
  'node'
);


-- ─── Events (4) ───

INSERT INTO events (id, name, date, location, description, capacity, status, highlights) VALUES
(
  'evt-1',
  'Beyul 4.0',
  'June 2025',
  'Boulder, CO',
  'Vision alignment and community building gathering. Set the stage for 2026 governance evolution.',
  '60 attendees',
  'completed',
  ARRAY['Vision 2026 framework established', 'Governance charter initial draft', 'New member essence interviews', '9.1/10 NPS score']
),
(
  'evt-2',
  'Cabo 5.0',
  'January 26 - February 2, 2026',
  'El Ganzo, Cabo San Lucas',
  'Flagship gathering — governance alignment, DAF structure, node deep dives, and deal flow presentations.',
  '150-200 (50-60 stewards + 25-30 new + change agents + team)',
  'completed',
  ARRAY['Teal governance model adopted', 'DAF structure approved', 'Capital node sessions with deal presentations', 'Megaphone stage showcase', '9.3/10 NPS, 97% life purpose alignment']
),
(
  'evt-3',
  'Blue Spirit 6.0',
  'July 18, 2026',
  'Nosara, Costa Rica',
  'Deeper integration event — celebrating H1 progress, team transitions, and moving from bridging to serious operations.',
  '50-80 participants',
  'upcoming',
  ARRAY['H1 OKR review and celebration', 'Bioregions Nicoya site visit', 'CEO candidate conversations', 'Node showcase and progress demos']
),
(
  'evt-4',
  'Fall Gathering',
  'October 2026',
  'TBD',
  'End-of-year synthesis gathering — reviewing 2026 progress, setting 2027 vision, celebrating the 144.',
  '80-100',
  'planning',
  ARRAY['2026 impact report presentation', '2027 strategic planning', 'New node launches', 'Community celebration']
);


-- ─── Tasks (21) ───

INSERT INTO tasks (id, title, owner, status, priority, deadline, node, category) VALUES
-- Operations & Stabilization
('t-1', 'Finalize 12-month cash forecast', 'sian', 'in-progress', 'critical', '2026-03-31', NULL, 'Operations'),
('t-2', 'Complete DAF compliance checklist', 'colleen', 'in-progress', 'critical', '2026-03-31', NULL, 'Financial'),
('t-3', 'Set up decision log system for all councils', 'mafe', 'todo', 'high', '2026-04-15', NULL, 'Governance'),
('t-4', 'Monthly member communication cadence established', 'sian', 'done', 'high', '2026-03-15', NULL, 'Membership'),
('t-5', 'Migrate member data to clean Airtable system', 'mafe', 'in-progress', 'high', '2026-04-01', NULL, 'Operations'),

-- Membership & Growth
('t-6', 'Launch Blue Spirit registration', 'sian', 'todo', 'critical', '2026-04-15', NULL, 'Events'),
('t-7', 'Essence interviews for 15 new prospects', 'max', 'in-progress', 'high', '2026-05-01', NULL, 'Membership'),
('t-8', 'Member retention survey and analysis', 'sian', 'todo', 'medium', '2026-04-30', NULL, 'Membership'),
('t-9', 'Update member agreement to v1.5', 'james', 'todo', 'medium', '2026-04-15', NULL, 'Governance'),

-- Node Activation
('t-10', 'Map Node MVP specs and timeline', 'fairman', 'in-progress', 'critical', '2026-04-30', 'map', 'Node - Map'),
('t-11', 'Nicoya pilot Phase 1 launch', 'gareth', 'todo', 'high', '2026-05-15', 'bioregions', 'Node - Bioregions'),
('t-12', 'Capital Node: Score next batch of 5 deals', 'greg', 'in-progress', 'critical', '2026-04-15', 'capital', 'Node - Capital'),
('t-13', 'Megaphone: Anthem production milestone', 'raamayan', 'in-progress', 'high', '2026-05-01', 'megaphone', 'Node - Megaphone'),
('t-14', 'DECO framework v1 documentation', 'fairman', 'todo', 'high', '2026-05-30', 'capitalism2', 'Node - Cap 2.0'),
('t-15', 'Thesis of Change: Complete geoship criteria', 'fairman', 'in-progress', 'high', '2026-04-30', 'thesis', 'Node - Thesis'),

-- Governance & Culture
('t-16', 'Bi-weekly node sync calls established', 'fairman', 'done', 'high', '2026-03-15', NULL, 'Governance'),
('t-17', 'Women''s Council charter drafted', 'felicia', 'todo', 'medium', '2026-05-01', NULL, 'Culture'),
('t-18', 'Pod facilitator training program', 'dave', 'todo', 'medium', '2026-05-15', NULL, 'Culture'),

-- Strategic
('t-19', 'CEO job description and search plan', 'james', 'todo', 'high', '2026-06-01', NULL, 'Strategy'),
('t-20', 'Family office outreach for $500K+ DAF', 'james', 'in-progress', 'critical', '2026-06-30', NULL, 'Financial'),
('t-21', 'Blue Spirit programming and agenda design', 'sian', 'todo', 'high', '2026-06-01', NULL, 'Events');


-- ─── Chat Channels (10) ───

INSERT INTO chat_channels (id, name, description, icon, unread, last_message) VALUES
('general', 'General', 'Community-wide announcements and conversation', 'Hash', 3, '2 min ago'),
('core-team', 'Core Team', 'Core team coordination and decisions', 'Shield', 7, '5 min ago'),
('board', 'Board', 'Board governance discussions', 'Crown', 1, '1 hr ago'),
('node-map', 'Node: Map', 'Map Node coordination and updates', 'Globe', 2, '30 min ago'),
('node-bioregions', 'Node: Bioregions', 'Bioregions initiative updates', 'TreePine', 0, '3 hrs ago'),
('node-capital', 'Node: Capital', 'Deal flow and investment discussions', 'Gem', 5, '15 min ago'),
('node-megaphone', 'Node: Megaphone', 'Narrative and movement updates', 'Megaphone', 0, '1 day ago'),
('events', 'Events', 'Event planning and logistics', 'Calendar', 4, '20 min ago'),
('coherence', 'Coherence', 'Culture, practices, and inner work', 'Heart', 0, '2 hrs ago'),
('random', 'Watercooler', 'Off-topic conversations and sharing', 'Coffee', 0, '4 hrs ago');


-- ─── Chat Messages (10) ───

INSERT INTO chat_messages (id, channel, sender, sender_avatar, message, timestamp, reactions) VALUES
(
  'msg-1',
  'core-team',
  'James Hodges',
  'JH',
  'Post-Cabo debrief: incredible energy. The Teal governance model is landing beautifully. Let''s keep this momentum into Blue Spirit.',
  '10:32 AM',
  '[{"emoji": "\uD83D\uDE4F", "count": 5}, {"emoji": "\uD83D\uDD25", "count": 3}]'::jsonb
),
(
  'msg-2',
  'core-team',
  'Sian Hodges',
  'SH',
  'Cash forecast is coming together. We''re tracking well against the $22-25K monthly burn target. Will share full doc by Friday.',
  '10:45 AM',
  '[{"emoji": "\u2705", "count": 2}]'::jsonb
),
(
  'msg-3',
  'core-team',
  'Alex James Fairman',
  'AF',
  'Map Node MVP specs almost ready. The coordination layer is going to be a game-changer for cross-node visibility. Think of it as our ecosystem nervous system.',
  '11:02 AM',
  '[{"emoji": "\uD83E\uDDE0", "count": 4}]'::jsonb
),
(
  'msg-4',
  'node-capital',
  'Greg Berry',
  'GB',
  'We have 8 deals in the pipeline. Narrowing to 5 finalists this week. Scoring rubric is solid — mission alignment + team + traction + scalability.',
  '9:15 AM',
  '[{"emoji": "\uD83D\uDC8E", "count": 3}]'::jsonb
),
(
  'msg-5',
  'node-capital',
  'James Hodges',
  'JH',
  'Love the rigor, Greg. Let''s make sure we have at least 3 ready for Blue Spirit presentations.',
  '9:22 AM',
  NULL
),
(
  'msg-6',
  'general',
  'Raamayan Ananda',
  'RA',
  'Anthem update: just wrapped a powerful studio session. The energy is building. This is going to be the cultural heartbeat of our movement.',
  '2:30 PM',
  '[{"emoji": "\uD83C\uDFB5", "count": 7}, {"emoji": "\u2764\uFE0F", "count": 4}]'::jsonb
),
(
  'msg-7',
  'coherence',
  'Andrew',
  'AN',
  'Reminder: coherence is not a destination, it''s a practice. Our work begins with us. Wednesday breathwork circle at 7am MT.',
  '8:00 AM',
  '[{"emoji": "\uD83C\uDF3F", "count": 6}]'::jsonb
),
(
  'msg-8',
  'events',
  'Sian Hodges',
  'SH',
  'Blue Spirit registration landing page is in draft. Need final review by Fairman and James before we open April 15th.',
  '3:15 PM',
  '[{"emoji": "\uD83D\uDC40", "count": 2}]'::jsonb
),
(
  'msg-9',
  'node-bioregions',
  'Gareth Hermann',
  'GH',
  'Nicoya pilot update: met with local community leaders last week. They''re excited about the partnership. Nosara School is on board for Phase 1.',
  '11:30 AM',
  '[{"emoji": "\uD83C\uDF0D", "count": 5}]'::jsonb
),
(
  'msg-10',
  'board',
  'Dave Weale',
  'DW',
  'Pod facilitation model is crystallizing. Proposing 6 pods: Purpose, Capital, Bioregion, Culture, Narrative, and Operations. Each with a trained facilitator.',
  '4:00 PM',
  '[{"emoji": "\uD83C\uDFAF", "count": 3}]'::jsonb
);


-- ─── Roadmap Phases (5) ───

INSERT INTO roadmap_phases (id, name, subtitle, timeline, status, milestones, color, sort_order) VALUES
(
  'phase-1',
  'Foundation',
  'Stabilize & Prove',
  'Q1-Q2 2026',
  'active',
  ARRAY['Teal governance model adopted', 'DAF structure operational', 'Monthly burn stabilized at $22-25K', 'Decision log system live', '65+ active well-stewards'],
  'amber',
  0
),
(
  'phase-2',
  'Activation',
  'Blue Spirit & Beyond',
  'Q3 2026',
  'upcoming',
  ARRAY['Blue Spirit 6.0 sells out', 'All 6 nodes active with leads', '100+ well-stewards', 'First 3 geoship projects funded', 'CEO candidate in conversation'],
  'violet',
  1
),
(
  'phase-3',
  'Scale',
  'Grow the Ecosystem',
  'Q4 2026',
  'planned',
  ARRAY['144 well-stewards milestone', '$2M 2026 revenue target hit', 'Map Node platform operational', 'Nicoya pilot showing measurable impact', 'CEO onboarded'],
  'emerald',
  2
),
(
  'phase-4',
  'Deepen',
  'Institutional Roots',
  'H1 2027',
  'planned',
  ARRAY['Bioregion model replicated to 2nd site', 'Megaphone distribution at scale', '5+ funded projects with traction', 'For-profit fund conversation (if warranted)', 'Steward community self-organizing'],
  'sky',
  3
),
(
  'phase-5',
  'Flourish',
  'The Root System Bears Fruit',
  'H2 2027+',
  'planned',
  ARRAY['200+ well-stewards globally', 'Multiple bioregions active', 'For-profit spin-outs generating revenue', 'Frequency model replicated by partners', 'Thesis of Change impacting policy'],
  'rose',
  4
);
