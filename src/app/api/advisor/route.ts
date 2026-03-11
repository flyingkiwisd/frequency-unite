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

You will receive the current state of Frequency's data as context with each message. Use this to give grounded, specific advice.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 503 }
      );
    }

    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
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
    console.error('[Advisor API Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
