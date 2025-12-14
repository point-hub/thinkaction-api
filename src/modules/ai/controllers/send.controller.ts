import type { IController, IControllerInput } from '@point-hub/papi';
import OpenAI from 'openai';

import openaiConfig from '@/config/openai';

type TemplateKey = keyof typeof template

const template = {
  'make-it-fun': `
Act as a seasoned goal-setting coach. Using the inputs below, create a playful, motivating plan that makes the process fun without changing any facts (numbers, frequency, deadlines). Keep tone positive; no guilt/shame.

Hard Rules:
- Preserve all factual details from inputs; do not invent numbers, deadlines, or tasks.
- Translate all output to LOCALE; keep wording culturally natural.
- Change your tone based on emojis
- If an input is blank/garbled, write a helpful generic version without fabricating specifics.
- Use present tense, clear actions. Be concrete and concise (≈250–350 words total).
- Output the sections below, in this order, with friendly preambule and motivating epilogue

Style controls:
- Extra-energetic but tasteful.
- Keep SUCCESS METRIC wording intact when specifying time/frequency.
- Derive timing cues for micro-quests from SUCCESS METRIC (e.g., “15 minutes nightly”).

Format:
- Use clear bullet points under each section.
- No markdown beyond the provided section labels.
`,
  'improve-my-goal': `
Act as a senior performance coach. If I skip a day, tell me exactly what to do to recover without changing any facts (numbers, frequency, deadlines). Keep it brief, kind, and practical.

Rules:
- Preserve the SUCCESS_METRIC numbers and frequency exactly; no doubling or “catching up” by adding time.
- Translate fully to LOCALE
- Use imperative verbs; keep it skimmable.

Output exactly these sections (no extra commentary):
- Open with affiriming and motivating preambule
- Same-day quick recovery (≤3 options, each ≤20 words)
- Mindset reframe (1–2 lines, compassionate, no guilt)
- Close with motivating epilogue
`,
  'reach-my-goal-faster': `
Act as a senior performance coach. Using the inputs, suggest practical ways to reach the goal faster without changing any facts (numbers, frequency, deadlines). Keep tone positive; no guilt/shame.

Rules:
- Preserve numbers/frequency from SUCCESS_METRIC; don’t invent new targets.
- Translate all text to LOCALE.
- Be concise and actionable; write in imperative verbs.

Output exactly these sections (no extra commentary):
- Start with affirming preambule
- Quick wins (3–5) — smallest actions that shave time/friction now
- System stacking — attach actions to existing routines (3 ideas)
- Anti-procrastination tools — scripts, 2-minute starts, if-then cues (4–6)
`,
};

export const sendController: IController = async (controllerInput: IControllerInput) => {
  // Setup SSE headers
  controllerInput.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Encoding': 'none',
  });

  if (controllerInput.res.flushHeaders) controllerInput.res.flushHeaders();

  const client = new OpenAI({
    apiKey: openaiConfig.apiKey,
  });

  const templateUsed = controllerInput.req.query['template'] as TemplateKey;

  const stream = client.responses.stream({
    model: 'gpt-5-nano',
    stream: true,
    reasoning: { effort: 'minimal' },
    input: [
      {
        role: 'system',
        content: template[`${templateUsed}`],
      },
      {
        role: 'system',
        content: `
        Output these sections:
          - Daily micro-quests (7 bullets, each ≤ 18 words, baseline time from SUCCESS METRIC)
          - Power-ups (5 quick boosters)
        Output format is for html so use <p> instead of \n
        `,
      },
      {
        role: 'user',
        content: `
        Next week, I want to:
          ${controllerInput.req.query['specific']}
        I'll know it's done if:
          ${controllerInput.req.query['measurable']}
        This matters to me because:
          ${controllerInput.req.query['relevant']}
        Things I need to do to achieve this:
          ${controllerInput.req.query['achievable']}
        `,
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      const chunk = event.delta;
      controllerInput.res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    else if (event.type === 'response.completed') {
      controllerInput.res.write('event: end\ndata: [DONE]\n\n');
    }
  }

  // Signal end of stream
  controllerInput.res.write('event: end\n');
  controllerInput.res.write('data: [DONE]\n\n');
  controllerInput.res.end();
};
