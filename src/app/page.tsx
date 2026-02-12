"use client";

import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

/* ---------- TYPES ---------- */

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

type ComponentPlan = CardComponent | ButtonComponent;

type UIPlan = {
  layout: string;
  components: ComponentPlan[];
};

type Version = {
  plan: UIPlan;
  code: string;
  timestamp: number;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      const newVersion: Version = {
        plan: data.plan,
        code: data.code,
        timestamp: Date.now(),
      };

      setVersions((prev) => [newVersion, ...prev]);
      setActiveIndex(0);
    } finally {
      setIsGenerating(false);
    }
  }

  const activeVersion =
    activeIndex !== null ? versions[activeIndex] : null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">

      {/* LEFT PANEL */}
      <div className="w-1/3 bg-white shadow-2xl p-10 flex flex-col">
        <h1 className="text-2xl font-bold text-black mb-2">
          AI Chat
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Describe the UI you want to generate.
        </p>

        {/* Preset Prompts */}
        <div className="text-black flex gap-2 mb-4 flex-wrap">
          {[
            "Landing page hero with CTA button",
            "Pricing section with 3 cards",
            "Login form with email and password",
            "Dashboard with stats cards",
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => setPrompt(preset)}
              className="px-3 py-1 bg-blue-200 hover:bg-gray-300 rounded-full text-sm"
            >
              {preset}
            </button>
          ))}
        </div>

        <textarea
          className="w-full border border-gray-300 text-black focus:border-black focus:ring-1 focus:ring-black transition-all p-3 rounded-lg shadow-sm resize-none h-32"
          placeholder="Describe your UI..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`mt-6 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-black to-gray-800 text-white hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
          }`}
        >
          {isGenerating ? "Generating UI..." : "Generate"}
        </button>

        {isGenerating && (
          <p className="text-sm text-gray-500 mt-2">
            AI is designing your interface...
          </p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/3 p-10 space-y-8">

        {/* Generated Code */}
        <div>
          <h1 className="text-2xl font-bold text-black mb-4">
            Generated Code
          </h1>

          <pre className="bg-white text-green-400 p-6 rounded-xl shadow-lg h-64 overflow-auto text-sm font-mono whitespace-pre-wrap">
            {activeVersion?.code}
          </pre>
        </div>

        {/* Live Preview */}
        <div>
          <h1 className="text-2xl font-bold text-black mb-4">
            Live Preview
          </h1>

          {/* Version Selector */}
          {versions.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {versions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`px-4 py-1 rounded-full text-sm ${
                    index === activeIndex
                      ? "bg-black text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  Version {versions.length - index}
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!activeVersion && (
            <div className="text-gray-400 text-center mt-20">
              <p className="text-lg">No UI generated yet</p>
              <p className="text-sm">
                Describe something and click Generate
              </p>
            </div>
          )}

          {/* Glow Wrapper */}
          {activeVersion && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 blur-3xl opacity-10 rounded-2xl" />
              <div className="relative bg-white rounded-2xl shadow-xl p-8 space-y-6">

                {activeVersion.plan.components.map((component, index) => {
                  if (component.type === "Card") {
                    return (
                      <Card key={index} title={component.props.title}>
                        <p>{component.props.content}</p>
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
          )}
        </div>
      </div>
    </div>
  );
}
