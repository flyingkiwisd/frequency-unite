# Slack Message to Core Team

---

Hey team — @Sian @Fairman @Maximillian @Dave @Andrew @Felicia @Mafe @Colleen

I've been building something and I think it's going to change how we operate.

**Introducing: Frequency Unite — our Steward Operating System**

I had Claude build a full working prototype — not a mockup, a real app — that brings together everything we've been talking about since Cabo. Our governance, our nodes, our OKRs, our membership pipeline, our decision logs, our events... all in one place.

Here's what's in it today:

- **Frequency Command Center** — North Star dashboard with our real KPIs: 144 well-stewards, $2M revenue target, DAF raised, member retention, node progress — all visible at a glance
- **Node Ecosystem** — all 6 nodes (Map, Bioregions, Capital, Megaphone, Capitalism 2.0, Thesis of Change) with leads, capabilities, progress bars, and priority levels
- **Steward Team** — everyone's profile, role, domains, KPIs, non-negotiables, and hours/week. Filterable by Core Team, Board, Node Leads, and Members
- **Chat** — Slack-like channels built in: Core Team, Board, all node channels, Events, Coherence, and Watercooler. Yes, we built our own messaging right into the OS
- **Task Commander** — 90-day action plan loaded in, Kanban board with filters by status, priority, and category. Every task has an owner, deadline, and node assignment
- **OKRs & KPIs** — our 5 objectives with key results and progress bars. 10 KPIs grouped by Membership, Financial, Operations, Community, and Impact
- **Governance & Decisions** — Teal governance principles, the full governance structure diagram (Wisdom Council → Core Stewardship → Stewards Council → Member-Led Nodes), and every decision logged with impact level and category
- **Events** — Beyul, Cabo, Blue Spirit, Fall Gathering — with highlights, capacity, and status
- **Strategic Roadmap** — 5-phase timeline from Foundation through Flourish, with milestones checklist
- **Notes** — personal notes per steward with LLM sync capability
- **Activity Feed** — everything that's happening across the org in one stream

**Your stuff is already in there.** When you log in, select your profile and you'll see your role, your domains, your KPIs, your non-negotiables. Everything from our governance charter and the 90-day plan is loaded.

**What this means for us:**

This is the **Mothership OS** we've been talking about. One source of truth. No more scattered Airtable sheets, WhatsApp threads, and Google Docs. Everyone sees the same scoreboard. Every decision is logged. Every node has visible progress. Every steward knows their role.

"Mothership first. Always." — now we have the machine to back it up.

**How to run it:**

```
git clone [REPO LINK]
cd frequency-unite
npm install
npm run dev
```

Open `http://localhost:3001` and pick your profile. That's it.

**What I need from each of you:**

- **Sian** — Does this actually solve the visibility problem? Can you see burn rate, cash runway, enrollment pipeline the way you need to? What's missing from your ops perspective? This should make your life easier, not harder.
- **Fairman** — The nodes view — is the structure right? Does the Map Node representation capture the coordination layer vision? Are the thesis milestones accurate?
- **Max** — The membership pipeline isn't wired in yet. What does the enrollment funnel need to look like? Awareness → Prospect → Conversation → Offer → Signed → Active — is that right?
- **Dave** — Pods aren't in the app yet (coming next). What does the pod view need to show? Attendance, facilitator health, engagement scores?
- **Andrew & Felicia** — The Coherence channel is there but the app doesn't capture the being side yet. How do we represent coherence, inner work, and practice within the system without reducing it?
- **Mafe** — Can this replace some of the Airtable tracking? What data do you manage that should live here?
- **Colleen** — DAF dashboard is basic right now. What financial views do you need? Budget vs actuals, donor tracking, compliance status?

**Everyone:** Be brutal. Tell me what's wrong, what's missing, what's confusing. The point of a prototype is to break it.

Every view has PDF export, so you can download any page and feed it straight into your own Claude/LLM as context. Instant AI sync with our actual operating data.

This is the root system. Let's make it strong.

— James
