import { NextResponse } from "next/server";
import Groq from "groq-sdk";
/* ---------------- TYPES ---------------- */

type CardComponent = {
  type: "Card";
  props: {
    title: string;
    content: string;
  };
};

type ButtonComponent = {
  type: "Button";
  props: {
    label: string;
  };
};

type UIPlan = {
  layout: string;
  components: Array<CardComponent | ButtonComponent>;
};

const COMPONENT_WHITELIST = ["Card", "Button"] as const;

/* ---------------- AI INIT ---------------- */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
/* ---------------- VALIDATION ---------------- */

function validatePlan(plan: unknown): plan is UIPlan {
  if (!plan || typeof plan !== "object") return false;

  const maybePlan = plan as {
    layout?: unknown;
    components?: unknown;
  };

  if (typeof maybePlan.layout !== "string") return false;
  if (!Array.isArray(maybePlan.components)) return false;

  for (const comp of maybePlan.components) {
    if (!comp || typeof comp !== "object") return false;

    const c = comp as { type?: unknown; props?: unknown };

    if (
      typeof c.type !== "string" ||
      !COMPONENT_WHITELIST.includes(
        c.type as (typeof COMPONENT_WHITELIST)[number]
      )
    ) {
      return false;
    }

    if (!c.props || typeof c.props !== "object") return false;
  }

  return true;
}

/* ---------------- 1️⃣ PLANNER ---------------- */

async function runPlanner(
  userPrompt: string,
  previousPlan?: UIPlan | null
): Promise<UIPlan> {
  let plannerPrompt = "";

  if (previousPlan) {
    plannerPrompt = `
You are updating an existing UI plan.

STRICT RULES:
- Preserve existing components unless removal is explicitly requested.
- Modify only what is necessary.
- Do NOT redesign everything.
- Only use allowed components: ${COMPONENT_WHITELIST.join(", ")}

Return ONLY valid JSON.
No markdown.
No explanation.
No backticks.

Previous Plan:
${JSON.stringify(previousPlan, null, 2)}

User Modification Request:
${userPrompt}

Return the FULL updated plan.
`;
  } else {
    plannerPrompt = `
You are a strict UI Planner.

Select components ONLY from:
${COMPONENT_WHITELIST.join(", ")}

Return ONLY valid JSON.
No markdown.
No explanation.
No backticks.

Format:
{
  "layout": "single-column",
  "components": [
    {
      "type": "Card",
      "props": {
        "title": "string",
        "content": "string"
      }
    },
    {
      "type": "Button",
      "props": {
        "label": "string"
      }
    }
  ]
}

User request:
${userPrompt}
`;
  }

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: plannerPrompt,
    },
  ],
  temperature: 0,
});

const rawText = completion.choices[0]?.message?.content;
  if (!rawText) {
    throw new Error("Planner returned empty response.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("JSON PARSE ERROR:", err);
    throw new Error("Planner returned malformed JSON.");
  }

  if (!validatePlan(parsed)) {
    console.error("VALIDATION FAILED:", parsed);
    throw new Error("Planner returned invalid structure.");
  }

  return parsed;
}

/* ---------------- 2️⃣ GENERATOR ---------------- */

function runGenerator(plan: UIPlan): string {
  let code = "";

  for (const component of plan.components) {
    if (component.type === "Card") {
      code += `
<Card title="${component.props.title}">
  <p>${component.props.content}</p>
</Card>

`;
    }

    if (component.type === "Button") {
      code += `
<Button label="${component.props.label}" />

`;
    }
  }

  return code.trim();
}

/* ---------------- 3️⃣ EXPLAINER ---------------- */

async function runExplainer(plan: UIPlan): Promise<string> {
  const explainerPrompt = `
You are a UI Decision Explainer.

Explain:
- Why this layout was chosen
- Why these components were selected
- How the props match the user request

UI Plan:
${JSON.stringify(plan, null, 2)}
`;

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: explainerPrompt,
    },
  ],
});

return (
  completion.choices[0]?.message?.content ??
  "No explanation generated."
);
}
/* ---------------- MAIN ROUTE ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userPrompt: string = body.prompt;
    const previousPlan: UIPlan | null = body.previousPlan ?? null;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const plan = await runPlanner(userPrompt, previousPlan);
    const code = runGenerator(plan);
    const explanation = await runExplainer(plan);

    return NextResponse.json({
      plan,
      code,
      explanation,
    });
  } catch (error) {
    console.error("Agent Error:", error);

    return NextResponse.json(
      {
        plan: {
          layout: "single-column",
          components: [
            {
              type: "Card",
              props: {
                title: "Error",
                content: "AI failed to generate a valid plan.",
              },
            },
          ],
        },
        code: `<Card title="Error"><p>AI failed to generate a valid plan.</p></Card>`,
        explanation: "Planner failed due to invalid AI output.",
      },
      { status: 500 }
    );
  }
}
