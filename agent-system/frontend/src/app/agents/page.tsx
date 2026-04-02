"use client";

import { useState, useEffect, useCallback } from "react";

const API = "/api/backend/agents-admin";

// ── Types ──

interface AgentSummary {
  name: string;
  display_name: string;
  description: string;
  model: string;
  skills: string[];
  extra_tools: string[];
  skill_count: number;
  prompt_length: number;
}

interface SkillDetail {
  code: string;
  name: string;
  category: string;
  type: string;
  description: string;
  tools_required: string[];
  content_preview?: string;
  error?: string;
}

interface AgentDetail {
  name: string;
  display_name: string;
  description: string;
  model: string;
  skills: string[];
  extra_tools: string[];
  role_prompt: string;
  assembled_prompt_length: number;
  assembled_prompt_preview: string;
  skills_detail: SkillDetail[];
}

interface SkillFull {
  code: string;
  name: string;
  category: string;
  type: string;
  description: string;
  tools_required: string[];
  content: string;
  used_by_agents: string[];
  path: string;
}

interface AgentRun {
  id: string;
  agent_name: string;
  skill_code: string | null;
  phase: string;
  experiment_id: string;
  duration_ms: number | null;
  cost_usd: number | null;
  output_preview: string | null;
  has_errors: boolean;
  created_at: string | null;
}

type View = "overview" | "agent-detail" | "skill-detail" | "runs" | "prompt-preview";

const MODEL_COLORS: Record<string, string> = {
  opus: "bg-violet-dim text-violet",
  sonnet: "bg-blue-dim text-blue",
  haiku: "bg-teal-dim text-teal",
};

const CATEGORY_COLORS: Record<string, string> = {
  analysis: "bg-blue-dim text-blue",
  creation: "bg-teal-dim text-teal",
  growth: "bg-amber-dim text-amber",
  research: "bg-violet-dim text-violet",
  strategy: "bg-red-dim text-red",
  decision: "bg-amber-dim text-amber",
};

// ── Main Page ──

export default function AgentManagement() {
  const [view, setView] = useState<View>("overview");
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [allSkills, setAllSkills] = useState<SkillDetail[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillFull | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [promptPreview, setPromptPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [editModel, setEditModel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editRolePrompt, setEditRolePrompt] = useState("");
  const [editSkillContent, setEditSkillContent] = useState("");

  // Test agent
  const [testTask, setTestTask] = useState("");
  const [testSkill, setTestSkill] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // ── Fetchers ──

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/agents`);
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load agents");
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`${API}/skills`);
      const data = await res.json();
      setAllSkills(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load skills");
    }
  }, []);

  const fetchRuns = useCallback(async (agentName?: string) => {
    try {
      const url = agentName ? `${API}/runs?agent_name=${agentName}&limit=50` : `${API}/runs?limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      setRuns(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load runs");
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchSkills();
  }, [fetchAgents, fetchSkills]);

  // ── Agent Detail ──

  const openAgent = async (name: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/agents/${name}`);
      const data: AgentDetail = await res.json();
      setSelectedAgent(data);
      setEditModel(data.model);
      setEditDesc(data.description);
      setEditSkills([...data.skills]);
      setEditRolePrompt(data.role_prompt);
      setView("agent-detail");
    } catch (e) {
      setError("Failed to load agent");
    }
    setLoading(false);
  };

  const saveAgent = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/agents/${selectedAgent.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: editModel,
          description: editDesc,
          skills: editSkills,
          role_prompt: editRolePrompt,
        }),
      });
      if (res.ok) {
        setSuccess("Agent saved!");
        setTimeout(() => setSuccess(""), 3000);
        await openAgent(selectedAgent.name);
        await fetchAgents();
      } else {
        setError("Failed to save");
      }
    } catch (e) {
      setError("Save failed");
    }
    setSaving(false);
  };

  // ── Skill Detail ──

  const openSkill = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/skills/${code}`);
      const data: SkillFull = await res.json();
      setSelectedSkill(data);
      setEditSkillContent(data.content);
      setView("skill-detail");
    } catch (e) {
      setError("Failed to load skill");
    }
    setLoading(false);
  };

  const saveSkill = async () => {
    if (!selectedSkill) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/skills/${selectedSkill.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editSkillContent }),
      });
      if (res.ok) {
        setSuccess("Skill saved!");
        setTimeout(() => setSuccess(""), 3000);
        await openSkill(selectedSkill.code);
      }
    } catch (e) {
      setError("Save failed");
    }
    setSaving(false);
  };

  // ── Prompt Preview ──

  const showPrompt = async (agentName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/agents/${agentName}/prompt`);
      const data = await res.json();
      setPromptPreview(data.prompt);
      setView("prompt-preview");
    } catch (e) {
      setError("Failed to load prompt");
    }
    setLoading(false);
  };

  // ── Test Agent ──

  const runTest = async () => {
    if (!selectedAgent || !testTask) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API}/agents/${selectedAgent.name}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: testTask, skill_code: testSkill || null }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ error: "Test failed" });
    }
    setTesting(false);
  };

  // ── Toggle Skill ──

  const toggleSkill = (code: string) => {
    setEditSkills((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  };

  // ── Render ──

  return (
    <div className="min-h-screen bg-bg0 text-text0">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-bg1 border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-text2 hover:text-text0 text-sm">&larr; Dashboard</a>
          <h1 className="font-[Syne] font-bold text-lg">Agent Management</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setView("overview"); fetchAgents(); fetchSkills(); }}
            className={`px-3 py-1.5 rounded text-xs font-medium ${view === "overview" ? "bg-amber text-bg0" : "bg-bg2 text-text1 hover:text-text0"}`}
          >
            Overview
          </button>
          <button
            onClick={() => { setView("runs"); fetchRuns(); }}
            className={`px-3 py-1.5 rounded text-xs font-medium ${view === "runs" ? "bg-amber text-bg0" : "bg-bg2 text-text1 hover:text-text0"}`}
          >
            Run History
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && <div className="mx-6 mt-3 p-2 bg-red-dim text-red rounded text-sm">{error}</div>}
      {success && <div className="mx-6 mt-3 p-2 bg-teal-dim text-teal rounded text-sm">{success}</div>}

      <div className="p-6">
        {loading && <div className="text-text2 animate-pulse">Loading...</div>}

        {/* ════════ OVERVIEW ════════ */}
        {view === "overview" && (
          <div className="space-y-8">
            {/* Agents Grid */}
            <section>
              <h2 className="font-[Syne] font-bold text-base mb-4 text-text1">Agents ({agents.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((a) => (
                  <div
                    key={a.name}
                    onClick={() => openAgent(a.name)}
                    className="bg-bg1 border border-border rounded-lg p-4 cursor-pointer hover:border-amber transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-[Syne] font-bold text-sm">{a.display_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${MODEL_COLORS[a.model] || "bg-bg3 text-text2"}`}>
                        {a.model}
                      </span>
                    </div>
                    <p className="text-text2 text-xs mb-3 line-clamp-2">{a.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-text2">
                      <span>{a.skill_count} skills</span>
                      <span>{(a.prompt_length / 1000).toFixed(1)}K chars</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.skills.slice(0, 6).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-bg2 rounded text-[10px] text-text2">{s}</span>
                      ))}
                      {a.skills.length > 6 && (
                        <span className="px-1.5 py-0.5 bg-bg2 rounded text-[10px] text-text2">+{a.skills.length - 6}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills Grid */}
            <section>
              <h2 className="font-[Syne] font-bold text-base mb-4 text-text1">Skills ({allSkills.length})</h2>
              {/* Group by category */}
              {["research", "strategy", "creation", "growth", "analysis", "decision"].map((cat) => {
                const catSkills = allSkills.filter((s) => s.category === cat);
                if (catSkills.length === 0) return null;
                return (
                  <div key={cat} className="mb-4">
                    <h3 className="text-xs font-bold uppercase text-text2 mb-2">{cat} ({catSkills.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {catSkills.map((s, i) => (
                        <button
                          key={s.code || `${cat}-${i}`}
                          onClick={() => openSkill(s.code)}
                          className={`px-3 py-1.5 rounded text-xs border border-border hover:border-amber transition-colors ${CATEGORY_COLORS[cat] || "bg-bg2 text-text1"}`}
                        >
                          <span className="font-bold">{s.code}</span>
                          <span className="text-text2 ml-1">{s.name}</span>
                          {s.type === "api" && <span className="ml-1 text-amber text-[10px]">API</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* ════════ AGENT DETAIL ════════ */}
        {view === "agent-detail" && selectedAgent && (
          <div className="max-w-5xl space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("overview")} className="text-text2 hover:text-text0 text-sm">&larr; Back</button>
              <h2 className="font-[Syne] font-bold text-xl">{selectedAgent.display_name}</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${MODEL_COLORS[selectedAgent.model] || "bg-bg3 text-text2"}`}>
                {selectedAgent.model}
              </span>
            </div>

            {/* Config Section */}
            <div className="bg-bg1 border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-bold text-sm text-text1">Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text2 mb-1">Model</label>
                  <select
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full bg-bg2 border border-border rounded px-3 py-2 text-sm focus:border-amber outline-none"
                  >
                    <option value="opus">Opus (strongest, slowest)</option>
                    <option value="sonnet">Sonnet (balanced)</option>
                    <option value="haiku">Haiku (fastest, cheapest)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text2 mb-1">Prompt Length</label>
                  <div className="bg-bg2 border border-border rounded px-3 py-2 text-sm text-text2">
                    {selectedAgent.assembled_prompt_length.toLocaleString()} chars
                    <button
                      onClick={() => showPrompt(selectedAgent.name)}
                      className="ml-2 text-amber text-xs hover:underline"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-text2 mb-1">Description</label>
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-bg2 border border-border rounded px-3 py-2 text-sm focus:border-amber outline-none"
                />
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-bg1 border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-bold text-sm text-text1">
                Skills ({editSkills.length} assigned)
                <span className="text-text2 font-normal ml-2 text-xs">Click to toggle</span>
              </h3>

              {/* Current skills */}
              <div className="space-y-2">
                {selectedAgent.skills_detail.map((s) => (
                  <div
                    key={s.code}
                    className={`flex items-center justify-between p-3 rounded border transition-colors ${
                      editSkills.includes(s.code)
                        ? "bg-bg2 border-amber/30"
                        : "bg-bg1 border-border opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSkill(s.code)}
                        className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                          editSkills.includes(s.code)
                            ? "bg-amber border-amber text-bg0"
                            : "border-border text-text2 hover:border-text2"
                        }`}
                      >
                        {editSkills.includes(s.code) ? "\u2713" : ""}
                      </button>
                      <span className="font-bold text-sm">{s.code}</span>
                      <span className="text-text1 text-sm truncate">{s.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${CATEGORY_COLORS[s.category] || "bg-bg3 text-text2"}`}>
                        {s.category}
                      </span>
                      {s.type === "api" && <span className="text-amber text-[10px]">API</span>}
                    </div>
                    <button
                      onClick={() => openSkill(s.code)}
                      className="text-text2 hover:text-amber text-xs ml-2"
                    >
                      Edit &rarr;
                    </button>
                  </div>
                ))}
              </div>

              {/* Add skills not yet assigned */}
              {(() => {
                const unassigned = allSkills.filter((s) => !editSkills.includes(s.code));
                if (unassigned.length === 0) return null;
                return (
                  <div>
                    <h4 className="text-xs text-text2 mb-2 mt-4">Available skills (click + to add)</h4>
                    <div className="flex flex-wrap gap-1">
                      {unassigned.map((s) => (
                        <button
                          key={s.code}
                          onClick={() => toggleSkill(s.code)}
                          className="px-2 py-1 bg-bg2 border border-border rounded text-[11px] text-text2 hover:border-amber hover:text-amber transition-colors"
                        >
                          + {s.code} {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Role Prompt Editor */}
            <div className="bg-bg1 border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-sm text-text1">Role Prompt (Markdown)</h3>
              <p className="text-text2 text-xs">The agent reads this as its identity + instructions. Skills are appended after this.</p>
              <textarea
                value={editRolePrompt}
                onChange={(e) => setEditRolePrompt(e.target.value)}
                rows={15}
                className="w-full bg-bg0 border border-border rounded px-4 py-3 text-sm font-mono focus:border-amber outline-none resize-y"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={saveAgent}
                disabled={saving}
                className="px-6 py-2 bg-amber text-bg0 font-bold rounded hover:bg-amber/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Agent"}
              </button>
              <span className="text-text2 text-xs">Changes apply immediately to next agent run</span>
            </div>

            {/* Test Section */}
            <div className="bg-bg1 border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-sm text-text1">Test Agent</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <input
                    value={testTask}
                    onChange={(e) => setTestTask(e.target.value)}
                    placeholder="Enter a test task..."
                    className="w-full bg-bg2 border border-border rounded px-3 py-2 text-sm focus:border-amber outline-none"
                  />
                </div>
                <div>
                  <select
                    value={testSkill}
                    onChange={(e) => setTestSkill(e.target.value)}
                    className="w-full bg-bg2 border border-border rounded px-3 py-2 text-sm focus:border-amber outline-none"
                  >
                    <option value="">All skills</option>
                    {editSkills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={runTest}
                disabled={testing || !testTask}
                className="px-4 py-2 bg-blue text-white rounded text-sm font-medium hover:bg-blue/90 disabled:opacity-50"
              >
                {testing ? "Running..." : "Run Test"}
              </button>
              {testResult && (
                <div className="mt-3 bg-bg0 border border-border rounded p-3">
                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className={testResult.status === "success" ? "text-teal" : "text-red"}>
                      {testResult.status}
                    </span>
                    {testResult.duration_ms && <span className="text-text2">{testResult.duration_ms}ms</span>}
                    {testResult.skill_code && <span className="text-amber">{testResult.skill_code}</span>}
                  </div>
                  <pre className="text-xs text-text1 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {JSON.stringify(testResult.output || testResult.error || testResult.raw_text, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ SKILL DETAIL ════════ */}
        {view === "skill-detail" && selectedSkill && (
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setView(selectedAgent ? "agent-detail" : "overview")} className="text-text2 hover:text-text0 text-sm">
                &larr; Back
              </button>
              <span className="font-bold text-lg">{selectedSkill.code}</span>
              <span className="text-text1">{selectedSkill.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${CATEGORY_COLORS[selectedSkill.category] || "bg-bg3 text-text2"}`}>
                {selectedSkill.category}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${selectedSkill.type === "api" ? "bg-amber-dim text-amber" : "bg-bg3 text-text2"}`}>
                {selectedSkill.type}
              </span>
            </div>

            {/* Meta */}
            <div className="bg-bg1 border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text2 text-xs">Used by agents:</span>
                  <div className="flex gap-1 mt-1">
                    {selectedSkill.used_by_agents.length > 0
                      ? selectedSkill.used_by_agents.map((a) => (
                          <button key={a} onClick={() => openAgent(a)} className="px-2 py-0.5 bg-bg2 rounded text-xs text-amber hover:underline">
                            {a}
                          </button>
                        ))
                      : <span className="text-text2 text-xs">None</span>
                    }
                  </div>
                </div>
                {selectedSkill.tools_required.length > 0 && (
                  <div>
                    <span className="text-text2 text-xs">Tools required:</span>
                    <div className="flex gap-1 mt-1">
                      {selectedSkill.tools_required.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-bg2 rounded text-xs text-text1">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-bg1 border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-sm text-text1">Skill Content (Markdown)</h3>
              <p className="text-text2 text-xs">This content is injected into the agent's system prompt when this skill is active.</p>
              <textarea
                value={editSkillContent}
                onChange={(e) => setEditSkillContent(e.target.value)}
                rows={25}
                className="w-full bg-bg0 border border-border rounded px-4 py-3 text-sm font-mono focus:border-amber outline-none resize-y"
              />
            </div>

            <button
              onClick={saveSkill}
              disabled={saving}
              className="px-6 py-2 bg-amber text-bg0 font-bold rounded hover:bg-amber/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Skill"}
            </button>
          </div>
        )}

        {/* ════════ PROMPT PREVIEW ════════ */}
        {view === "prompt-preview" && (
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setView(selectedAgent ? "agent-detail" : "overview")} className="text-text2 hover:text-text0 text-sm">
                &larr; Back
              </button>
              <h2 className="font-bold text-lg">Assembled System Prompt</h2>
              <span className="text-text2 text-xs">{promptPreview.length.toLocaleString()} chars</span>
            </div>
            <div className="bg-bg1 border border-border rounded-lg p-5">
              <pre className="text-xs text-text1 whitespace-pre-wrap overflow-y-auto max-h-[80vh] font-mono">
                {promptPreview}
              </pre>
            </div>
          </div>
        )}

        {/* ════════ RUN HISTORY ════════ */}
        {view === "runs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[Syne] font-bold text-lg">Agent Run History</h2>
              <div className="flex gap-2">
                <button onClick={() => fetchRuns()} className={`px-3 py-1 rounded text-xs ${!selectedAgent ? "bg-amber text-bg0" : "bg-bg2 text-text1"}`}>
                  All
                </button>
                {agents.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => fetchRuns(a.name)}
                    className="px-3 py-1 bg-bg2 text-text1 rounded text-xs hover:text-text0"
                  >
                    {a.display_name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-bg1 border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg2">
                  <tr className="text-text2 text-xs">
                    <th className="text-left px-4 py-2">Agent</th>
                    <th className="text-left px-4 py-2">Skill</th>
                    <th className="text-left px-4 py-2">Phase</th>
                    <th className="text-right px-4 py-2">Duration</th>
                    <th className="text-right px-4 py-2">Cost</th>
                    <th className="text-center px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-bg2/50">
                      <td className="px-4 py-2 font-medium">{r.agent_name}</td>
                      <td className="px-4 py-2 text-amber">{r.skill_code || "—"}</td>
                      <td className="px-4 py-2 text-text2">{r.phase}</td>
                      <td className="px-4 py-2 text-right text-text1">
                        {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-text2">
                        {r.cost_usd ? `$${r.cost_usd.toFixed(4)}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {r.has_errors
                          ? <span className="text-red text-xs">Error</span>
                          : <span className="text-teal text-xs">OK</span>
                        }
                      </td>
                      <td className="px-4 py-2 text-text2 text-xs">
                        {r.created_at ? new Date(r.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—"}
                      </td>
                    </tr>
                  ))}
                  {runs.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-text2">No runs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
