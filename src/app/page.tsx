"use client";

import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

/* ---------- TYPES ---------- */

type CardComponent = {
  type: "Card";
  props: {
    title: string;
  };
};

type ButtonComponent = {
  type: "Button";
  props: {
    label: string;
  };
};

type ComponentPlan = CardComponent | ButtonComponent;

type UIPlan = {
  layout: string;
  components: ComponentPlan[];
};

/* ---------- COMPONENT ---------- */

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState<UIPlan | null>(null);

  async function handleGenerate() {
    console.log("Button clicked");

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setCode(data.code);
    setPlan(data.plan);
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-1/3 border-r p-4">
        <h1 className="text-xl font-bold mb-4">AI Chat</h1>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Describe your UI..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Generate
        </button>
      </div>

      {/* Right Panel */}
      <div className="w-2/3 p-4">
        <h1 className="text-xl font-bold mb-4">Generated Code</h1>

        <pre className="bg-gray-100 text-black p-4 rounded h-1/2 overflow-auto whitespace-pre-wrap">
          {code}
        </pre>

        <h1 className="text-xl font-bold mt-6 mb-4">Live Preview</h1>

        <div className="border p-4 rounded h-1/2 overflow-auto space-y-4">
          {plan &&
            plan.components.map((component, index) => {
              if (component.type === "Card") {
                return (
                  <Card key={index} title={component.props.title}>
                    <p>This UI was generated.</p>
                  </Card>
                );
              }

              if (component.type === "Button") {
                return (
                  <Button
                    key={index}
                    label={component.props.label}
                  />
                );
              }

              return null;
            })}
        </div>
      </div>
    </div>
  );
}
