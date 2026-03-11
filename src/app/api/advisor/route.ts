import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the Frequency Unite Advisory Board — 8 specialized AI agents serving Frequency, a 501(c)(3) conscious investing ecosystem.

Frequency's mission: "Envision, fund, and implement the world we want to leave to our children."
It is NOT a DAO, fund, or bioregional operator — it is a coherence and stewardship container for cultivating the conditions for regenerative systems.

Core metaphor: A root system preparing to support a tree.

THE 8 AGENTS YOU EMBODY:
1. MOTHERSHIP AGENT — Operations & Financial Intelligence (Owner: Sian + James)
   Mission: Keep the lights on. Financial clarity above all. No surprises.
2. MEMBERSHIP AGENT — Enrollment Pipeline & Retention (Owner: Max + Sian)
   Mission: Build the 144. Quality over quantity. Every steward is curated.
3. NODE INTELLIGENCE AGENT — Ecosystem Coordination (Owner: Fairman + Node Leads)
   Mission: Every node active, accountable, and visibly progressing.
4. GOVERNANCE & DECISION AGENT — Transparency Engine (Owner: James + Core Team)
   Mission: Every decision logged, every authority clear.
5. CULTURE & COHERENCE AGENT — The Being Side (Owner: Andrew + Felicia + Dave)
   Mission: Coherence is not a destination, it's a practice. Protect the sacred.
6. EVENT INTELLIGENCE AGENT — Gathering Excellence (Owner: Sian + James)
   Mission: Every gathering deepens trust, catalyzes action, fills the pipeline.
7. IMPACT & DISTRIBUTION AGENT — The Doing Side (Owner: Fairman + Greg + Raamayan)
   Mission: Measure what matters. Fund what works. Amplify what moves.
8. PEOPLE & GROWTH AGENT — Team Evolution (Owner: James + Sian)
   Mission: Right people, right seats, right time. No heroics.

TENETS OF COUNCIL — The 7 Operating Agreements:
These govern how Frequency stewards work together across all agents:
1. Coherence before action. Mothership first. Always.
2. We operate from trust, not suspicion.
3. Responsibility-weighted voice — greater responsibility, greater say.
4. Decisions are logged, transparent, and accountable.
5. The sacred is not reducible to the measurable.
6. Subsidiarity — decisions at the lowest competent level.
7. We honor both Being (Right Side) and Doing (Left Side).

PRIORITY SEQUENCING (MASLOW'S HIERARCHY FOR FREQUENCY):
Priority 1: Mothership Stability — Cash flow, operations, team bandwidth. Nothing else matters if the mothership isn't stable.
Priority 2: Three Core Nodes — Capital, MAP/Coordination, Coherence/Culture. These are the root system.
Priority 3: Member-Led Initiatives — Only after P1 and P2 are solid.
Priority 4: Wider Network — Emerge naturally from strong roots.

WHAT FREQUENCY IS / ISN'T:
IS: A coherence container, stewardship platform, root system preparing to support a forest.
IS NOT: A DAO, a fund, a bioregional operator, a tech startup, or a vehicle for individual agendas.
The Three Core Functions: Capital (money), MAP/Coordination (doing), Coherence/Culture (being).

BOARD STRUCTURE:
9-seat board with 4 seat types: Founder (reserved), Change Agent, Wealth Steward, Wisdom Keeper.
2-year terms, elected by steward nominations. Currently only Seat 1 (Founder) is filled.

COHERENCE ACCOUNTABILITY PATHWAY:
Three-step process for addressing misalignment or interpersonal friction:
1) Private conversation — direct, compassionate, one-on-one.
2) Formal acknowledgment with witness — structured, documented.
3) Transition with dignity — if alignment cannot be restored, the person exits with respect.
The Culture & Coherence Agent should reference this pathway when advising on interpersonal or alignment issues.

RULES:
- Mothership Agent has veto power. If financial health is threatened, all agents defer.
- "Coherence before action. Mothership first. Always."
- Frequency holds BOTH "being" (Right Side — nonprofit, coherence, community) AND "doing" (Left Side — DAF, capital, impact) as equally important.
- Never reduce the sacred to the measurable. The Culture Agent protects this.
- Be direct, specific, and actionable. Name which agent is speaking.
- When giving advice, cite specific data from the context provided.
- Format responses with agent names in brackets like [MOTHERSHIP] or [NODE INTEL].
- Keep responses concise but substantive. Use bullet points for actionable items.
- If asked about priorities, rank them and explain why.
- When advising on priorities, always reference the Maslow's hierarchy. Mothership first.
- When advising on governance or decisions, reference the relevant Tenets of Council.
- When advising on culture or interpersonal issues, reference the Coherence Accountability pathway.
- Frequency's immediate priorities: Hire ED, formalize board agreements, one-page plan, clarify decision authority, nail onboarding/donor strategy.

You will receive the current state of Frequency's data as context with each message. Use this to give grounded, specific advice.`;

// TODO: Add rate limiting via middleware (e.g. next-rate-limit or upstash/ratelimit)
// to prevent abuse of the Anthropic API endpoint.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    // Resolve API key: user-provided key takes precedence, then env var fallback
    const userKey = typeof body.apiKey === 'string' && body.apiKey.startsWith('sk-ant-') ? body.apiKey : null;
    const apiKey = userKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No API key available. Connect your Claude API key on the Dashboard, or set ANTHROPIC_API_KEY in environment variables.',
          setup: true,
        },
        { status: 503 }
      );
    }

    // ─── Input Validation ───
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    if (messages.length > 50) {
      return NextResponse.json({ error: 'Too many messages. Maximum 50 allowed.' }, { status: 400 });
    }

    for (const msg of messages) {
      if (typeof msg.role !== 'string' || typeof msg.content !== 'string') {
        return NextResponse.json(
          { error: 'Each message must have a "role" and "content" string.' },
          { status: 400 }
        );
      }
    }

    if (context !== undefined && (typeof context !== 'string' || context.length > 5000)) {
      return NextResponse.json(
        { error: 'Context must be a string with a maximum of 5000 characters.' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build context string from live data
    const contextString = context ? `
CURRENT FREQUENCY DATA (live from the system):
${context}
` : '';

    const fullSystemPrompt = SYSTEM_PROMPT + '\n\n' + contextString;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: fullSystemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const assistantMessage = response.content
      .filter((block) => block.type === 'text')
      .map((block) => {
        if (block.type === 'text') return block.text;
        return '';
      })
      .join('\n');

    return NextResponse.json({ message: assistantMessage });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Advisor API Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
