import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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

async function runPlanner(userPrompt: string): Promise<UIPlan> {
  const plannerPrompt = `
You are a UI Planner.

Select components ONLY from:
${COMPONENT_WHITELIST.join(", ")}

Return ONLY valid JSON.
No markdown. No explanation.

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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: plannerPrompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text;
  console.log("PLANNER RAW RESPONSE:", rawText);

  if (!rawText) {
    throw new Error("Planner returned empty response.");
  }

  let parsed: unknown;

  try {
    parsed = console.log("PLANNER RAW:", rawText);
JSON.parse(rawText);
  } catch {
    throw new Error("Planner returned malformed JSON.");
  }

  if (!validatePlan(parsed)) {
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

Plan:
${JSON.stringify(plan, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: explainerPrompt,
  });

  return response.text ?? "No explanation generated.";
}

/* ---------------- MAIN ROUTE ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userPrompt: string = body.prompt;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const plan = await runPlanner(userPrompt);
    const code = runGenerator(plan);
   // const explanation = await runExplainer(plan);
   //const explanation = "Explainer disabled during development.";
let explanation = "Development mode";

if (process.env.NODE_ENV === "production") {
  explanation = await runExplainer(plan);
}

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
