"use client";

import { useState, useEffect, useCallback } from "react";

const API = "/api/backend/marketing";
const CTX_API = "/api/backend/quick-post/context";
const SP_API = "/api/backend/social-poster";

// ── Types ──

interface ProjectContext {
  name: string;
  tagline: string;
  angles: { name: string; description: string }[];
  pillars: string[];
  tone: string;
  default_cta: string;
  stats: Record<string, number>;
}

interface Post {
  id: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  angle: string;
  content_type: string;
  content_format: string | null;
  image_prompt: string;
  image_path: string | null;
  image_url: string | null;
  reel_script: any | null;
  video_path: string | null;
  video_url: string | null;
  scheduled_date: string;
  scheduled_time: string;
  platform: string;
  status: string; // draft | approved | posted | rejected
  post_url: string | null;
  fb_post_id: string | null;
  posted_at: string | null;
  impressions: number | null;
  engagements: number | null;
  clicks: number | null;
  week_label: string;
  created_at: string;
}

interface WeeklyData {
  week: string;
  posts: Post[];
  total: number;
  by_status: Record<string, number>;
}

interface Stats {
  total_posts: number;
  total_posted: number;
  total_draft: number;
  total_approved: number;
  total_rejected: number;
  by_angle: Record<string, number>;
  weeks: string[];
  by_week: Record<string, { total: number; posted: number; impressions: number; engagements: number }>;
}

interface Insight {
  id: string;
  pain_phrase: string;
  segment: string;
  sentiment: string;
  frequency: number;
  source: string;
  created_at: string;
}

interface HypothesisItem {
  id: string;
  title: string;
  description: string;
  tier: number;
  signal_type: string;
  signal_score: number;
  stress_test: any;
  created_at: string;
}

interface ScanItem {
  id: string;
  scan_type: string;
  summary: string;
  data: any;
  created_at: string;
}

interface IntelDashboard {
  hypotheses: HypothesisItem[];
  insights: Insight[];
  patterns: { id: string; title: string; category: string; result: string; description: string; confidence: number }[];
  scan_history: ScanItem[];
  summary: { total_hypotheses: number; tier1: number; tier2: number; tier3: number; total_insights: number; total_patterns: number; total_scans: number };
}

type Tab = "today" | "weekly" | "intelligence" | "quarterly";
type IntelSection = "market" | "competitor" | "audience" | "social" | "hypotheses";

// ── Helpers ──

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split("T")[0];
}

// ── Main ──

export default function MarketingDashboard() {
  const [ctx, setCtx] = useState<ProjectContext | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [error, setError] = useState("");

  // Today state
  const [todayPosts, setTodayPosts] = useState<Post[]>([]);
  const [todayLoading, setTodayLoading] = useState(false);

  // Weekly state
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planAngle, setPlanAngle] = useState("");
  const [planContext, setPlanContext] = useState("");
  const [postsPerDay, setPostsPerDay] = useState(2);

  // Intelligence state
  const [insights, setInsights] = useState<Insight[]>([]);
  const [scanning, setScanning] = useState(false);
  const [intelDash, setIntelDash] = useState<IntelDashboard | null>(null);
  const [intelSection, setIntelSection] = useState<IntelSection>("market");
  const [scanningMarket, setScanningMarket] = useState(false);
  const [scanningCompetitor, setScanningCompetitor] = useState(false);
  const [scanningAudience, setScanningAudience] = useState(false);
  const [generatingHypotheses, setGeneratingHypotheses] = useState(false);
  const [stressTestingId, setStressTestingId] = useState<string | null>(null);

  // Quarterly state
  const [stats, setStats] = useState<Stats | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Post>>({});

  // Preview state (for 2-column weekly view)
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  // Publishing & generation state
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [imageLoadingId, setImageLoadingId] = useState<string | null>(null);
  const [videoLoadingId, setVideoLoadingId] = useState<string | null>(null);
  const [reelsPerDay, setReelsPerDay] = useState(2);

  // Manual posting modal
  const [spSelectedPost, setSpSelectedPost] = useState<Post | null>(null);
  const [spSubmitUrl, setSpSubmitUrl] = useState("");
  const [spCopied, setSpCopied] = useState(false);

  // Load context
  useEffect(() => {
    fetch(CTX_API).then(r => r.json()).then(setCtx).catch(() => setError("Backend not reachable"));
  }, []);

  // Sync preview post with latest data after reload
  const syncPreview = useCallback((posts: Post[]) => {
    setPreviewPost(prev => {
      if (!prev) return null;
      const updated = posts.find(p => p.id === prev.id);
      return updated || null;
    });
  }, []);

  // Load today's posts
  const loadToday = useCallback(async () => {
    setTodayLoading(true);
    try {
      const r = await fetch(`${API}/today`);
      const data = await r.json();
      const posts = data.posts || [];
      setTodayPosts(posts);
      syncPreview(posts);
    } catch { setError("Cannot load today's posts"); }
    setTodayLoading(false);
  }, [syncPreview]);

  // Load weekly posts
  const loadWeekly = useCallback(async () => {
    setWeeklyLoading(true);
    try {
      const r = await fetch(`${API}/weekly?week=${weekStart}`);
      const data = await r.json();
      setWeeklyData(data);
      if (data?.posts) syncPreview(data.posts);
    } catch { setError("Cannot load weekly plan"); }
    setWeeklyLoading(false);
  }, [weekStart]);

  // Load insights
  const loadInsights = useCallback(async () => {
    try {
      const r = await fetch(`${API}/insights`);
      const data = await r.json();
      setInsights(data.insights || []);
    } catch {}
  }, []);

  // Load intel dashboard (all 4 sections + hypotheses)
  const loadIntelDashboard = useCallback(async () => {
    try {
      const r = await fetch(`${API}/intel/dashboard`);
      const data = await r.json();
      setIntelDash(data);
    } catch {}
  }, []);

  const scanInsights = async () => {
    setScanning(true);
    try {
      await fetch(`${API}/scan-insights`, { method: "POST" });
      await loadInsights();
      await loadIntelDashboard();
    } catch { setError("Scan failed"); }
    setScanning(false);
  };

  const scanMarket = async () => {
    setScanningMarket(true);
    try {
      await fetch(`${API}/intel/scan-market`, { method: "POST", signal: AbortSignal.timeout(300000) });
      await loadIntelDashboard();
    } catch { setError("Market scan failed"); }
    setScanningMarket(false);
  };

  const scanCompetitors = async () => {
    setScanningCompetitor(true);
    try {
      await fetch(`${API}/intel/scan-competitors`, { method: "POST", signal: AbortSignal.timeout(300000) });
      await loadIntelDashboard();
    } catch { setError("Competitor scan failed"); }
    setScanningCompetitor(false);
  };

  const scanAudience = async () => {
    setScanningAudience(true);
    try {
      await fetch(`${API}/intel/scan-audience`, { method: "POST", signal: AbortSignal.timeout(300000) });
      await loadIntelDashboard();
    } catch { setError("Audience scan failed"); }
    setScanningAudience(false);
  };

  const generateHypotheses = async () => {
    if (!intelDash) return;
    setGeneratingHypotheses(true);
    try {
      // Collect data from latest scans
      const marketScan = intelDash.scan_history.find(s => s.scan_type === "market");
      const competitorScan = intelDash.scan_history.find(s => s.scan_type === "competitor");
      const audienceScan = intelDash.scan_history.find(s => s.scan_type === "audience");
      const body: any = {
        signals: marketScan?.data?.signals || [],
        pain_phrases: intelDash.insights.map(i => ({ pain_phrase: i.pain_phrase, segment: i.segment, frequency: i.frequency })),
        competitors: competitorScan?.data?.competitors || [],
        gaps: competitorScan?.data?.gaps || [],
        audience_profiles: [
          ...(audienceScan?.data?.supply_profiles || []),
          ...(audienceScan?.data?.demand_profiles || []),
        ],
        content_recommendations: audienceScan?.data?.content_recommendations || [],
      };
      await fetch(`${API}/intel/generate-hypotheses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(300000),
      });
      await loadIntelDashboard();
    } catch { setError("Hypothesis generation failed"); }
    setGeneratingHypotheses(false);
  };

  const stressTestHypothesis = async (id: string) => {
    setStressTestingId(id);
    try {
      await fetch(`${API}/intel/stress-test/${id}`, { method: "POST", signal: AbortSignal.timeout(300000) });
      await loadIntelDashboard();
    } catch { setError("Stress test failed"); }
    setStressTestingId(null);
  };

  const promoteHypothesis = async (id: string, tier: number) => {
    await fetch(`${API}/intel/hypothesis/${id}/promote?tier=${tier}`, { method: "PUT" });
    await loadIntelDashboard();
  };

  const archiveHypothesis = async (id: string) => {
    await fetch(`${API}/intel/hypothesis/${id}`, { method: "DELETE" });
    await loadIntelDashboard();
  };

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/stats`);
      setStats(await r.json());
    } catch { /* ignore */ }
  }, []);

  // Auto-load on tab change
  useEffect(() => {
    if (tab === "today") loadToday();
    else if (tab === "weekly") loadWeekly();
    else if (tab === "intelligence") { loadInsights(); loadIntelDashboard(); }
    else if (tab === "quarterly") loadStats();
  }, [tab, loadToday, loadWeekly, loadInsights, loadIntelDashboard, loadStats]);

  // Generate weekly plan
  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError("");
    try {
      const r = await fetch(`${API}/weekly-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: weekStart,
          angle: planAngle,
          extra_context: planContext,
          posts_per_day: postsPerDay,
          reels_per_day: reelsPerDay,
        }),
      });
      const data = await r.json();
      if (data.status === "success") {
        await loadWeekly();
      } else {
        setError(data.error || "Generation failed");
      }
    } catch {
      setError("Backend not reachable");
    }
    setGenerating(false);
  };

  // Post actions
  const approvePost = async (id: string) => {
    await fetch(`${API}/post/${id}/approve`, { method: "PUT" });
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const rejectPost = async (id: string) => {
    await fetch(`${API}/post/${id}/reject`, { method: "PUT" });
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const revertDraft = async (id: string) => {
    await fetch(`${API}/post/${id}/draft`, { method: "PUT" });
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Xóa bài này?")) return;
    await fetch(`${API}/post/${id}`, { method: "DELETE" });
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const saveEdit = async (id: string) => {
    await fetch(`${API}/post/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    setEditForm({});
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const generateImage = async (id: string, prompt?: string) => {
    // If currently editing, save form first (keep edit mode open)
    if (editingId === id && editForm) {
      await fetch(`${API}/post/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
    }
    setImageLoadingId(id);
    try {
      const r = await fetch(`${API}/post/${id}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt || (editingId === id ? editForm.image_prompt : null) || null }),
      });
      const data = await r.json();
      if (data.status !== "success") {
        setError(data.error || "Image generation failed");
      }
    } catch {
      setError("Image generation failed");
    }
    setImageLoadingId(null);
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const publishPost = async (id: string) => {
    setPublishingId(id);
    try {
      const r = await fetch(`${API}/post/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await r.json();
      if (data.status !== "success") {
        setError(data.error || "Publish failed");
      }
    } catch {
      setError("Publish failed");
    }
    setPublishingId(null);
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  const generateVideo = async (id: string) => {
    setVideoLoadingId(id);
    try {
      const r = await fetch(`${API}/post/${id}/generate-video`, { method: "POST", signal: AbortSignal.timeout(300000) });
      const data = await r.json();
      if (data.status !== "success") setError(data.error || "Video generation failed");
    } catch { setError("Video generation failed"); }
    setVideoLoadingId(null);
    if (tab === "today") await loadToday(); else await loadWeekly();
  };

  // Manual posting flow
  const openManualPost = (post: Post) => { setSpSelectedPost(post); setSpSubmitUrl(""); setSpCopied(false); };
  const copyPostContent = async () => {
    if (!spSelectedPost) return;
    const text = `${spSelectedPost.hook || ""}\n\n${spSelectedPost.body || ""}\n\n${spSelectedPost.cta || ""}\n\n${(spSelectedPost.hashtags || []).join(" ")}`.trim();
    await navigator.clipboard.writeText(text);
    setSpCopied(true);
  };
  const submitPostLink = async () => {
    if (!spSelectedPost || !spSubmitUrl.trim()) return;
    try {
      const r = await fetch(`${SP_API}/submit-link`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: spSelectedPost.id, post_url: spSubmitUrl.trim() }) });
      const data = await r.json();
      if (data.status === "success") { setSpSelectedPost(null); if (tab === "today") await loadToday(); else await loadWeekly(); }
      else setError(data.error || "Submit failed");
    } catch { setError("Submit link failed"); }
  };

  const approveAllWeek = async () => {
    await fetch(`${API}/approve-all?week=${weekStart}`, { method: "PUT" });
    await loadWeekly();
  };

  // ── Loading state ──
  if (!ctx) {
    return (
      <div className="min-h-screen bg-[#0c0c0d] text-[#f5f5f7] flex items-center justify-center">
        {error ? (
          <div className="text-center">
            <div className="text-[#ef4444] font-bold mb-2">Backend Offline</div>
            <code className="text-xs text-[#a1a1aa] bg-[#1c1c1f] px-3 py-1.5 rounded">
              cd agent-system && python -m uvicorn src.main:app --port 8001
            </code>
          </div>
        ) : (
          <div className="text-[#71717a] text-sm">Loading...</div>
        )}
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#0c0c0d] text-[#f5f5f7]">
      {/* ══ HEADER ══ */}
      <header className="border-b border-[#2e2e33] bg-[#141416] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: "Syne, sans-serif" }}>
            {ctx.name.replace(".vn", "")}<span className="text-[#e8a020]">.vn</span>
          </h1>
          <span className="text-[10px] text-[#71717a] bg-[#242428] px-2 py-0.5 rounded">Marketing Department</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#71717a]">
          <span>{ctx.stats.registered_contractors}+ thợ</span>
          <span>{ctx.stats.completed_projects}+ dự án</span>
          <span>{ctx.stats.appointments_created}+ lượt đặt</span>
        </div>
      </header>

      {/* ══ TAB BAR ══ */}
      <div className="border-b border-[#2e2e33] bg-[#141416] px-6 flex gap-0">
        {([
          ["today", "Hôm nay"],
          ["weekly", "Kế hoạch tuần"],
          ["intelligence", "Intelligence"],
          ["quarterly", "Báo cáo quý"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === key
                ? "border-[#e8a020] text-[#e8a020]"
                : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-6 mt-4">
          <ErrorBox onDismiss={() => setError("")}>{error}</ErrorBox>
        </div>
      )}

      <div className={`mx-auto px-6 py-6 ${tab === "weekly" || tab === "today" ? "max-w-[1400px]" : "max-w-6xl"}`}>
        {/* ══════ TAB: HÔM NAY ══════ */}
        {tab === "today" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                  Bài đăng hôm nay
                </h2>
                <p className="text-xs text-[#71717a] mt-0.5">
                  {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={loadToday} className="text-xs text-[#71717a] hover:text-[#a1a1aa] cursor-pointer">
                Refresh
              </button>
            </div>

            {todayLoading ? (
              <Spinner text="Đang tải..." />
            ) : todayPosts.length === 0 ? (
              <EmptyState
                title="Chưa có bài nào cho hôm nay"
                description="Tạo kế hoạch tuần trong tab 'Kế hoạch tuần' để có bài đăng mỗi ngày."
                action={() => setTab("weekly")}
                actionLabel="→ Tạo kế hoạch tuần"
              />
            ) : (
              <div className="flex gap-6">
                {/* ── LEFT: Editable post list ── */}
                <div className="flex-1 min-w-0 space-y-4">
                  {todayPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      isSelected={previewPost?.id === post.id}
                      onSelect={() => setPreviewPost(post)}
                      isEditing={editingId === post.id}
                      editForm={editForm}
                      onStartEdit={() => {
                        setEditingId(post.id);
                        setEditForm({
                          hook: post.hook, body: post.body, cta: post.cta,
                          hashtags: post.hashtags, image_prompt: post.image_prompt,
                        });
                      }}
                      onCancelEdit={() => { setEditingId(null); setEditForm({}); }}
                      onSaveEdit={() => saveEdit(post.id)}
                      onEditChange={(changes) => setEditForm(prev => ({ ...prev, ...changes }))}
                      onApprove={() => approvePost(post.id)}
                      onReject={() => rejectPost(post.id)}
                      onRevert={() => revertDraft(post.id)}
                      onDelete={() => deletePost(post.id)}
                      onGenerateImage={() => generateImage(post.id)}
                      onManualPost={() => openManualPost(post)}
                      onGenerateVideo={() => generateVideo(post.id)}
                      isVideoLoading={videoLoadingId === post.id}
                      isImageLoading={imageLoadingId === post.id}
                    />
                  ))}
                </div>

                {/* ── RIGHT: Preview panel (sticky) ── */}
                <div className="w-[420px] shrink-0">
                  <div className="sticky top-6">
                    {previewPost ? (
                      <PhonePreview post={previewPost} />
                    ) : (
                      <div className="bg-[#141416] border border-[#2e2e33] rounded-2xl p-8 text-center">
                        <div className="text-[#71717a] text-sm mb-1">Preview</div>
                        <p className="text-[10px] text-[#52525b]">Bấm vào bài đăng bên trái để xem trước</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: KẾ HOẠCH TUẦN ══════ */}
        {tab === "weekly" && (
          <div>
            {/* Week navigation + generate */}
            <div className="flex items-start justify-between mb-6 gap-6">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                  Kế hoạch tuần
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      const d = new Date(weekStart);
                      d.setDate(d.getDate() - 7);
                      setWeekStart(getMonday(d));
                    }}
                    className="text-xs text-[#71717a] hover:text-[#a1a1aa] cursor-pointer"
                  >
                    ← Tuần trước
                  </button>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(getMonday(new Date(e.target.value)))}
                    className="bg-[#1c1c1f] border border-[#2e2e33] rounded px-3 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#e8a020]"
                  />
                  <button
                    onClick={() => {
                      const d = new Date(weekStart);
                      d.setDate(d.getDate() + 7);
                      setWeekStart(getMonday(d));
                    }}
                    className="text-xs text-[#71717a] hover:text-[#a1a1aa] cursor-pointer"
                  >
                    Tuần sau →
                  </button>
                </div>
                {weeklyData && (
                  <div className="flex gap-3 mt-2 text-[10px]">
                    <span className="text-[#71717a]">{weeklyData.week}</span>
                    <span className="text-[#71717a]">{weeklyData.total} bài</span>
                    {weeklyData.by_status.draft > 0 && <span className="text-[#a1a1aa]">{weeklyData.by_status.draft} draft</span>}
                    {weeklyData.by_status.approved > 0 && <span className="text-[#e8a020]">{weeklyData.by_status.approved} approved</span>}
                    {weeklyData.by_status.posted > 0 && <span className="text-[#22c4a0]">{weeklyData.by_status.posted} posted</span>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {weeklyData && weeklyData.by_status.draft > 0 && (
                  <button
                    onClick={approveAllWeek}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#e8a020] text-[#e8a020] hover:bg-[rgba(232,160,32,0.1)] cursor-pointer transition-all"
                  >
                    Duyệt tất cả ({weeklyData.by_status.draft})
                  </button>
                )}
              </div>
            </div>

            {/* Generate Plan Form */}
            {(!weeklyData || weeklyData.total === 0) && !generating && (
              <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-6 mb-6">
                <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
                  Tạo kế hoạch content cho tuần
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Angle ưu tiên (optional)</Label>
                    <div className="flex gap-2">
                      {ctx.angles.map((a) => (
                        <button
                          key={a.name}
                          onClick={() => setPlanAngle(planAngle === a.name ? "" : a.name)}
                          className={`flex-1 p-2 rounded border text-left cursor-pointer transition-all text-[11px] ${
                            planAngle === a.name
                              ? "border-[#e8a020] bg-[rgba(232,160,32,0.1)] text-[#e8a020]"
                              : "border-[#2e2e33] bg-[#1c1c1f] text-[#a1a1aa] hover:border-[#71717a]"
                          }`}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Số bài/ngày</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <button key={n} onClick={() => setPostsPerDay(n)}
                          className={`w-10 h-10 rounded text-xs font-bold cursor-pointer transition-all ${postsPerDay === n ? "bg-[#e8a020] text-black" : "bg-[#1c1c1f] border border-[#2e2e33] text-[#a1a1aa] hover:border-[#71717a]"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Reels/ngày</Label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((n) => (
                        <button key={n} onClick={() => setReelsPerDay(n)}
                          className={`w-10 h-10 rounded text-xs font-bold cursor-pointer transition-all ${reelsPerDay === n ? "bg-[#ef4444] text-white" : "bg-[#1c1c1f] border border-[#2e2e33] text-[#a1a1aa] hover:border-[#71717a]"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <Label>Ghi chú CEO (optional)</Label>
                  <textarea
                    value={planContext}
                    onChange={(e) => setPlanContext(e.target.value)}
                    placeholder='VD: "Tuần này push thợ điều hòa vì sắp vào hè", "Focus vào câu chuyện thành công"'
                    rows={2}
                    className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f7] outline-none focus:border-[#e8a020] placeholder:text-[#4a4a4f] resize-none"
                  />
                </div>

                <button
                  onClick={handleGeneratePlan}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 transition-all"
                >
                  AI Tạo Kế Hoạch ({7 * postsPerDay} bài + {7 * reelsPerDay} reels, 7 ngày)
                </button>
              </div>
            )}

            {generating && <Spinner text="AI đang lên kế hoạch tuần..." />}

            {/* Weekly posts — 2-column: edit list | preview */}
            {weeklyLoading ? (
              <Spinner text="Đang tải..." />
            ) : weeklyData && weeklyData.total > 0 ? (
              <div className="flex gap-6">
                {/* ── LEFT COLUMN: Post list (editable) ── */}
                <div className="flex-1 min-w-0 space-y-6">
                  {groupByDate(weeklyData.posts).map(([date, posts]) => (
                    <div key={date}>
                      <div className={`flex items-center gap-3 mb-3 ${isToday(date) ? "text-[#e8a020]" : "text-[#a1a1aa]"}`}>
                        <h3 className="text-sm font-bold">{formatDate(date)}</h3>
                        {isToday(date) && <span className="text-[10px] bg-[rgba(232,160,32,0.15)] px-2 py-0.5 rounded font-semibold">HÔM NAY</span>}
                        <span className="text-[10px] text-[#71717a]">{posts.length} bài</span>
                      </div>
                      <div className="space-y-2 ml-0">
                        {posts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            compact
                            isSelected={previewPost?.id === post.id}
                            onSelect={() => setPreviewPost(post)}
                            isEditing={editingId === post.id}
                            editForm={editForm}
                            onStartEdit={() => {
                              setEditingId(post.id);
                              setEditForm({
                                hook: post.hook, body: post.body, cta: post.cta,
                                hashtags: post.hashtags, image_prompt: post.image_prompt,
                                scheduled_time: post.scheduled_time,
                              });
                            }}
                            onCancelEdit={() => { setEditingId(null); setEditForm({}); }}
                            onSaveEdit={() => saveEdit(post.id)}
                            onEditChange={(changes) => setEditForm(prev => ({ ...prev, ...changes }))}
                            onApprove={() => approvePost(post.id)}
                            onReject={() => rejectPost(post.id)}
                            onRevert={() => revertDraft(post.id)}
                            onDelete={() => deletePost(post.id)}
                            onGenerateImage={() => generateImage(post.id)}
                            onManualPost={() => openManualPost(post)}
                            onGenerateVideo={() => generateVideo(post.id)}
                            isVideoLoading={videoLoadingId === post.id}
                            isImageLoading={imageLoadingId === post.id}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Regenerate button */}
                  <div className="pt-4 border-t border-[#2e2e33]">
                    <button
                      onClick={handleGeneratePlan}
                      disabled={generating}
                      className="px-4 py-2 rounded-lg text-xs border border-[#2e2e33] text-[#a1a1aa] hover:text-[#f5f5f7] hover:border-[#71717a] cursor-pointer transition-all disabled:opacity-40"
                    >
                      {generating ? "Đang tạo..." : "Tạo thêm bài cho tuần này"}
                    </button>
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Preview panel (sticky) ── */}
                <div className="w-[420px] shrink-0">
                  <div className="sticky top-6">
                    {previewPost ? (
                      <PhonePreview post={previewPost} />
                    ) : (
                      <div className="bg-[#141416] border border-[#2e2e33] rounded-2xl p-8 text-center">
                        <div className="text-[#71717a] text-sm mb-1">Preview</div>
                        <p className="text-[10px] text-[#52525b]">Bấm vào bài đăng bên trái để xem trước</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ══════ TAB: INTELLIGENCE ══════ */}
        {tab === "intelligence" && (
          <div>
            {/* Header + summary */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Intelligence Hub</h2>
                <p className="text-xs text-[#71717a] mt-0.5">
                  {intelDash ? `${intelDash.summary.total_hypotheses} hypotheses | ${intelDash.summary.total_insights} insights | ${intelDash.summary.total_scans} scans` : "Loading..."}
                </p>
              </div>
            </div>

            {/* Summary cards */}
            {intelDash && (
              <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="bg-[#141416] border border-[#2e2e33] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-[#3b82f6]" style={{ fontFamily: "IBM Plex Mono" }}>{intelDash.summary.tier1}</div>
                  <div className="text-[10px] text-[#71717a]">Tier 1</div>
                </div>
                <div className="bg-[#141416] border border-[#2e2e33] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-[#e8a020]" style={{ fontFamily: "IBM Plex Mono" }}>{intelDash.summary.tier2}</div>
                  <div className="text-[10px] text-[#71717a]">Tier 2</div>
                </div>
                <div className="bg-[#141416] border border-[#2e2e33] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-[#22c55e]" style={{ fontFamily: "IBM Plex Mono" }}>{intelDash.summary.tier3}</div>
                  <div className="text-[10px] text-[#71717a]">Tier 3</div>
                </div>
                <div className="bg-[#141416] border border-[#2e2e33] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-[#a1a1aa]" style={{ fontFamily: "IBM Plex Mono" }}>{intelDash.summary.total_insights}</div>
                  <div className="text-[10px] text-[#71717a]">Insights</div>
                </div>
                <div className="bg-[#141416] border border-[#2e2e33] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-[#8b5cf6]" style={{ fontFamily: "IBM Plex Mono" }}>{intelDash.summary.total_patterns}</div>
                  <div className="text-[10px] text-[#71717a]">Patterns</div>
                </div>
              </div>
            )}

            {/* Section tabs */}
            <div className="flex gap-0 border-b border-[#2e2e33] mb-5">
              {([
                ["market", "Market", "#3b82f6"],
                ["competitor", "Competitor", "#ef4444"],
                ["audience", "Audience", "#22c55e"],
                ["social", "Social", "#f59e0b"],
                ["hypotheses", "Hypotheses", "#e8a020"],
              ] as [IntelSection, string, string][]).map(([key, label, color]) => (
                <button key={key} onClick={() => setIntelSection(key)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    intelSection === key ? `text-[${color}]` : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
                  }`}
                  style={intelSection === key ? { borderColor: color, color } : {}}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── MARKET SECTION ── */}
            {intelSection === "market" && (() => {
              const scan = intelDash?.scan_history.find(s => s.scan_type === "market");
              const signals = scan?.data?.signals || [];
              const trends = scan?.data?.trends || [];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Market Signals & Trends</h3>
                      {scan && <p className="text-[10px] text-[#71717a]">Last scan: {new Date(scan.created_at).toLocaleString("vi-VN")}</p>}
                    </div>
                    <button onClick={scanMarket} disabled={scanningMarket}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                      {scanningMarket ? "Scanning..." : "Scan Market"}
                    </button>
                  </div>

                  {signals.length === 0 && trends.length === 0 ? (
                    <EmptyState title="Chưa có dữ liệu Market" description="Scan market để phát hiện tín hiệu và xu hướng thị trường."
                      action={scanMarket} actionLabel="Scan Market" />
                  ) : (
                    <>
                      {/* Signals */}
                      {signals.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b82f6] mb-3">Signals ({signals.length})</h4>
                          <div className="space-y-3">
                            {signals.map((s: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold">{s.title}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(59,130,246,0.1)] text-[#3b82f6]">{s.type}</span>
                                    <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => (
                                      <div key={i} className={`w-1.5 h-3 rounded-sm ${i < (s.strength || 0) ? "bg-[#3b82f6]" : "bg-[#2e2e33]"}`} />
                                    ))}</div>
                                  </div>
                                </div>
                                <p className="text-xs text-[#a1a1aa]">{s.evidence}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trends */}
                      {trends.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#22c55e] mb-3">Trends ({trends.length})</h4>
                          <div className="space-y-2">
                            {trends.map((t: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 py-2 border-b border-[#1c1c1f] last:border-0">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{t.title}</p>
                                  <p className="text-xs text-[#71717a] mt-0.5">{t.snippet}</p>
                                </div>
                                {t.url && <a href={t.url} target="_blank" rel="noopener" className="text-[10px] text-[#3b82f6] hover:underline shrink-0">Link</a>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── COMPETITOR SECTION ── */}
            {intelSection === "competitor" && (() => {
              const scan = intelDash?.scan_history.find(s => s.scan_type === "competitor");
              const competitors = scan?.data?.competitors || [];
              const gaps = scan?.data?.gaps || [];
              const contentTrends = scan?.data?.content_trends || [];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Competitor Analysis</h3>
                      {scan && <p className="text-[10px] text-[#71717a]">Last scan: {new Date(scan.created_at).toLocaleString("vi-VN")}</p>}
                    </div>
                    <button onClick={scanCompetitors} disabled={scanningCompetitor}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#ef4444] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                      {scanningCompetitor ? "Scanning..." : "Scan Competitors"}
                    </button>
                  </div>

                  {competitors.length === 0 && gaps.length === 0 ? (
                    <EmptyState title="Chưa có dữ liệu Competitor" description="Scan competitors để phân tích đối thủ và tìm khoảng trống."
                      action={scanCompetitors} actionLabel="Scan Competitors" />
                  ) : (
                    <>
                      {/* Competitors */}
                      {competitors.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#ef4444] mb-3">Competitors ({competitors.length})</h4>
                          <div className="space-y-3">
                            {competitors.map((c: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold">{c.name}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    c.threat_level === "high" ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444]" :
                                    c.threat_level === "medium" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]" :
                                    "bg-[rgba(34,197,94,0.1)] text-[#22c55e]"
                                  }`}>{c.threat_level || "—"}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><span className="text-[#22c55e] text-[10px]">Strength:</span> <span className="text-[#a1a1aa]">{c.strength}</span></div>
                                  <div><span className="text-[#ef4444] text-[10px]">Weakness:</span> <span className="text-[#a1a1aa]">{c.weakness}</span></div>
                                </div>
                                {c.content_strategy && <p className="text-[10px] text-[#71717a] mt-1">{c.content_strategy}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gaps */}
                      {gaps.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#e8a020] mb-3">Market Gaps ({gaps.length})</h4>
                          <div className="space-y-2">
                            {gaps.map((g: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-3">
                                <p className="text-xs font-bold text-[#f5f5f7]">{g.gap}</p>
                                <p className="text-xs text-[#22c55e] mt-1">{g.opportunity}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content Trends */}
                      {contentTrends.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b5cf6] mb-3">Content Trends ({contentTrends.length})</h4>
                          <div className="space-y-2">
                            {contentTrends.map((t: any, idx: number) => (
                              <div key={idx} className="py-2 border-b border-[#1c1c1f] last:border-0">
                                <p className="text-xs font-medium">{t.trend}</p>
                                <p className="text-[10px] text-[#71717a]">Used by: {t.who_uses} | {t.effectiveness}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── AUDIENCE SECTION ── */}
            {intelSection === "audience" && (() => {
              const scan = intelDash?.scan_history.find(s => s.scan_type === "audience");
              const supplyProfiles = scan?.data?.supply_profiles || [];
              const demandProfiles = scan?.data?.demand_profiles || [];
              const behaviors = scan?.data?.behaviors || [];
              const languagePatterns = scan?.data?.language_patterns || [];
              const gatheringPlaces = scan?.data?.gathering_places || [];
              const contentRecs = scan?.data?.content_recommendations || [];
              const hasData = supplyProfiles.length > 0 || demandProfiles.length > 0;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Audience Research</h3>
                      {scan && <p className="text-[10px] text-[#71717a]">Last scan: {new Date(scan.created_at).toLocaleString("vi-VN")}</p>}
                    </div>
                    <button onClick={scanAudience} disabled={scanningAudience}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#22c55e] text-black cursor-pointer hover:brightness-110 disabled:opacity-40">
                      {scanningAudience ? "Scanning..." : "Scan Audience"}
                    </button>
                  </div>

                  {!hasData ? (
                    <EmptyState title="Chưa có dữ liệu Audience" description="Scan audience để nghiên cứu chân dung khách hàng."
                      action={scanAudience} actionLabel="Scan Audience" />
                  ) : (
                    <>
                      {/* Supply profiles */}
                      {supplyProfiles.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b82f6] mb-3">Supply Side - Thợ ({supplyProfiles.length})</h4>
                          <div className="space-y-3">
                            {supplyProfiles.map((p: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold">{p.segment_name}</span>
                                  {p.underservice_score && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-[#71717a]">Underserved:</span>
                                      <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => (
                                        <div key={i} className={`w-1.5 h-3 rounded-sm ${i < p.underservice_score ? "bg-[#ef4444]" : "bg-[#2e2e33]"}`} />
                                      ))}</div>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-[#a1a1aa] mb-1">{p.job_to_be_done}</p>
                                {p.pain_points && <div className="flex flex-wrap gap-1 mt-1">{p.pain_points.map((pp: string, i: number) => (
                                  <span key={i} className="text-[10px] bg-[rgba(239,68,68,0.1)] text-[#ef4444] px-1.5 py-0.5 rounded">{pp}</span>
                                ))}</div>}
                                {p.switching_trigger && <p className="text-[10px] text-[#e8a020] mt-1">Trigger: {p.switching_trigger}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Demand profiles */}
                      {demandProfiles.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#22c55e] mb-3">Demand Side - Chủ nhà ({demandProfiles.length})</h4>
                          <div className="space-y-3">
                            {demandProfiles.map((p: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-3">
                                <span className="text-sm font-bold">{p.segment_name}</span>
                                <p className="text-xs text-[#a1a1aa] mt-1">{p.job_to_be_done}</p>
                                {p.pain_points && <div className="flex flex-wrap gap-1 mt-1">{p.pain_points.map((pp: string, i: number) => (
                                  <span key={i} className="text-[10px] bg-[rgba(239,68,68,0.1)] text-[#ef4444] px-1.5 py-0.5 rounded">{pp}</span>
                                ))}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Language patterns */}
                      {languagePatterns.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] mb-3">Language Patterns ({languagePatterns.length})</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {languagePatterns.map((lp: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-2">
                                <p className="text-xs font-bold">&ldquo;{lp.phrase}&rdquo;</p>
                                <p className="text-[10px] text-[#71717a]">{lp.context}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-[10px] text-[#3b82f6]">{lp.side}</span>
                                  {lp.content_angle && <span className="text-[10px] text-[#8b5cf6]">{lp.content_angle}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gathering places */}
                      {gatheringPlaces.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#06b6d4] mb-3">Gathering Places ({gatheringPlaces.length})</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {gatheringPlaces.map((gp: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-2 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold">{gp.specific_place}</p>
                                  <p className="text-[10px] text-[#71717a]">{gp.platform} | {gp.side}</p>
                                </div>
                                <span className={`text-[10px] font-bold ${gp.activity_level === "high" ? "text-[#22c55e]" : gp.activity_level === "medium" ? "text-[#f59e0b]" : "text-[#71717a]"}`}>
                                  {gp.activity_level}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content recommendations */}
                      {contentRecs.length > 0 && (
                        <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#ec4899] mb-3">Content Ideas ({contentRecs.length})</h4>
                          <div className="space-y-2">
                            {contentRecs.map((cr: any, idx: number) => (
                              <div key={idx} className="bg-[#1c1c1f] rounded-lg p-3">
                                <p className="text-xs font-bold">{cr.content_idea}</p>
                                <p className="text-[10px] text-[#a1a1aa] mt-0.5">{cr.insight}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-[10px] text-[#3b82f6]">{cr.target}</span>
                                  {cr.angle && <span className="text-[10px] text-[#8b5cf6]">{cr.angle}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── SOCIAL SECTION ── */}
            {intelSection === "social" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Social Listening</h3>
                    <p className="text-[10px] text-[#71717a]">{insights.length} pain phrases collected</p>
                  </div>
                  <button onClick={scanInsights} disabled={scanning}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#f59e0b] text-black cursor-pointer hover:brightness-110 disabled:opacity-40">
                    {scanning ? "Scanning..." : "Scan Social"}
                  </button>
                </div>

                {insights.length === 0 ? (
                  <EmptyState title="Chưa có social insights" description="Scan social listening để thu thập pain phrases từ cộng đồng."
                    action={scanInsights} actionLabel="Scan Social" />
                ) : (
                  <div className="space-y-4">
                    {["demand", "pain", "desire", "objection", "competitor"].map(seg => {
                      const items = insights.filter(i => i.segment === seg);
                      if (items.length === 0) return null;
                      const segColors: Record<string, string> = {
                        demand: "#3b82f6", pain: "#ef4444", desire: "#22c55e", objection: "#f59e0b", competitor: "#8b5cf6",
                      };
                      const segLabels: Record<string, string> = {
                        demand: "Nhu cầu", pain: "Nỗi đau", desire: "Mong muốn", objection: "Phản đối", competitor: "Đối thủ",
                      };
                      return (
                        <div key={seg} className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: segColors[seg] }}>
                            {segLabels[seg] || seg} ({items.length})
                          </h3>
                          <div className="space-y-2">
                            {items.map(i => (
                              <div key={i.id} className="flex items-start gap-3 py-2 border-b border-[#1c1c1f] last:border-0">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">&ldquo;{i.pain_phrase}&rdquo;</p>
                                  {i.sentiment && <p className="text-[10px] text-[#71717a] mt-0.5">{i.sentiment}</p>}
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-[#71717a]">{i.source}</span>
                                  {i.frequency > 1 && <span className="ml-2 text-[10px] font-bold text-[#e8a020]">x{i.frequency}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── HYPOTHESES SECTION ── */}
            {intelSection === "hypotheses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Hypothesis Backlog</h3>
                    <p className="text-[10px] text-[#71717a]">
                      {intelDash ? `${intelDash.hypotheses.length} active hypotheses` : ""}
                    </p>
                  </div>
                  <button onClick={generateHypotheses} disabled={generatingHypotheses}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 disabled:opacity-40">
                    {generatingHypotheses ? "Generating..." : "AI Generate Hypotheses"}
                  </button>
                </div>

                {!intelDash || intelDash.hypotheses.length === 0 ? (
                  <EmptyState title="Chưa có hypotheses" description="Scan market/competitor/audience trước, sau đó bấm 'AI Generate Hypotheses'."
                    action={generateHypotheses} actionLabel="Generate Hypotheses" />
                ) : (
                  <div className="space-y-3">
                    {[3, 2, 1].map(tier => {
                      const items = intelDash!.hypotheses.filter(h => h.tier === tier);
                      if (items.length === 0) return null;
                      const tierColors = { 3: "#22c55e", 2: "#e8a020", 1: "#3b82f6" };
                      const tierLabels = { 3: "Tier 3 — Ready to Execute", 2: "Tier 2 — Validated", 1: "Tier 1 — New" };
                      return (
                        <div key={tier}>
                          <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tierColors[tier as keyof typeof tierColors] }}>
                            {tierLabels[tier as keyof typeof tierLabels]} ({items.length})
                          </h4>
                          <div className="space-y-2 mb-4">
                            {items.map(h => (
                              <div key={h.id} className="bg-[#141416] border border-[#2e2e33] rounded-xl p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-bold">{h.title}</p>
                                    {h.description && <p className="text-xs text-[#a1a1aa] mt-1">{h.description}</p>}
                                    <div className="flex items-center gap-3 mt-2">
                                      {h.signal_type && <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]">{h.signal_type}</span>}
                                      {h.signal_score != null && (
                                        <span className="text-[10px] text-[#71717a]">Score: <span className="font-bold text-[#f5f5f7]">{h.signal_score}</span></span>
                                      )}
                                      {h.stress_test?.verdict && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                          h.stress_test.verdict === "proceed" ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e]" :
                                          h.stress_test.verdict === "caution" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]" :
                                          "bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
                                        }`}>{h.stress_test.verdict}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {h.tier < 3 && (
                                      <button onClick={() => promoteHypothesis(h.id, h.tier + 1)}
                                        className="px-2 py-1 rounded text-[10px] font-bold border border-[#22c55e] text-[#22c55e] hover:bg-[rgba(34,197,94,0.1)] cursor-pointer transition-all"
                                        title="Promote">
                                        Tier {h.tier + 1}
                                      </button>
                                    )}
                                    {!h.stress_test && (
                                      <button onClick={() => stressTestHypothesis(h.id)} disabled={stressTestingId === h.id}
                                        className="px-2 py-1 rounded text-[10px] font-bold border border-[#f59e0b] text-[#f59e0b] hover:bg-[rgba(245,158,11,0.1)] cursor-pointer transition-all disabled:opacity-40"
                                        title="Stress Test">
                                        {stressTestingId === h.id ? "..." : "Test"}
                                      </button>
                                    )}
                                    <button onClick={() => archiveHypothesis(h.id)}
                                      className="px-2 py-1 rounded text-[10px] border border-[#2e2e33] text-[#71717a] hover:text-[#ef4444] hover:border-[#ef4444] cursor-pointer transition-all"
                                      title="Archive">
                                      x
                                    </button>
                                  </div>
                                </div>

                                {/* Stress test results */}
                                {h.stress_test && (
                                  <div className="mt-3 pt-3 border-t border-[#2e2e33]">
                                    <p className="text-[10px] font-bold text-[#71717a] uppercase mb-1">Stress Test Result</p>
                                    {h.stress_test.recommendation && <p className="text-xs text-[#a1a1aa]">{h.stress_test.recommendation}</p>}
                                    {h.stress_test.critical_weaknesses?.length > 0 && (
                                      <div className="mt-1">
                                        {h.stress_test.critical_weaknesses.map((w: string, i: number) => (
                                          <p key={i} className="text-[10px] text-[#ef4444]">- {w}</p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: BÁO CÁO QUÝ ══════ */}
        {tab === "quarterly" && (
          <div>
            <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
              Báo cáo hiệu suất
            </h2>

            {!stats ? (
              <Spinner text="Đang tải..." />
            ) : stats.total_posts === 0 ? (
              <EmptyState
                title="Chưa có dữ liệu"
                description="Bắt đầu bằng việc tạo kế hoạch tuần đầu tiên."
                action={() => setTab("weekly")}
                actionLabel="→ Tạo kế hoạch tuần"
              />
            ) : (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Tổng bài" value={stats.total_posts} />
                  <StatCard label="Đã đăng" value={stats.total_posted} color="teal" />
                  <StatCard label="Chờ duyệt" value={stats.total_draft} color="amber" />
                  <StatCard label="Từ chối" value={stats.total_rejected} color="red" />
                </div>

                {/* By angle */}
                <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3">Theo Angle</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(stats.by_angle).map(([angle, count]) => (
                      <div key={angle} className="bg-[#1c1c1f] rounded-lg p-3">
                        <div className="text-xs text-[#71717a] mb-1">{angle}</div>
                        <div className="text-xl font-bold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>{count}</div>
                        <div className="text-[10px] text-[#71717a]">bài đã đăng</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By week */}
                <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3">Theo Tuần</h3>
                  <div className="space-y-2">
                    {stats.weeks.map((wk) => {
                      const d = stats.by_week[wk];
                      if (!d) return null;
                      const pct = d.total > 0 ? Math.round((d.posted / d.total) * 100) : 0;
                      return (
                        <div key={wk} className="flex items-center gap-4 py-2 border-b border-[#1c1c1f]">
                          <span className="text-xs font-mono text-[#a1a1aa] w-20">{wk}</span>
                          <div className="flex-1 bg-[#1c1c1f] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#22c4a0] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-[#71717a] w-24 text-right">{d.posted}/{d.total} posted</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ MANUAL POST MODAL ══ */}
      {spSelectedPost && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSpSelectedPost(null)}>
          <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Đăng bài thủ công</h3>
            {/* Step 1: Copy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${spCopied ? "bg-[#22c55e] text-black" : "bg-[#e8a020] text-black"}`}>1</span>
                <span className="text-sm font-medium">Copy nội dung</span>
              </div>
              <textarea readOnly
                value={`${spSelectedPost.hook || ""}\n\n${spSelectedPost.body || ""}\n\n${spSelectedPost.cta || ""}\n\n${(spSelectedPost.hashtags || []).join(" ")}`.trim()}
                className="w-full h-32 bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3 text-xs text-[#a1a1aa] resize-none" />
              {spSelectedPost.image_url && <p className="text-[10px] text-[#71717a]">Ảnh: lưu ảnh từ preview rồi upload lên Facebook</p>}
              <button onClick={copyPostContent}
                className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${spCopied ? "bg-[#22c55e] text-black" : "bg-[#e8a020] text-black hover:brightness-110"}`}>
                {spCopied ? "Đã copy!" : "Copy nội dung"}
              </button>
            </div>
            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${spCopied ? "bg-[#e8a020] text-black" : "bg-[#2e2e33] text-[#71717a]"}`}>2</span>
                <span className="text-sm font-medium">Đăng lên Facebook (Page / Group / Timeline)</span>
              </div>
              <p className="text-xs text-[#71717a]">Mở Facebook, paste nội dung, đăng bài.</p>
            </div>
            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#2e2e33] text-[#71717a]">3</span>
                <span className="text-sm font-medium">Paste link bài đã đăng</span>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="https://facebook.com/..." value={spSubmitUrl} onChange={e => setSpSubmitUrl(e.target.value)}
                  className="flex-1 bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020]" />
                <button onClick={submitPostLink} disabled={!spSubmitUrl.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 transition-all disabled:opacity-40">
                  Lưu link
                </button>
              </div>
            </div>
            <button onClick={() => setSpSelectedPost(null)}
              className="w-full py-2 rounded-lg text-sm text-[#71717a] border border-[#2e2e33] cursor-pointer hover:text-white transition-all">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper: Group posts by date ──

function groupByDate(posts: Post[]): [string, Post[]][] {
  const map: Record<string, Post[]> = {};
  for (const p of posts) {
    const d = p.scheduled_date;
    if (!map[d]) map[d] = [];
    map[d].push(p);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

// ── Post Card Component ──

function PostCard({
  post, compact, isSelected, onSelect, isEditing, editForm, onStartEdit, onCancelEdit, onSaveEdit,
  onEditChange, onApprove, onReject, onRevert, onDelete, onGenerateImage,
  onManualPost, onGenerateVideo, isVideoLoading, isImageLoading,
}: {
  post: Post;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  isEditing: boolean;
  editForm: Partial<Post>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (changes: Partial<Post>) => void;
  onApprove: () => void;
  onReject: () => void;
  onRevert: () => void;
  onDelete: () => void;
  onGenerateImage: () => void;
  onManualPost: () => void;
  onGenerateVideo: () => void;
  isVideoLoading: boolean;
  isImageLoading: boolean;
}) {
  const FORMAT_LABELS: Record<string, [string, string]> = {
    longform: ["Dài", "#3b82f6"], shortform: ["Ngắn", "#22c55e"], storytelling: ["Story", "#f59e0b"],
    zero_click: ["0-click", "#06b6d4"], cta_focused: ["CTA", "#ec4899"],
  };
  const statusColors: Record<string, string> = {
    draft: "text-[#a1a1aa] bg-[rgba(161,161,170,0.1)]",
    approved: "text-[#e8a020] bg-[rgba(232,160,32,0.1)]",
    posted: "text-[#22c4a0] bg-[rgba(34,196,160,0.1)]",
    rejected: "text-[#ef4444] bg-[rgba(239,68,68,0.1)]",
  };

  const statusLabels: Record<string, string> = {
    draft: "DRAFT", approved: "APPROVED", posted: "POSTED", rejected: "REJECTED",
  };

  return (
    <div
      className={`bg-[#141416] border rounded-xl overflow-hidden transition-all ${
        isSelected ? "border-[#e8a020] ring-1 ring-[#e8a020]/30" :
        post.content_type === "reel" ? "border-[#ef4444]/30" : "border-[#2e2e33]"
      } ${post.status === "rejected" ? "opacity-50" : ""} ${onSelect ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (onSelect && !(e.target as HTMLElement).closest("button, input, textarea, a")) onSelect();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e33] bg-[#1c1c1f]">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColors[post.status] || ""}`}>
            {statusLabels[post.status] || post.status.toUpperCase()}
          </span>
          {post.content_type === "reel" && <span className="text-[10px] font-bold text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 rounded">REEL</span>}
          {post.content_format && post.content_type !== "reel" && (() => {
            const [label, color] = FORMAT_LABELS[post.content_format!] || [post.content_format, "#71717a"];
            return <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color, backgroundColor: `${color}1a` }}>{label}</span>;
          })()}
          <span className="text-[10px] text-[#71717a]">{post.scheduled_time || "—"}</span>
          {post.angle && <span className="text-[10px] text-[#8b5cf6] bg-[rgba(139,92,246,0.1)] px-2 py-0.5 rounded">{post.angle}</span>}
          {post.image_url && <span className="text-[10px] text-[#3b82f6]">has image</span>}
        </div>
        <div className="flex items-center gap-1">
          {post.status !== "posted" && (
            <>
              {!isEditing && (
                <SmallBtn onClick={onStartEdit} title="Sửa">✎</SmallBtn>
              )}
              <SmallBtn onClick={onDelete} title="Xóa" danger>×</SmallBtn>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          /* Edit mode */
          <div className="space-y-3">
            <div>
              <Label small>Hook</Label>
              <input
                value={editForm.hook || ""}
                onChange={(e) => onEditChange({ hook: e.target.value })}
                className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-sm text-[#f5f5f7] outline-none focus:border-[#e8a020]"
              />
            </div>
            <div>
              <Label small>Body</Label>
              <textarea
                value={editForm.body || ""}
                onChange={(e) => onEditChange({ body: e.target.value })}
                rows={3}
                className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-sm text-[#f5f5f7] outline-none focus:border-[#e8a020] resize-none"
              />
            </div>
            <div>
              <Label small>CTA</Label>
              <input
                value={editForm.cta || ""}
                onChange={(e) => onEditChange({ cta: e.target.value })}
                className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-sm text-[#f5f5f7] outline-none focus:border-[#e8a020]"
              />
            </div>
            <div>
              <Label small>Hashtags</Label>
              <input
                value={(editForm.hashtags || []).join(" ")}
                onChange={(e) => onEditChange({ hashtags: e.target.value.split(/\s+/).filter(Boolean) })}
                className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-[#3b82f6] outline-none focus:border-[#e8a020]"
              />
            </div>
            <div>
              <Label small>Image Prompt</Label>
              <textarea
                value={editForm.image_prompt || ""}
                onChange={(e) => onEditChange({ image_prompt: e.target.value })}
                rows={2}
                className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#e8a020] resize-none"
              />
            </div>
            {/* Show image in edit mode */}
            {post.image_url && (
              <div className="rounded-lg overflow-hidden border border-[#2e2e33]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="" className="w-full max-h-[200px] object-cover" />
              </div>
            )}
            <div>
              <Label small>Giờ đăng</Label>
              <input
                type="time"
                value={editForm.scheduled_time || ""}
                onChange={(e) => onEditChange({ scheduled_time: e.target.value })}
                className="bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#e8a020]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={onSaveEdit} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 transition-all">
                Lưu
              </button>
              <button onClick={onCancelEdit} className="px-4 py-2 rounded-lg text-xs border border-[#2e2e33] text-[#a1a1aa] cursor-pointer hover:text-[#f5f5f7] transition-all">
                Hủy
              </button>
              {(editForm.image_prompt || post.image_prompt) && (
                <button onClick={(e) => { e.stopPropagation(); onGenerateImage(); }} disabled={isImageLoading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#3b82f6] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)] cursor-pointer transition-all disabled:opacity-40">
                  {isImageLoading ? "Đang tạo ảnh..." : post.image_url ? "Tạo lại ảnh" : "Tạo ảnh AI"}
                </button>
              )}
              {post.content_type === "reel" && !post.video_url && (
                <button onClick={(e) => { e.stopPropagation(); onGenerateVideo(); }} disabled={isVideoLoading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] cursor-pointer transition-all disabled:opacity-40">
                  {isVideoLoading ? "Đang tạo video..." : "Tạo Video"}
                </button>
              )}
            </div>
            {isImageLoading && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[#a1a1aa]">Đang tạo ảnh...</span>
              </div>
            )}
          </div>
        ) : (
          /* View mode */
          <div>
            {/* Preview */}
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${compact ? "line-clamp-4" : ""}`}>
              <span className="font-semibold">{post.hook}</span>
              {"\n\n"}{post.body}
              {"\n\n"}<span className="text-[#a1a1aa]">{post.cta}</span>
              {"\n\n"}<span className="text-[#3b82f6] text-xs">{(post.hashtags || []).join(" ")}</span>
            </div>

            {/* Image */}
            {post.image_url && (
              <div className="mt-3 rounded-lg overflow-hidden border border-[#2e2e33]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="" className="w-full max-h-[200px] object-cover" />
              </div>
            )}

            {/* Image generation */}
            {!post.image_url && post.image_prompt && post.status !== "posted" && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onGenerateImage}
                  disabled={isImageLoading}
                  className="px-3 py-1.5 rounded text-[11px] font-semibold border border-[#2e2e33] text-[#a1a1aa] hover:border-[#3b82f6] hover:text-[#3b82f6] cursor-pointer transition-all disabled:opacity-40"
                >
                  {isImageLoading ? "Đang tạo ảnh..." : "Tạo ảnh AI"}
                </button>
                <span className="text-[10px] text-[#71717a] truncate flex-1">{post.image_prompt}</span>
              </div>
            )}
            {isImageLoading && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[#a1a1aa]">Đang tạo ảnh...</span>
              </div>
            )}

            {/* Post URL */}
            {post.post_url && (
              <div className="mt-3 bg-[rgba(34,196,160,0.05)] border border-[rgba(34,196,160,0.2)] rounded-lg p-2">
                <a href={post.post_url} target="_blank" rel="noopener" className="text-xs text-[#22c4a0] hover:underline break-all">
                  {post.post_url}
                </a>
              </div>
            )}

            {/* Reel section */}
            {post.content_type === "reel" && post.reel_script?.frames && (
              <div className="mt-3 space-y-2">
                <p className="text-[10px] font-bold text-[#ef4444] uppercase">Reel Frames ({post.reel_script.frames.length})</p>
                {post.reel_script.frames.map((frame: any, idx: number) => (
                  <div key={idx} className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#71717a]">Frame {idx + 1}</span>
                      <span className="text-[10px] text-[#52525b]">{frame.start_time}s-{frame.end_time}s</span>
                    </div>
                    <p className="text-xs font-bold">{frame.text_overlay}</p>
                    {frame.voiceover_text && <p className="text-[10px] text-[#a1a1aa] italic">{frame.voiceover_text}</p>}
                  </div>
                ))}
                {post.video_url ? (
                  <div className="space-y-2">
                    <video src={post.video_url} controls className="w-full rounded-lg border border-[#2e2e33]" />
                    <button onClick={onGenerateVideo} disabled={isVideoLoading}
                      className="w-full py-2 rounded-lg text-xs font-bold border border-[#ef4444] text-[#ef4444] cursor-pointer hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-40">
                      {isVideoLoading ? "Đang tạo..." : "Tạo lại video"}
                    </button>
                  </div>
                ) : (
                  <button onClick={onGenerateVideo} disabled={isVideoLoading}
                    className="w-full py-2 rounded-lg text-xs font-bold bg-[#ef4444] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                    {isVideoLoading ? "Đang tạo video..." : "Tạo Video"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      {!isEditing && post.status !== "posted" && post.status !== "rejected" && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#2e2e33] bg-[#1c1c1f]">
          {post.status === "draft" && (
            <>
              <button onClick={onApprove} className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[#e8a020] text-[#e8a020] hover:bg-[rgba(232,160,32,0.1)] cursor-pointer transition-all">
                Duyệt
              </button>
              <button onClick={onReject} className="py-2 px-4 rounded-lg text-xs border border-[#2e2e33] text-[#71717a] hover:text-[#ef4444] hover:border-[#ef4444] cursor-pointer transition-all">
                Từ chối
              </button>
            </>
          )}
          {post.status === "approved" && (
            <>
              <button onClick={onRevert} className="py-2 px-4 rounded-lg text-xs border border-[#2e2e33] text-[#a1a1aa] hover:text-[#f5f5f7] cursor-pointer transition-all">
                ← Draft
              </button>
              <button onClick={onManualPost}
                className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 transition-all">
                Lấy nội dung & Đăng thủ công
              </button>
            </>
          )}
        </div>
      )}
      {!isEditing && post.status === "posted" && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#2e2e33] bg-[#1c1c1f]">
          <button onClick={onManualPost} className="text-xs text-[#3b82f6] hover:underline cursor-pointer">
            Lấy nội dung (đăng thêm nhóm)
          </button>
        </div>
      )}
      {!isEditing && post.status === "rejected" && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#2e2e33] bg-[#1c1c1f]">
          <button onClick={onRevert} className="text-xs text-[#71717a] hover:text-[#a1a1aa] cursor-pointer">
            Khôi phục về Draft
          </button>
        </div>
      )}
    </div>
  );
}

// ── Small Components ──

function Label({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return <label className={`block font-semibold uppercase tracking-wider mb-1 ${small ? "text-[10px] text-[#71717a]" : "text-[11px] text-[#a1a1aa]"}`}>{children}</label>;
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-16">
      <div className="w-7 h-7 border-2 border-[#e8a020] border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-xs text-[#a1a1aa]">{text}</div>
    </div>
  );
}

function EmptyState({ title, description, action, actionLabel }: { title: string; description: string; action: () => void; actionLabel: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-sm font-semibold text-[#a1a1aa] mb-1">{title}</div>
      <div className="text-xs text-[#71717a] mb-4">{description}</div>
      <button onClick={action} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 transition-all">
        {actionLabel}
      </button>
    </div>
  );
}

function ErrorBox({ children, onDismiss }: { children: React.ReactNode; onDismiss?: () => void }) {
  return (
    <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-xs rounded-lg p-3 flex items-center justify-between">
      <span>{children}</span>
      {onDismiss && <button onClick={onDismiss} className="text-[#ef4444] hover:text-white cursor-pointer ml-2">×</button>}
    </div>
  );
}

function SmallBtn({ onClick, title, children, danger }: { onClick: () => void; title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer transition-all ${
        danger
          ? "text-[#71717a] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
          : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#242428]"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: "teal" | "amber" | "red" }) {
  const colors = {
    teal: "text-[#22c4a0]",
    amber: "text-[#e8a020]",
    red: "text-[#ef4444]",
  };
  return (
    <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-[#71717a] mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color ? colors[color] : "text-[#f5f5f7]"}`} style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        {value}
      </div>
    </div>
  );
}

// ── Phone Preview Component (Facebook-style) ──

function PhonePreview({ post }: { post: Post }) {
  const FORMAT_LABELS: Record<string, [string, string]> = {
    longform: ["Dài", "#3b82f6"], shortform: ["Ngắn", "#22c55e"], storytelling: ["Story", "#f59e0b"],
    zero_click: ["0-click", "#06b6d4"], cta_focused: ["CTA", "#ec4899"],
  };

  const isReel = post.content_type === "reel";
  const fullText = `${post.hook || ""}\n\n${post.body || ""}\n\n${post.cta || ""}`.trim();
  const hashtagStr = (post.hashtags || []).join(" ");

  return (
    <div className="bg-[#141416] border border-[#2e2e33] rounded-2xl overflow-hidden">
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e2e33]">
        <span className="text-xs font-bold text-[#a1a1aa]">Preview</span>
        <div className="flex items-center gap-2">
          {isReel && <span className="text-[10px] font-bold text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 rounded">REEL</span>}
          {post.content_format && (() => {
            const [label, color] = FORMAT_LABELS[post.content_format!] || [post.content_format, "#71717a"];
            return <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color, backgroundColor: `${color}1a` }}>{label}</span>;
          })()}
          <span className="text-[10px] text-[#71717a]">{post.scheduled_date} {post.scheduled_time || ""}</span>
        </div>
      </div>

      {/* Phone frame */}
      <div className="bg-[#000] mx-4 my-4 rounded-[24px] border-2 border-[#333] overflow-hidden" style={{ maxHeight: isReel ? "680px" : "600px" }}>
        {/* Status bar */}
        <div className="bg-[#000] px-5 py-1.5 flex items-center justify-between text-[10px] text-white/60">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {isReel ? (
          /* ── Reel Preview ── */
          <div className="relative bg-gradient-to-b from-[#1a1a2e] to-[#16213e]" style={{ aspectRatio: "9/16", maxHeight: "640px" }}>
            {/* Video or frames preview */}
            {post.video_url ? (
              <video src={post.video_url} controls className="absolute inset-0 w-full h-full object-cover" />
            ) : post.reel_script?.frames ? (
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                {post.reel_script.frames.map((frame: any, idx: number) => (
                  <div key={idx} className="mb-3 text-center">
                    <p className="text-white text-sm font-bold leading-snug drop-shadow-lg">{frame.text_overlay}</p>
                    {frame.voiceover_text && <p className="text-white/50 text-[10px] mt-0.5 italic">{frame.voiceover_text}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/30 text-sm">Reel Preview</span>
              </div>
            )}

            {/* Reel overlay UI */}
            <div className="absolute bottom-4 left-4 right-14">
              <p className="text-white text-xs font-bold drop-shadow">{post.hook}</p>
              {hashtagStr && <p className="text-[#3b82f6] text-[10px] mt-1 drop-shadow">{hashtagStr}</p>}
            </div>
            <div className="absolute bottom-4 right-3 flex flex-col items-center gap-4 text-white/70">
              <div className="text-center"><div className="text-lg">&#9825;</div><div className="text-[9px]">Like</div></div>
              <div className="text-center"><div className="text-lg">&#128172;</div><div className="text-[9px]">Comment</div></div>
              <div className="text-center"><div className="text-lg">&#8594;</div><div className="text-[9px]">Share</div></div>
            </div>
          </div>
        ) : (
          /* ── Post Preview (Facebook-style) ── */
          <div className="bg-[#242526] overflow-y-auto" style={{ maxHeight: "560px" }}>
            {/* FB header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-9 h-9 rounded-full bg-[#e8a020] flex items-center justify-center text-black text-xs font-bold shrink-0">DT</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#e4e6eb]">DoiTay.vn</p>
                <div className="flex items-center gap-1 text-[11px] text-[#b0b3b8]">
                  <span>{post.scheduled_date}</span>
                  <span>·</span>
                  <span>&#127760;</span>
                </div>
              </div>
              <span className="text-[#b0b3b8] text-lg">···</span>
            </div>

            {/* Post text */}
            <div className="px-3 pb-2">
              <div className="text-[13px] text-[#e4e6eb] leading-[1.35] whitespace-pre-wrap">
                {post.hook && <span className="font-bold">{post.hook}</span>}
                {post.hook && post.body && "\n\n"}
                {post.body}
                {post.cta && "\n\n"}
                {post.cta && <span className="text-[#e4e6eb]">{post.cta}</span>}
              </div>
              {hashtagStr && <p className="text-[#2d88ff] text-[12px] mt-1.5">{hashtagStr}</p>}
            </div>

            {/* Image */}
            {post.image_url ? (
              <div className="border-t border-b border-[#3a3b3c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="" className="w-full max-h-[300px] object-cover" />
              </div>
            ) : post.image_prompt ? (
              <div className="border-t border-b border-[#3a3b3c] bg-[#3a3b3c] h-[200px] flex items-center justify-center">
                <span className="text-[#b0b3b8] text-[11px] px-6 text-center">{post.image_prompt}</span>
              </div>
            ) : null}

            {/* FB reaction bar */}
            <div className="px-3 py-1.5 flex items-center justify-between text-[12px] text-[#b0b3b8]">
              <div className="flex items-center gap-1">
                <span className="text-sm">&#128077;&#10084;&#65039;</span>
                <span>...</span>
              </div>
              <span>... comments · ... shares</span>
            </div>

            {/* FB action buttons */}
            <div className="flex border-t border-[#3a3b3c] mx-3">
              <div className="flex-1 py-2 text-center text-[13px] text-[#b0b3b8] font-semibold">&#128077; Like</div>
              <div className="flex-1 py-2 text-center text-[13px] text-[#b0b3b8] font-semibold">&#128172; Comment</div>
              <div className="flex-1 py-2 text-center text-[13px] text-[#b0b3b8] font-semibold">&#8594; Share</div>
            </div>
          </div>
        )}
      </div>

      {/* Post meta below phone */}
      <div className="px-4 pb-4 space-y-2">
        {post.angle && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#71717a]">Angle:</span>
            <span className="text-[10px] text-[#8b5cf6] bg-[rgba(139,92,246,0.1)] px-2 py-0.5 rounded font-bold">{post.angle}</span>
          </div>
        )}
        {post.image_prompt && (
          <div>
            <span className="text-[10px] text-[#71717a]">Image prompt:</span>
            <p className="text-[10px] text-[#52525b] mt-0.5">{post.image_prompt}</p>
          </div>
        )}
        {isReel && post.reel_script?.frames && (
          <div>
            <span className="text-[10px] text-[#71717a]">Frames: {post.reel_script.frames.length} | Duration: {post.reel_script.duration_seconds || 10}s</span>
          </div>
        )}
      </div>
    </div>
  );
}
