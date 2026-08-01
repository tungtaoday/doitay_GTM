"use client";

import { useState, useEffect, useCallback } from "react";

const API = "/api/backend/marketing";
const CTX_API = "/api/backend/quick-post/context";
const SP_API = "/api/backend/social-poster";
const CI_API = "/api/backend/comment-inbox";
// Same-origin qua rewrite /api/backend (next.config: proxyTimeout 600s cho call dài).
// Dùng same-origin để truy cập từ xa (ngrok) chạy được — không hardcode localhost.
const DIRECT_API = "/api/backend/marketing";

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
  yt_video_id: string | null;
  yt_title: string | null;
  yt_description: string | null;
  yt_tags: string[] | null;
  yt_privacy: string | null;
  tt_video_id: string | null;
  tt_post_url: string | null;
  tt_publish_id: string | null;
  impressions: number | null;
  engagements: number | null;
  clicks: number | null;
  hypothesis_id: string | null;
  hypothesis_title: string | null;
  hypothesis_tier: number | null;
  ai_reasoning: string | null;
  gtm_engine: string | null;
  entry_point: string | null;
  routing_target: string | null;
  seed_comments: { text: string; type: string; trigger: string }[];
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
  total_views: number;
  total_reach: number;
  total_engagements: number;
  total_clicks: number;
  by_angle: Record<string, number>;
  engagement_by_angle: Record<string, { posts: number; impressions: number; engagements: number }>;
  weeks: string[];
  by_week: Record<string, { total: number; posted: number; impressions: number; engagements: number }>;
  posted_posts: {
    id: string; hook: string; angle: string; scheduled_date: string; posted_at: string;
    post_url: string; views: number; reach: number; engagements: number; clicks: number;
    comments: number; shares: number; reactions: number; image_url: string;
  }[];
  patterns: { id: string; category: string; title: string; description: string; result: string; confidence: number }[];
  hypotheses: { id: string; title: string; tier: number; signal_type: string; signal_score: number }[];
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
  user_state: string | null;
  decision_trigger: string | null;
  behavioral_pain: string | null;
  observable_action: string | null;
  optimization_target: string | null;
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

type Tab = "today" | "weekly" | "intelligence" | "quarterly" | "comment-inbox" | "distribution";

interface CommentRule {
  id: string;
  post_id: string;
  fb_post_id: string;
  keywords: string[];
  inbox_message: string;
  link: string;
  active: boolean;
  created_at: string;
  matches: number;
  sent: number;
}

interface CommentMatch {
  rule_id: string;
  fb_post_id: string;
  comment_id: string;
  fb_user_id: string;
  fb_user_name: string;
  comment_text: string;
  matched_keyword: string;
  inbox_message: string;
  link: string;
  created_time: string;
}

interface InboxLogEntry {
  id: string;
  fb_user_id: string;
  fb_user_name: string;
  message: string;
  rule_id: string;
  status: string;
  sent_at: string;
}
type IntelSection = "market" | "competitor" | "audience" | "social" | "hypotheses" | "synthetic";

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
  const [validatingHypotheses, setValidatingHypotheses] = useState(false);
  const [validateReport, setValidateReport] = useState<any>(null);
  const [reframingHypotheses, setReframingHypotheses] = useState(false);
  const [reframePreview, setReframePreview] = useState<any[]>([]);
  const [selectedReframes, setSelectedReframes] = useState<Set<string>>(new Set());

  // Synthetic Interview state
  const [synHistory, setSynHistory] = useState<any[]>([]);
  const [synLoading, setSynLoading] = useState(false);
  const [synActiveId, setSynActiveId] = useState<string | null>(null);
  const [synResults, setSynResults] = useState<Record<number, any>>({});
  const [synExpandedPhase, setSynExpandedPhase] = useState<number | null>(null);

  // Quarterly state
  const [stats, setStats] = useState<Stats | null>(null);
  const [syncingMetrics, setSyncingMetrics] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState<any>(null);

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
  const [spMediaCopied, setSpMediaCopied] = useState(false);

  // YouTube
  const [ytConnected, setYtConnected] = useState(false);
  const [ytChannel, setYtChannel] = useState<any>(null);
  const [ytUploading, setYtUploading] = useState(false);
  const [ytResult, setYtResult] = useState<any>(null);
  const [ytTitle, setYtTitle] = useState("");
  const [ytDesc, setYtDesc] = useState("");
  const [ytPrivacy, setYtPrivacy] = useState("private");

  // TikTok
  const [ttConnected, setTtConnected] = useState(false);
  const [ttUser, setTtUser] = useState<any>(null);
  const [ttUploading, setTtUploading] = useState(false);
  const [ttResult, setTtResult] = useState<any>(null);
  const [ttCaption, setTtCaption] = useState("");
  const [ttPrivacy, setTtPrivacy] = useState("SELF_ONLY");
  const [ttManualUrl, setTtManualUrl] = useState("");

  // Distribution
  const [distToday, setDistToday] = useState<any>(null);
  const [distLoading, setDistLoading] = useState(false);
  const [distGroups, setDistGroups] = useState<any[]>([]);
  const [morningScanning, setMorningScanning] = useState(false);
  const [morningMoments, setMorningMoments] = useState<any[]>([]);
  const [morningLinking, setMorningLinking] = useState(false);
  const [morningLinkResult, setMorningLinkResult] = useState<any>(null);
  const [eveningCapturing, setEveningCapturing] = useState(false);
  const [eveningResult, setEveningResult] = useState<any>(null);
  const [syncingDist, setSyncingDist] = useState(false);

  // Comment Inbox
  const [ciRules, setCiRules] = useState<CommentRule[]>([]);
  const [ciMatches, setCiMatches] = useState<CommentMatch[]>([]);
  const [ciLog, setCiLog] = useState<InboxLogEntry[]>([]);
  const [ciLoading, setCiLoading] = useState(false);
  const [ciScanning, setCiScanning] = useState(false);
  const [ciProcessing, setCiProcessing] = useState(false);
  const [ciNewRule, setCiNewRule] = useState({ fb_post_id: "", keywords: "", inbox_message: "", link: "", post_id: "" });
  const [ciShowForm, setCiShowForm] = useState(false);

  // Load context
  useEffect(() => {
    fetch(CTX_API, { signal: AbortSignal.timeout(12000) })
      .then(r => r.json())
      .then(setCtx)
      .catch(() => setError("Backend not reachable"));
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

  // Synthetic Interview functions
  const loadSynHistory = useCallback(async () => {
    try {
      const r = await fetch(`${DIRECT_API}/intel/decision-insights`);
      const data = await r.json();
      if (data.status === "success") setSynHistory(data.items || []);
    } catch {}
  }, []);

  const synRunPhase = async (phase: 1 | 2 | 3 | 4 | 5, insightId?: string) => {
    setSynLoading(true);
    try {
      let url = `${DIRECT_API}/intel/synthetic-interview/phase${phase}-`;
      const phaseNames: Record<number, string> = {
        1: "insights", 2: "personas", 3: "interview", 4: "decision-map", 5: "validate",
      };
      url += phaseNames[phase];
      const body = phase === 1 ? null : JSON.stringify(insightId || synActiveId);
      const params = phase === 1 ? "" : `?insight_id=${encodeURIComponent(insightId || synActiveId || "")}`;
      const r = await fetch(url + params, {
        method: "POST",
        headers: phase === 1 ? {} : { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(600000),
      });
      const data = await r.json();
      if (data.status === "success" || data.insight_id) {
        if (phase === 1 && data.insight_id) {
          setSynActiveId(data.insight_id);
          setSynResults({ 1: data });
        } else {
          setSynResults(prev => ({ ...prev, [phase]: data }));
        }
        setSynExpandedPhase(phase);
        await loadSynHistory();
      } else {
        setError(data.error || `Phase ${phase} failed`);
      }
    } catch (e: any) { setError(`Phase ${phase} error: ${e.message}`); }
    setSynLoading(false);
  };

  const synLoadExisting = async (id: string) => {
    setSynActiveId(id);
    setSynResults({});
    setSynExpandedPhase(null);
  };

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
    setError("");
    try {
      const r = await fetch(`${API}/intel/stress-test/${id}`, { method: "POST", signal: AbortSignal.timeout(300000) });
      const data = await r.json();
      if (data.status === "failed") {
        setError(`Stress test thất bại: ${data.error || "AI không trả về kết quả"}`);
      }
      await loadIntelDashboard();
    } catch (e: any) {
      setError(`Stress test lỗi: ${e?.message || "Timeout hoặc mất kết nối backend"}`);
    }
    setStressTestingId(null);
  };

  const reframeHypotheses = async () => {
    setReframingHypotheses(true);
    setReframePreview([]);
    setSelectedReframes(new Set());
    try {
      const r = await fetch(`${API}/intel/reframe-hypotheses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null), signal: AbortSignal.timeout(300000) });
      const data = await r.json();
      if (data.status === "success") {
        setReframePreview(data.reframed || []);
        const allIds = new Set<string>((data.reframed || []).map((item: any) => item.full_id || item.id));
        setSelectedReframes(allIds);
      } else setError(data.error || "Reframe failed");
    } catch { setError("Reframe hypotheses failed"); }
    setReframingHypotheses(false);
  };

  const confirmReframes = async () => {
    const toSave = reframePreview.filter(item => selectedReframes.has(item.full_id || item.id));
    try {
      const r = await fetch(`${API}/intel/reframe-hypotheses/confirm`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toSave) });
      const data = await r.json();
      if (data.status === "success") {
        setReframePreview([]);
        setSelectedReframes(new Set());
        await loadIntelDashboard();
      } else setError(data.error || "Confirm failed");
    } catch { setError("Confirm reframe failed"); }
  };

  const validateHypotheses = async () => {
    setValidatingHypotheses(true);
    setValidateReport(null);
    try {
      const r = await fetch(`${API}/validate-hypotheses`, { method: "POST", signal: AbortSignal.timeout(60000) });
      const data = await r.json();
      if (data.status === "success") {
        setValidateReport(data);
        await loadIntelDashboard();
      } else setError(data.error || "Validation failed");
    } catch { setError("Validate hypotheses failed"); }
    setValidatingHypotheses(false);
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

  const syncMetrics = async () => {
    setSyncingMetrics(true);
    try {
      await fetch(`${API}/sync-metrics`, { method: "POST", signal: AbortSignal.timeout(60000) });
      await loadStats();
    } catch { setError("Sync metrics failed"); }
    setSyncingMetrics(false);
  };

  const importFbCsv = async (file: File) => {
    setCsvImporting(true);
    setCsvImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/import/fb-csv`, { method: "POST", body: fd });
      const data = await r.json();
      setCsvImportResult(data);
      if (data.status === "success") await loadStats();
    } catch { setCsvImportResult({ status: "error", error: "Upload thất bại" }); }
    setCsvImporting(false);
  };

  // Auto-load on tab change
  useEffect(() => {
    if (tab === "today") loadToday();
    else if (tab === "weekly") loadWeekly();
    else if (tab === "intelligence") { loadInsights(); loadIntelDashboard(); loadSynHistory(); }
    else if (tab === "quarterly") loadStats();
    else if (tab === "comment-inbox") { loadCiRules(); loadCiLog(); }
    else if (tab === "distribution") { loadDistToday(); loadDistGroups(); }
  }, [tab, loadToday, loadWeekly, loadInsights, loadIntelDashboard, loadStats]);

  // Generate weekly plan
  const handleGeneratePlan = async (mode: "create" | "regenerate" = "create") => {
    if (mode === "regenerate") {
      if (!confirm("Xoá toàn bộ bài DRAFT của tuần này và tạo lại từ đầu? (Bài đã approve/đã đăng KHÔNG bị xoá)")) return;
    }
    setGenerating(true);
    setError("");
    try {
      const endpoint = mode === "regenerate" ? "weekly-plan/regenerate" : "weekly-plan";
      const r = await fetch(`${DIRECT_API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: weekStart,
          angle: planAngle,
          extra_context: planContext,
          posts_per_day: postsPerDay,
          reels_per_day: reelsPerDay,
        }),
        signal: AbortSignal.timeout(900_000), // 15 min
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
  const openManualPost = (post: Post) => {
    setSpSelectedPost(post); setSpSubmitUrl(""); setSpCopied(false); setSpMediaCopied(false);
    setYtResult(null); setYtUploading(false);
    setYtTitle(post.yt_title || post.hook || "");
    setYtDesc(post.yt_description || `${post.body || ""}\n\n${post.cta || ""}\n\nDoitay.vn — Nền tảng kết nối thợ & khách hàng`.trim());
    setYtPrivacy(post.yt_privacy || "private");
    // Check YT connection
    fetch("/api/backend/youtube/status").then(r => r.json()).then(d => { setYtConnected(d.connected); setYtChannel(d.channel || null); }).catch(() => {});
    // Check TT connection + init state
    setTtResult(null); setTtUploading(false); setTtManualUrl("");
    setTtCaption(`${post.hook || ""}\n${post.cta || ""}\n${(post.hashtags || []).join(" ")}`.trim());
    fetch("/api/backend/tiktok/status").then(r => r.json()).then(d => { setTtConnected(d.connected); setTtUser(d.user || null); }).catch(() => {});
  };
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

  const ytUpload = async () => {
    if (!spSelectedPost) return;
    setYtUploading(true); setYtResult(null);
    try {
      const r = await fetch("/api/backend/youtube/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: spSelectedPost.id,
          title: ytTitle,
          description: ytDesc,
          privacy: ytPrivacy,
          as_short: spSelectedPost.content_type === "reel",
        }),
      });
      const data = await r.json();
      if (data.status === "success") {
        setYtResult(data);
        if (tab === "today") await loadToday(); else await loadWeekly();
      } else {
        setError(data.detail || data.error || "YouTube upload failed");
      }
    } catch { setError("YouTube upload failed"); }
    finally { setYtUploading(false); }
  };

  const ytConnect = () => {
    fetch("/api/backend/youtube/auth").then(r => r.json()).then(d => {
      if (d.auth_url) window.open(d.auth_url, "_blank", "width=600,height=700");
      else setError(d.error || "YouTube auth failed");
    }).catch(() => setError("YouTube auth failed"));
  };

  const ttUpload = async () => {
    if (!spSelectedPost) return;
    setTtUploading(true); setTtResult(null);
    try {
      const r = await fetch("/api/backend/tiktok/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: spSelectedPost.id, title: ttCaption, privacy_level: ttPrivacy }),
      });
      const data = await r.json();
      if (data.status === "success") {
        setTtResult(data);
        if (tab === "today") await loadToday(); else await loadWeekly();
      } else setError(data.detail || data.error || "TikTok upload failed");
    } catch { setError("TikTok upload failed"); }
    finally { setTtUploading(false); }
  };

  const ttConnect = () => {
    fetch("/api/backend/tiktok/auth").then(r => r.json()).then(d => {
      if (d.auth_url) window.open(d.auth_url, "_blank", "width=600,height=700");
      else setError(d.error || d.detail || "TikTok auth failed — set TIKTOK_CLIENT_KEY in .env");
    }).catch(() => setError("TikTok auth failed"));
  };

  const ttSubmitManual = async () => {
    if (!spSelectedPost || !ttManualUrl.trim()) return;
    try {
      const r = await fetch("/api/backend/tiktok/submit-link", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: spSelectedPost.id, tiktok_url: ttManualUrl.trim() }),
      });
      const data = await r.json();
      if (data.status === "success") {
        setTtResult({ status: "success", tiktok_url: data.tiktok_url });
        if (tab === "today") await loadToday(); else await loadWeekly();
      } else setError(data.detail || "Submit failed");
    } catch { setError("TikTok submit failed"); }
  };

  // ── Distribution functions ──
  const loadDistGroups = async () => {
    try {
      const r = await fetch(`${API}/distribution/groups`);
      const data = await r.json();
      if (data.status === "success") setDistGroups(data.groups || []);
    } catch {}
  };

  const loadDistToday = async () => {
    setDistLoading(true);
    try {
      const r = await fetch(`${API}/distribution/today`);
      const data = await r.json();
      if (data.status === "success") setDistToday(data);
    } catch {}
    setDistLoading(false);
  };

  const morningScanMoments = async () => {
    setMorningScanning(true);
    setMorningMoments([]);
    try {
      const r = await fetch(`${API}/morning/scan-moments`, { method: "POST", signal: AbortSignal.timeout(120000) });
      const data = await r.json();
      if (data.status === "success") setMorningMoments(data.moments || []);
      else setError(data.error || "Scan moments failed");
    } catch { setError("Scan moments failed"); }
    setMorningScanning(false);
  };

  const morningLinkHypotheses = async () => {
    setMorningLinking(true);
    setMorningLinkResult(null);
    try {
      const r = await fetch(`${API}/morning/link-hypotheses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "null", signal: AbortSignal.timeout(120000) });
      const data = await r.json();
      setMorningLinkResult(data);
      if (data.status === "success") await loadDistToday();
      else setError(data.error || "Link failed");
    } catch { setError("Link hypotheses failed"); }
    setMorningLinking(false);
  };

  const eveningCaptureSignals = async () => {
    setEveningCapturing(true);
    setEveningResult(null);
    try {
      const r = await fetch(`${API}/evening/capture-signals`, { method: "POST", signal: AbortSignal.timeout(60000) });
      const data = await r.json();
      setEveningResult(data);
      if (data.status === "success") await loadDistToday();
    } catch { setError("Evening capture failed"); }
    setEveningCapturing(false);
  };

  const distSyncMetrics = async () => {
    setSyncingDist(true);
    try {
      await fetch(`${API}/sync-metrics`, { method: "POST", signal: AbortSignal.timeout(60000) });
      await loadDistToday();
    } catch { setError("Sync metrics failed"); }
    setSyncingDist(false);
  };

  // ── Comment Inbox functions ──
  const loadCiRules = async () => {
    try {
      const r = await fetch(CI_API + "/rules");
      const data = await r.json();
      setCiRules(data.rules || []);
    } catch {}
  };
  const loadCiLog = async () => {
    try {
      const r = await fetch(CI_API + "/log?limit=100");
      const data = await r.json();
      setCiLog(data.log || []);
    } catch {}
  };
  const ciScanComments = async () => {
    setCiScanning(true);
    try {
      const r = await fetch(CI_API + "/scan", { method: "POST" });
      const data = await r.json();
      setCiMatches(data.matches || []);
    } catch { setError("Scan comments failed"); }
    setCiScanning(false);
  };
  const ciAutoProcess = async () => {
    setCiProcessing(true);
    try {
      const r = await fetch(CI_API + "/auto-process", { method: "POST" });
      const data = await r.json();
      if (data.status === "success") {
        setCiMatches([]);
        await loadCiLog();
        await loadCiRules();
      } else setError(data.detail || "Auto-process failed");
    } catch { setError("Auto-process failed"); }
    setCiProcessing(false);
  };
  const ciCreateRule = async () => {
    if (!ciNewRule.fb_post_id || !ciNewRule.keywords || !ciNewRule.inbox_message) return;
    try {
      const r = await fetch(CI_API + "/rules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: ciNewRule.post_id || ciNewRule.fb_post_id,
          fb_post_id: ciNewRule.fb_post_id,
          keywords: ciNewRule.keywords.split(",").map((k: string) => k.trim()).filter(Boolean),
          inbox_message: ciNewRule.inbox_message,
          link: ciNewRule.link,
          active: true,
        }),
      });
      const data = await r.json();
      if (data.status === "success") {
        setCiNewRule({ fb_post_id: "", keywords: "", inbox_message: "", link: "", post_id: "" });
        setCiShowForm(false);
        await loadCiRules();
      }
    } catch { setError("Create rule failed"); }
  };
  const ciDeleteRule = async (id: string) => {
    await fetch(CI_API + `/rules/${id}`, { method: "DELETE" });
    await loadCiRules();
  };
  const ciSendInbox = async (match: CommentMatch) => {
    try {
      const r = await fetch(CI_API + "/send-inbox", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fb_user_id: match.fb_user_id,
          fb_user_name: match.fb_user_name,
          message: match.inbox_message + (match.link ? `\n\n${match.link}` : ""),
          rule_id: match.rule_id,
        }),
      });
      const data = await r.json();
      if (data.status === "success") {
        setCiMatches(prev => prev.filter(m => m.fb_user_id !== match.fb_user_id || m.rule_id !== match.rule_id));
        await loadCiLog();
      } else setError(data.error || data.fallback || "Send failed");
    } catch { setError("Send inbox failed"); }
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
              cd agent-system && python run.py
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
          ["comment-inbox", "Comment Inbox"],
          ["distribution", "Phân phối"],
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

      <div className={`mx-auto px-6 py-6 ${tab === "weekly" || tab === "today" || tab === "quarterly" || tab === "comment-inbox" ? "max-w-[1400px]" : "max-w-6xl"}`}>
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
                          reel_script: post.reel_script ? JSON.parse(JSON.stringify(post.reel_script)) : null,
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
                  onClick={() => handleGeneratePlan("create")}
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
                                reel_script: post.reel_script ? JSON.parse(JSON.stringify(post.reel_script)) : null,
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

                  {/* Regenerate buttons */}
                  <div className="pt-4 border-t border-[#2e2e33] flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleGeneratePlan("create")}
                      disabled={generating}
                      className="px-4 py-2 rounded-lg text-xs border border-[#2e2e33] text-[#a1a1aa] hover:text-[#f5f5f7] hover:border-[#71717a] cursor-pointer transition-all disabled:opacity-40"
                    >
                      {generating ? "Đang tạo..." : "Tạo thêm bài cho tuần này"}
                    </button>
                    <button
                      onClick={() => handleGeneratePlan("regenerate")}
                      disabled={generating}
                      className="px-4 py-2 rounded-lg text-xs border border-[#e8a020] text-[#e8a020] hover:bg-[#e8a020]/10 cursor-pointer transition-all disabled:opacity-40"
                      title="Xoá tất cả bài DRAFT rồi tạo lại từ đầu"
                    >
                      {generating ? "Đang tạo..." : "🔄 Tạo lại kế hoạch tuần"}
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
                ["synthetic", "Synthetic Interview", "#8b5cf6"],
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
                    {(() => {
                      const KNOWN_SEGS = ["demand", "pain", "desire", "objection", "competitor"];
                      const segColors: Record<string, string> = {
                        demand: "#3b82f6", pain: "#ef4444", desire: "#22c55e", objection: "#f59e0b", competitor: "#8b5cf6",
                      };
                      const segLabels: Record<string, string> = {
                        demand: "Nhu cầu", pain: "Nỗi đau", desire: "Mong muốn", objection: "Phản đối", competitor: "Đối thủ",
                      };
                      // Collect all segments including unknown ones
                      const allSegs = [...KNOWN_SEGS];
                      insights.forEach(i => {
                        const s = (i.segment || "other").toLowerCase();
                        if (!allSegs.includes(s)) allSegs.push(s);
                      });
                      return allSegs.map(seg => {
                        const items = insights.filter(i => {
                          const s = (i.segment || "other").toLowerCase();
                          return seg === "other" ? !KNOWN_SEGS.includes(s) : s === seg;
                        });
                        if (items.length === 0) return null;
                        const color = segColors[seg] || "#a1a1aa";
                        const label = segLabels[seg] || seg;
                        return (
                          <div key={seg} className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>
                              {label} ({items.length})
                            </h3>
                            <div className="space-y-2">
                              {items.map(i => (
                                <div key={i.id} className="flex items-start gap-3 py-2 border-b border-[#1c1c1f] last:border-0">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">&ldquo;{i.pain_phrase}&rdquo;</p>
                                    {i.sentiment && <p className="text-[10px] text-[#71717a] mt-0.5">{i.sentiment}</p>}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] text-[#52525b]">{i.segment}</span>
                                    {i.frequency > 1 && <span className="ml-2 text-[10px] font-bold text-[#e8a020]">x{i.frequency}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
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
                  <div className="flex gap-2">
                    <button onClick={reframeHypotheses} disabled={reframingHypotheses}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#8b5cf6] text-[#8b5cf6] cursor-pointer hover:bg-[rgba(139,92,246,0.1)] disabled:opacity-40">
                      {reframingHypotheses ? "Reframing..." : "Reframe → Behavioral"}
                    </button>
                    <button onClick={validateHypotheses} disabled={validatingHypotheses}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#22c55e] text-[#22c55e] cursor-pointer hover:bg-[rgba(34,197,94,0.1)] disabled:opacity-40">
                      {validatingHypotheses ? "Validating..." : "Validate từ post thật"}
                    </button>
                    <button onClick={generateHypotheses} disabled={generatingHypotheses}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 disabled:opacity-40">
                      {generatingHypotheses ? "Generating..." : "AI Generate"}
                    </button>
                  </div>
                </div>

                {/* Reframe Preview */}
                {reframePreview.length > 0 && (
                  <div className="bg-[#141416] border border-[rgba(139,92,246,0.3)] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#8b5cf6]">Reframe Preview — {reframePreview.length} hypotheses ({selectedReframes.size} selected)</p>
                      <div className="flex gap-2">
                        <button onClick={confirmReframes} disabled={selectedReframes.size === 0}
                          className="px-3 py-1.5 rounded text-[11px] font-bold bg-[#8b5cf6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                          Lưu {selectedReframes.size} hypothesis
                        </button>
                        <button onClick={() => setReframePreview([])} className="text-[10px] text-[#52525b] cursor-pointer hover:text-white">Đóng</button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {reframePreview.map((item: any) => {
                        const itemId = item.full_id || item.id;
                        const selected = selectedReframes.has(itemId);
                        return (
                          <div key={itemId} onClick={() => setSelectedReframes(prev => { const s = new Set(prev); selected ? s.delete(itemId) : s.add(itemId); return s; })}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${selected ? "border-[#8b5cf6] bg-[rgba(139,92,246,0.08)]" : "border-[#2e2e33] bg-[#0c0c0d] opacity-50"}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] ${selected ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-[#52525b]"}`}>{selected ? "✓" : ""}</span>
                              <span className="text-xs font-bold text-white">{item.title}</span>
                              {item.user_state && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.user_state === "emergency" ? "bg-[rgba(239,68,68,0.15)] text-[#ef4444]" : item.user_state === "active_search" ? "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]" : "bg-[rgba(59,130,246,0.15)] text-[#3b82f6]"}`}>{item.user_state}</span>}
                              {item.user_type && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(34,197,94,0.1)] text-[#22c55e] font-bold">{item.user_type}</span>}
                              {item.observable_action && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(232,160,32,0.1)] text-[#e8a020]">{item.observable_action}</span>}
                            </div>
                            <p className="text-[10px] text-[#71717a] mb-1">Was: {item.original_title}</p>
                            {item.decision_trigger && <p className="text-[10px] text-[#a1a1aa]">Trigger: {item.decision_trigger}</p>}
                            {item.behavioral_pain && <p className="text-[10px] text-[#ef4444]">Pain: {item.behavioral_pain}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {stressTestingId && (
                  <div className="flex items-center gap-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.3)] rounded-xl px-4 py-3">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b] animate-pulse shrink-0" />
                    <p className="text-xs text-[#f59e0b]">Đang chạy Stress Test... AI Devil's Advocate đang phân tích. Thường mất 1-3 phút.</p>
                  </div>
                )}

                {validateReport && validateReport.report?.length > 0 && (
                  <div className="bg-[#141416] border border-[rgba(34,197,94,0.3)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-[#22c55e]">Validate Report — {validateReport.hypotheses_validated} hypotheses</p>
                      <button onClick={() => setValidateReport(null)} className="text-[10px] text-[#52525b] cursor-pointer hover:text-white">Đóng</button>
                    </div>
                    <div className="space-y-1.5">
                      {validateReport.report.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-[11px]">
                          <span className={`w-12 text-center text-[10px] font-bold px-1.5 py-0.5 rounded ${r.tier >= 3 ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]" : r.tier === 2 ? "bg-[rgba(232,160,32,0.15)] text-[#e8a020]" : "bg-[rgba(59,130,246,0.15)] text-[#3b82f6]"}`}>T{r.tier}</span>
                          <span className="flex-1 truncate text-[#a1a1aa]">{r.hypothesis}</span>
                          <span className="text-[#22c55e] font-mono">{r.validated}✓</span>
                          <span className="text-[#ef4444] font-mono">{r.failed}✗</span>
                          <span className="text-[#e8a020] font-mono w-10 text-right">{r.new_score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                      {h.user_state && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${h.user_state === "emergency" ? "bg-[rgba(239,68,68,0.12)] text-[#ef4444]" : h.user_state === "active_search" ? "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]" : "bg-[rgba(59,130,246,0.12)] text-[#3b82f6]"}`}>
                                          {h.user_state === "emergency" ? "🚨 emergency" : h.user_state === "active_search" ? "🔍 active_search" : "📋 planning"}
                                        </span>
                                      )}
                                      {h.observable_action && <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(232,160,32,0.1)] text-[#e8a020] font-bold">→ {h.observable_action}</span>}
                                      {h.optimization_target && <span className="text-[10px] text-[#52525b]">opt: {h.optimization_target}</span>}
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
                                      {/* Evidence from real posts */}
                                      {(() => {
                                        const sd = (h as any).source_data;
                                        const validated = sd?.validated_count ?? 0;
                                        const failed = sd?.failed_count ?? 0;
                                        const intents = sd?.total_intent_signals ?? 0;
                                        if (validated + failed + intents === 0) return null;
                                        return (
                                          <span className="text-[10px] text-[#71717a] flex items-center gap-1.5">
                                            <span className="text-[#22c55e] font-bold">{validated}✓</span>
                                            <span className="text-[#ef4444] font-bold">{failed}✗</span>
                                            {intents > 0 && <span className="text-[#3b82f6] font-bold">{intents} inbox</span>}
                                          </span>
                                        );
                                      })()}
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

                                {/* Behavioral details */}
                                {(h.decision_trigger || h.behavioral_pain) && (
                                  <div className="mt-2 pt-2 border-t border-[#1c1c1f] space-y-1">
                                    {h.decision_trigger && <p className="text-[10px] text-[#a1a1aa]"><span className="text-[#e8a020]">Trigger:</span> {h.decision_trigger}</p>}
                                    {h.behavioral_pain && <p className="text-[10px] text-[#a1a1aa]"><span className="text-[#ef4444]">Pain:</span> {h.behavioral_pain}</p>}
                                  </div>
                                )}

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
            {/* ── SYNTHETIC INTERVIEW SECTION ── */}
            {intelSection === "synthetic" && (() => {
              const PHASES = [
                { num: 1, skill: "R8", name: "Insight Units", desc: "Raw signals → Atomic Insight Units có context + emotion + problem + desired state", color: "#3b82f6" },
                { num: 2, skill: "R9", name: "Personas", desc: "Structured insights → 2-4 Decision-Ready Personas với fears, biases, contradictions", color: "#8b5cf6" },
                { num: 3, skill: "R10", name: "Interviews", desc: "Mỗi persona: 12-15 câu hỏi decision-driven (exploration, trade-off, pricing, threshold)", color: "#f59e0b" },
                { num: 4, skill: "A10", name: "Decision Map", desc: "Interviews → buy triggers, objections, deal breakers, trust drivers với confidence score", color: "#22c55e" },
                { num: 5, skill: "A11", name: "Validate", desc: "Cross-validate Decision Map với real social pain phrases — verified | synthetic_only | contradicted", color: "#ef4444" },
              ];

              const activeData = synHistory.find(h => h.id === synActiveId);
              const phaseStatus = activeData ? activeData.pipeline_status : null;
              const phaseNum = phaseStatus ? parseInt(phaseStatus.replace("phase", "").replace("_complete", "")) : 0;

              return (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Synthetic Customer Interview</h3>
                      <p className="text-[10px] text-[#71717a] mt-0.5">Pipeline R8→R9→R10→A10→A11: mô phỏng phỏng vấn khách hàng từ social data</p>
                    </div>
                    <button onClick={() => synRunPhase(1)} disabled={synLoading}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#8b5cf6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                      {synLoading ? "Đang chạy..." : "New Run (Phase 1)"}
                    </button>
                  </div>

                  {/* History list */}
                  {synHistory.length > 0 && (
                    <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a] mb-3">Lịch sử chạy ({synHistory.length})</p>
                      <div className="space-y-2">
                        {synHistory.map((h) => {
                          const isActive = h.id === synActiveId;
                          const completedPhase = h.pipeline_status?.includes("_complete") ? parseInt(h.pipeline_status.replace("phase", "").replace("_complete", "")) : 0;
                          return (
                            <div key={h.id} onClick={() => synLoadExisting(h.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isActive ? "bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.4)]" : "bg-[#1c1c1f] border border-transparent hover:border-[#3e3e45]"}`}>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(p => (
                                  <div key={p} className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${p <= completedPhase ? "bg-[#8b5cf6] text-white" : "bg-[#2e2e33] text-[#52525b]"}`}>{p}</div>
                                ))}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold">{new Date(h.created_at).toLocaleString("vi-VN")}</p>
                                <p className="text-[10px] text-[#71717a]">
                                  {h.total_insights} insights · {h.total_personas} personas · {h.total_interviews} interviews
                                  {h.buy_triggers_count > 0 && ` · ${h.buy_triggers_count} buy triggers`}
                                  {h.has_validation && ` · ${h.verified_insights_count} verified`}
                                </p>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${h.pipeline_status === "complete" ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e]" : "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"}`}>
                                {h.pipeline_status === "complete" ? "DONE" : h.pipeline_status?.replace("_", " ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Phase pipeline for active run */}
                  {synActiveId && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">Run: {synActiveId.slice(0, 8)}...</p>
                      {PHASES.map((phase) => {
                        const done = phaseNum >= phase.num || !!synResults[phase.num];
                        const canRun = phase.num === 1 || (done ? false : phaseNum >= phase.num - 1 || !!synResults[phase.num - 1]);
                        const result = synResults[phase.num];
                        const isExpanded = synExpandedPhase === phase.num;

                        return (
                          <div key={phase.num} className={`bg-[#141416] border rounded-xl overflow-hidden transition-all ${done ? `border-[${phase.color}]/30` : "border-[#2e2e33]"}`}>
                            {/* Phase header */}
                            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setSynExpandedPhase(isExpanded ? null : phase.num)}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "text-white" : "bg-[#2e2e33] text-[#52525b]"}`}
                                style={done ? { backgroundColor: phase.color } : {}}>
                                {done ? "✓" : phase.num}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold">{phase.skill} — {phase.name}</span>
                                  {done && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: phase.color, backgroundColor: `${phase.color}1a` }}>DONE</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#71717a] mt-0.5">{phase.desc}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {!done && canRun && (
                                  <button onClick={(e) => { e.stopPropagation(); synRunPhase(phase.num as 1|2|3|4|5, synActiveId); }}
                                    disabled={synLoading}
                                    className="px-3 py-1.5 rounded text-[11px] font-semibold text-white cursor-pointer hover:brightness-110 disabled:opacity-40"
                                    style={{ backgroundColor: phase.color }}>
                                    {synLoading ? "..." : `Run Phase ${phase.num}`}
                                  </button>
                                )}
                                {done && result && <span className="text-[10px] text-[#71717a]">{isExpanded ? "▲" : "▼"}</span>}
                              </div>
                            </div>

                            {/* Phase results */}
                            {isExpanded && result && (
                              <div className="px-4 pb-4 border-t border-[#2e2e33] pt-3 space-y-3">
                                {phase.num === 1 && result.insights && (
                                  <>
                                    <p className="text-[10px] font-bold text-[#3b82f6]">{result.total_insights} Atomic Insight Units · {result.total_clusters} clusters</p>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {(result.insights || []).slice(0, 8).map((ins: any, i: number) => (
                                        <div key={i} className="bg-[#1c1c1f] rounded-lg p-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${ins.pain_type === "financial" ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444]" : ins.pain_type === "emotional" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]" : "bg-[rgba(59,130,246,0.1)] text-[#3b82f6]"}`}>{ins.pain_type}</span>
                                            <span className="text-[9px] text-[#52525b]">intensity {ins.emotional_intensity}/5</span>
                                          </div>
                                          <p className="text-xs text-[#f5f5f7]">{ins.context}</p>
                                          <p className="text-[10px] text-[#a1a1aa] mt-1">{ins.desired_state}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                                {phase.num === 2 && result.personas && (
                                  <div className="space-y-3 max-h-72 overflow-y-auto">
                                    {(result.personas || []).map((p: any, i: number) => (
                                      <div key={i} className="bg-[#1c1c1f] rounded-lg p-3">
                                        <p className="text-xs font-bold text-[#8b5cf6]">{p.name}</p>
                                        <p className="text-[10px] text-[#a1a1aa] mt-1">{p.profile_summary || p.description}</p>
                                        {p.fears?.length > 0 && <p className="text-[10px] text-[#ef4444] mt-1">Fears: {p.fears.slice(0, 2).join(" · ")}</p>}
                                        {p.cognitive_biases?.length > 0 && <p className="text-[10px] text-[#f59e0b] mt-0.5">Biases: {p.cognitive_biases.slice(0, 2).join(" · ")}</p>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {phase.num === 3 && result.interviews_preview && (
                                  <div className="space-y-3 max-h-72 overflow-y-auto">
                                    {(result.interviews_preview || []).map((iv: any, i: number) => (
                                      <div key={i} className="bg-[#1c1c1f] rounded-lg p-3">
                                        <p className="text-xs font-bold text-[#f59e0b]">{iv.persona_name} — {iv.total_questions} câu hỏi</p>
                                        {(iv.sample_qa || []).slice(0, 3).map((qa: any, j: number) => (
                                          <div key={j} className="mt-2 border-l-2 border-[#2e2e33] pl-2">
                                            <p className="text-[10px] text-[#a1a1aa]">Q: {qa.question}</p>
                                            <p className="text-[10px] text-[#f5f5f7]">A: {qa.answer}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {phase.num === 4 && result.decision_map && (
                                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                    {(["buy_triggers","objections","deal_breakers","trust_drivers"] as string[]).map(key => {
                                      const items = (result.decision_map[key] || []).slice(0, 3);
                                      const colors: Record<string, string> = { buy_triggers: "#22c55e", objections: "#ef4444", deal_breakers: "#f59e0b", trust_drivers: "#3b82f6" };
                                      const labels: Record<string, string> = { buy_triggers: "Buy Triggers", objections: "Objections", deal_breakers: "Deal Breakers", trust_drivers: "Trust Drivers" };
                                      return items.length > 0 ? (
                                        <div key={key} className="bg-[#1c1c1f] rounded-lg p-3">
                                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors[key] }}>{labels[key]}</p>
                                          {items.map((item: any, i: number) => (
                                            <div key={i} className="mb-1">
                                              <p className="text-[10px] text-[#f5f5f7]">{item.trigger || item.objection || item.deal_breaker || item.driver || item.factor}</p>
                                              {item.confidence_score != null && <p className="text-[9px] text-[#52525b]">confidence: {item.confidence_score}</p>}
                                            </div>
                                          ))}
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                )}
                                {phase.num === 5 && result.validation_summary && (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-4 gap-2">
                                      {(["verified","partially_verified","synthetic_only","contradicted"] as string[]).map(k => {
                                        const colorsMap: Record<string, string> = { verified: "#22c55e", partially_verified: "#f59e0b", synthetic_only: "#3b82f6", contradicted: "#ef4444" };
                                        return (
                                          <div key={k} className="bg-[#1c1c1f] rounded-lg p-3 text-center">
                                            <p className="text-lg font-bold font-mono" style={{ color: colorsMap[k] }}>{result.validation_summary[k] || 0}</p>
                                            <p className="text-[9px] text-[#71717a]">{k.replace("_", " ")}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {result.validation?.validation_gaps?.length > 0 && (
                                      <div className="bg-[#1c1c1f] rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-[#f59e0b] mb-1">Validation Gaps</p>
                                        {result.validation.validation_gaps.slice(0, 3).map((g: any, i: number) => (
                                          <p key={i} className="text-[10px] text-[#a1a1aa]">- {typeof g === "string" ? g : g.gap || JSON.stringify(g)}</p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {synHistory.length === 0 && !synActiveId && (
                    <EmptyState
                      title="Chưa có Synthetic Interview nào"
                      description="Cần có dữ liệu từ Social Scan hoặc Market Scan trước. Sau đó bấm 'New Run' để AI mô phỏng khách hàng từ pain phrases thực."
                      action={() => synRunPhase(1)}
                      actionLabel="Bắt đầu New Run"
                    />
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════ TAB: BÁO CÁO QUÝ ══════ */}
        {tab === "quarterly" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                Báo cáo hiệu suất
              </h2>
              <div className="flex gap-2">
                <label className={`px-4 py-2 rounded-lg text-xs font-semibold border border-[#2e2e33] text-[#a1a1aa] cursor-pointer hover:text-white transition-colors ${csvImporting ? "opacity-40 pointer-events-none" : ""}`}>
                  {csvImporting ? "Importing..." : "Import CSV Facebook"}
                  <input type="file" accept=".csv" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) importFbCsv(f); e.target.value = ""; }} />
                </label>
                <button onClick={syncMetrics} disabled={syncingMetrics}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                  {syncingMetrics ? "Syncing..." : "Sync Metrics từ FB API"}
                </button>
              </div>
            </div>

            {/* CSV Import result */}
            {csvImportResult && (
              <div className={`mb-4 px-4 py-3 rounded-xl border text-xs ${csvImportResult.status === "success" ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.2)]" : "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-bold ${csvImportResult.status === "success" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    {csvImportResult.message || csvImportResult.error}
                  </p>
                  <button onClick={() => setCsvImportResult(null)} className="text-[#52525b] hover:text-white text-[10px] cursor-pointer">✕</button>
                </div>
                {csvImportResult.results && (
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {csvImportResult.results.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-1 rounded font-bold ${r.action === "created" ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]" : "bg-[rgba(59,130,246,0.15)] text-[#3b82f6]"}`}>{r.action}</span>
                        <span className="text-[#71717a] truncate text-[9px]">{r.hook}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


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
              <div>
                {/* Summary cards — full width */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <StatCard label="Tổng bài" value={stats.total_posts} />
                  <StatCard label="Đã đăng" value={stats.total_posted} color="teal" />
                  <StatCard label="Views" value={stats.total_views || 0} />
                  <StatCard label="Engagements" value={stats.total_engagements || 0} color="amber" />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <StatCard label="Reach" value={stats.total_reach || 0} />
                  <StatCard label="Clicks" value={stats.total_clicks || 0} />
                  <StatCard label="Draft" value={stats.total_draft} />
                  <StatCard label="Từ chối" value={stats.total_rejected} color="red" />
                </div>

                {/* 2-column: Left = data, Right = patterns */}
                <div className="flex gap-6">
                  {/* ── LEFT COLUMN ── */}
                  <div className="flex-1 min-w-0 space-y-6">
                    {/* Content Library Table */}
                    <div className="bg-[#141416] border border-[#2e2e33] rounded-xl overflow-hidden">
                      <div className="px-5 py-3 border-b border-[#2e2e33] flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Content Library</h3>
                        <span className="text-[10px] text-[#71717a]">{stats.posted_posts?.length || 0} posts</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[#2e2e33] text-[10px] text-[#71717a] uppercase tracking-wider">
                              <th className="text-left px-4 py-2.5">Post</th>
                              <th className="text-right px-2 py-2.5">Views</th>
                              <th className="text-right px-2 py-2.5">Reach</th>
                              <th className="text-right px-2 py-2.5">Eng</th>
                              <th className="text-right px-2 py-2.5">Clicks</th>
                              <th className="text-right px-2 py-2.5">Shares</th>
                              <th className="text-center px-2 py-2.5">Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stats.posted_posts || []).map((p) => (
                              <tr key={p.id} className="border-b border-[#1c1c1f] hover:bg-[#1c1c1f] transition-colors">
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    {p.image_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={p.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#2e2e33] shrink-0" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-[#242428] border border-[#2e2e33] shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-medium text-[#f5f5f7] truncate max-w-[220px]">{p.hook}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-[#71717a]">{p.scheduled_date}</span>
                                        {p.angle && <span className="text-[9px] text-[#8b5cf6]">{p.angle}</span>}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right px-2 py-2.5 font-mono text-[11px] text-[#f5f5f7]">{p.views || "—"}</td>
                                <td className="text-right px-2 py-2.5 font-mono text-[11px] text-[#a1a1aa]">{p.reach || "—"}</td>
                                <td className="text-right px-2 py-2.5 font-mono text-[11px] text-[#e8a020] font-bold">{p.engagements || "—"}</td>
                                <td className="text-right px-2 py-2.5 font-mono text-[11px] text-[#3b82f6]">{p.clicks || "—"}</td>
                                <td className="text-right px-2 py-2.5 font-mono text-[11px] text-[#a1a1aa]">{p.shares || "—"}</td>
                                <td className="text-center px-2 py-2.5">
                                  {p.post_url ? (
                                    <a href={p.post_url} target="_blank" rel="noopener" className="text-[#3b82f6] hover:underline text-[11px]">&#8599;</a>
                                  ) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* By Angle Performance */}
                    <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3">Performance theo Angle</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(stats.engagement_by_angle || stats.by_angle).map(([angle, data]) => {
                          const d = typeof data === "number" ? { posts: data, impressions: 0, engagements: 0 } : data;
                          return (
                            <div key={angle} className="bg-[#1c1c1f] rounded-lg p-3">
                              <div className="text-xs font-bold text-[#8b5cf6] mb-2">{angle}</div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <div className="text-lg font-bold" style={{ fontFamily: "IBM Plex Mono" }}>{d.posts}</div>
                                  <div className="text-[9px] text-[#71717a]">Posts</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-[#a1a1aa]" style={{ fontFamily: "IBM Plex Mono" }}>{d.impressions || 0}</div>
                                  <div className="text-[9px] text-[#71717a]">Views</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-[#e8a020]" style={{ fontFamily: "IBM Plex Mono" }}>{d.engagements || 0}</div>
                                  <div className="text-[9px] text-[#71717a]">Eng</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* By Week */}
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
                              <span className="text-xs text-[#71717a] w-24 text-right">{d.posted}/{d.total}</span>
                              <span className="text-xs font-mono text-[#a1a1aa] w-16 text-right">{d.impressions || 0} v</span>
                              <span className="text-xs font-mono text-[#e8a020] w-14 text-right">{d.engagements || 0} e</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT COLUMN: Patterns (sticky) ── */}
                  <div className="w-[360px] shrink-0">
                    <div className="sticky top-6 space-y-4">
                      <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3">Extracted Patterns ({stats.patterns?.length || 0})</h3>
                        {stats.patterns && stats.patterns.length > 0 ? (
                          <div className="space-y-2.5">
                            {stats.patterns.map((p) => (
                              <div key={p.id} className="bg-[#1c1c1f] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] shrink-0">{p.category}</span>
                                  <div className="flex gap-0.5 shrink-0">{Array.from({length: 5}).map((_, i) => (
                                    <div key={i} className={`w-1 h-2.5 rounded-sm ${i < Math.round((p.confidence || 0) * 5) ? "bg-[#22c55e]" : "bg-[#2e2e33]"}`} />
                                  ))}</div>
                                </div>
                                <p className="text-[11px] font-bold text-[#f5f5f7] leading-snug">{p.title}</p>
                                <p className="text-[10px] text-[#71717a] mt-1 leading-relaxed">{p.description}</p>
                                {p.result && <p className="text-[10px] text-[#22c55e] mt-1">{p.result}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#52525b] text-center py-4">Chưa có patterns. Chạy Weekly Review để extract.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: COMMENT INBOX ══════ */}
        {tab === "comment-inbox" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Comment Monitor & Auto-Inbox</h2>
                <p className="text-xs text-[#71717a] mt-1">Detect keyword comments → Auto gửi inbox với link. Flow: Post CTA "Comment KEYWORD" → detect → inbox link.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={ciScanComments} disabled={ciScanning}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40">
                  {ciScanning ? "Scanning..." : "Scan Comments"}
                </button>
                <button onClick={ciAutoProcess} disabled={ciProcessing}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#22c55e] text-black cursor-pointer hover:brightness-110 disabled:opacity-40">
                  {ciProcessing ? "Processing..." : "Auto Process All"}
                </button>
                <button onClick={() => setCiShowForm(!ciShowForm)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#e8a020] text-[#e8a020] cursor-pointer hover:bg-[rgba(232,160,32,0.1)]">
                  {ciShowForm ? "Đóng" : "+ Tạo Rule"}
                </button>
              </div>
            </div>

            {/* New Rule Form */}
            {ciShowForm && (
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#e8a020]">Tạo Keyword Rule mới</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#71717a] block mb-1">Facebook Post ID *</label>
                    <input type="text" placeholder="123456789_987654321" value={ciNewRule.fb_post_id}
                      onChange={e => setCiNewRule({ ...ciNewRule, fb_post_id: e.target.value })}
                      className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#71717a] block mb-1">Keywords * (cách nhau bởi dấu phẩy)</label>
                    <input type="text" placeholder="VIỆC, VIEC, THỢ" value={ciNewRule.keywords}
                      onChange={e => setCiNewRule({ ...ciNewRule, keywords: e.target.value })}
                      className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#71717a] block mb-1">Inbox Message * (dùng {"{name}"} cho tên người comment)</label>
                  <textarea placeholder={"Chào {name}! Mình thấy bạn quan tâm...\nĐây là thông tin chi tiết:"}
                    value={ciNewRule.inbox_message}
                    onChange={e => setCiNewRule({ ...ciNewRule, inbox_message: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020] h-20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#71717a] block mb-1">Link (gửi kèm inbox)</label>
                    <input type="text" placeholder="https://doitay.vn/..." value={ciNewRule.link}
                      onChange={e => setCiNewRule({ ...ciNewRule, link: e.target.value })}
                      className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#71717a] block mb-1">Post ID (nội bộ, optional)</label>
                    <input type="text" placeholder="ID bài trong hệ thống" value={ciNewRule.post_id}
                      onChange={e => setCiNewRule({ ...ciNewRule, post_id: e.target.value })}
                      className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020]" />
                  </div>
                </div>
                <button onClick={ciCreateRule} disabled={!ciNewRule.fb_post_id || !ciNewRule.keywords || !ciNewRule.inbox_message}
                  className="px-6 py-2 rounded-lg text-xs font-bold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 disabled:opacity-40">
                  Tạo Rule
                </button>
              </div>
            )}

            {/* 3-column layout: Rules | Matches | Log */}
            <div className="grid grid-cols-3 gap-4">
              {/* Column 1: Active Rules */}
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e8a020]"></span>
                  Rules ({ciRules.length})
                </h3>
                {ciRules.length === 0 ? (
                  <p className="text-[11px] text-[#52525b] text-center py-4">Chưa có rule nào. Tạo rule để bắt đầu monitor.</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {ciRules.map(rule => (
                      <div key={rule.id} className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#71717a] font-mono">{rule.fb_post_id.slice(0, 20)}...</span>
                          <button onClick={() => ciDeleteRule(rule.id)} className="text-[10px] text-[#ef4444] cursor-pointer hover:underline">Xóa</button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rule.keywords.map((kw, i) => (
                            <span key={i} className="text-[10px] bg-[rgba(232,160,32,0.15)] text-[#e8a020] px-2 py-0.5 rounded font-bold">{kw}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#a1a1aa] line-clamp-2">{rule.inbox_message}</p>
                        {rule.link && <p className="text-[10px] text-[#3b82f6] truncate">{rule.link}</p>}
                        <div className="flex gap-3 text-[10px] text-[#71717a]">
                          <span>Matches: <span className="text-[#e8a020] font-bold">{rule.matches}</span></span>
                          <span>Sent: <span className="text-[#22c55e] font-bold">{rule.sent}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Scan Matches */}
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                  Keyword Matches ({ciMatches.length})
                </h3>
                {ciMatches.length === 0 ? (
                  <p className="text-[11px] text-[#52525b] text-center py-4">{ciScanning ? "Đang scan..." : "Chưa scan hoặc không có match mới. Bấm Scan Comments."}</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {ciMatches.map((match, idx) => (
                      <div key={idx} className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{match.fb_user_name || "Unknown"}</span>
                          <span className="text-[10px] bg-[rgba(59,130,246,0.15)] text-[#3b82f6] px-2 py-0.5 rounded font-bold">{match.matched_keyword}</span>
                        </div>
                        <p className="text-[10px] text-[#a1a1aa]">"{match.comment_text}"</p>
                        <p className="text-[10px] text-[#52525b]">Inbox: {match.inbox_message.slice(0, 80)}...</p>
                        <button onClick={() => ciSendInbox(match)}
                          className="w-full py-1.5 rounded text-[10px] font-bold bg-[#22c55e] text-black cursor-pointer hover:brightness-110">
                          Gửi Inbox
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 3: Send Log */}
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                  Inbox Log ({ciLog.length})
                </h3>
                {ciLog.length === 0 ? (
                  <p className="text-[11px] text-[#52525b] text-center py-4">Chưa gửi inbox nào.</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {ciLog.map(entry => (
                      <div key={entry.id} className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white">{entry.fb_user_name || entry.fb_user_id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${entry.status === "sent" ? "bg-[rgba(34,196,160,0.15)] text-[#22c4a0]" : "bg-[rgba(239,68,68,0.15)] text-[#ef4444]"}`}>
                            {entry.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#71717a] line-clamp-2">{entry.message}</p>
                        <p className="text-[10px] text-[#52525b]">{new Date(entry.sent_at).toLocaleString("vi-VN")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Guide */}
            <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">Hướng dẫn sử dụng</h3>
              <div className="grid grid-cols-4 gap-4 text-[11px] text-[#a1a1aa]">
                <div>
                  <span className="text-[#e8a020] font-bold block mb-1">1. Tạo Rule</span>
                  Nhập Facebook Post ID, keywords (VD: VIỆC, THỢ), và nội dung inbox muốn gửi.
                </div>
                <div>
                  <span className="text-[#3b82f6] font-bold block mb-1">2. Scan Comments</span>
                  Hệ thống quét comments trên post, tìm keyword match. Nên scan mỗi 5-10 phút.
                </div>
                <div>
                  <span className="text-[#22c55e] font-bold block mb-1">3. Gửi Inbox</span>
                  Gửi thủ công từng match hoặc Auto Process All để gửi hết. User cần đã tương tác với Page.
                </div>
                <div>
                  <span className="text-[#8b5cf6] font-bold block mb-1">4. Theo dõi</span>
                  Xem Inbox Log để track ai đã nhận. Nếu inbox fail → hệ thống reply comment thay thế.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* ══════ TAB: PHÂN PHỐI ══════ */}
        {tab === "distribution" && (
          <div className="space-y-5">

            {/* ── Header + Stats ── */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Phân phối hôm nay</h2>
                <p className="text-xs text-[#71717a] mt-0.5">{distToday?.date || "..."} — Morning 09:00 → Evening 20:30</p>
              </div>
              <button onClick={loadDistToday} disabled={distLoading}
                className="px-3 py-1.5 rounded-lg text-xs border border-[#2e2e33] text-[#71717a] cursor-pointer hover:text-white disabled:opacity-40">
                {distLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {distToday && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["Total hôm nay", distToday.stats.total, "#a1a1aa"],
                  ["Đã approve", distToday.stats.approved, "#e8a020"],
                  ["Đã đăng", distToday.stats.posted, "#22c4a0"],
                  ["Linked hypothesis", distToday.stats.with_hypothesis, "#8b5cf6"],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="bg-[#141416] border border-[#2e2e33] rounded-xl p-3">
                    <div className="text-lg font-bold font-mono" style={{ color: color as string }}>{val}</div>
                    <div className="text-[10px] text-[#71717a] mt-0.5">{label as string}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Kênh phân phối thực tế ── */}
            {distGroups.length > 0 && (
              <div className="bg-[#141416] border border-[#2e2e33] rounded-xl p-4">
                <p className="text-xs font-bold mb-3 text-[#a1a1aa]">Kênh phân phối của bạn ({distGroups.length})</p>
                <div className="flex flex-wrap gap-2">
                  {distGroups.map((g: any, i: number) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${g.priority === "high" ? "border-[rgba(232,160,32,0.3)] bg-[rgba(232,160,32,0.05)]" : "border-[#2e2e33] bg-[#0c0c0d]"}`}>
                      <span className="text-xs">{g.icon}</span>
                      {g.url ? (
                        <a href={g.url} target="_blank" rel="noopener"
                          className="text-[11px] text-[#3b82f6] hover:underline font-medium">
                          {g.name} ↗
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#71717a]">{g.name}</span>
                      )}
                      {g.priority === "high" && <span className="text-[9px] text-[#e8a020]">★</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 2 cột: Morning | Evening ── */}
            <div className="grid grid-cols-2 gap-4">

              {/* MORNING PANEL */}
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">☀️</span>
                  <h3 className="text-sm font-bold">Morning (09:00)</h3>
                  <span className="text-[10px] text-[#52525b] ml-auto">Layer 1→4</span>
                </div>

                {/* Step 1: Scan Moments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">1. Scan Group Moments</p>
                      <p className="text-[10px] text-[#71717a]">R2 quét groups → tìm market moments hôm nay</p>
                    </div>
                    <button onClick={morningScanMoments} disabled={morningScanning}
                      className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40 shrink-0">
                      {morningScanning ? "Scanning..." : "Scan"}
                    </button>
                  </div>
                  {morningMoments.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {morningMoments.map((m: any, i: number) => (
                        <div key={i} className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${m.user_state === "emergency" ? "bg-[rgba(239,68,68,0.15)] text-[#ef4444]" : m.user_state === "active_search" ? "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]" : "bg-[rgba(59,130,246,0.15)] text-[#3b82f6]"}`}>{m.user_state}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${m.urgency === "high" ? "text-[#ef4444]" : "text-[#71717a]"}`}>{m.urgency}</span>
                          </div>
                          <p className="text-[10px] text-[#a1a1aa]">{m.trigger}</p>
                          <p className="text-[9px] text-[#52525b] mt-0.5">CTA: {m.suggested_cta}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Link Hypotheses */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">2. Link Hypotheses</p>
                    <p className="text-[10px] text-[#71717a]">AI match demand_capture posts → hypothesis</p>
                  </div>
                  <button onClick={morningLinkHypotheses} disabled={morningLinking}
                    className="px-3 py-1.5 rounded text-[10px] font-bold border border-[#8b5cf6] text-[#8b5cf6] cursor-pointer hover:bg-[rgba(139,92,246,0.1)] disabled:opacity-40 shrink-0">
                    {morningLinking ? "Linking..." : "Link"}
                  </button>
                </div>

                {/* Link result */}
                {morningLinkResult && (
                  <div className={`rounded-lg px-3 py-2 text-[10px] ${morningLinkResult.status === "success" ? "bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)]" : "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]"}`}>
                    <p className={`font-bold mb-1 ${morningLinkResult.status === "success" ? "text-[#8b5cf6]" : "text-[#ef4444]"}`}>
                      {morningLinkResult.message || morningLinkResult.error}
                    </p>
                    {morningLinkResult.details?.map((d: any, i: number) => (
                      <p key={i} className="text-[#71717a] truncate">🧪 {d.post} → {d.hypothesis}</p>
                    ))}
                  </div>
                )}

                {/* Step 3: Post routing info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold">3. Routing plan hôm nay</p>
                    <span className="text-[10px] text-[#52525b]">{distToday?.stats?.total || 0} bài (draft + approved)</span>
                  </div>
                  {!distToday || distToday.posts.filter((p: any) => p.status === "draft" || p.status === "approved").length === 0 ? (
                    <p className="text-[11px] text-[#52525b]">Hôm nay chưa có bài nào. Vào tab Weekly để generate plan.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {distToday.posts
                        .filter((p: any) => p.status === "draft" || p.status === "approved")
                        .map((p: any) => (
                          <div key={p.id} className={`border rounded-lg px-3 py-2 ${p.status === "approved" ? "bg-[rgba(232,160,32,0.05)] border-[rgba(232,160,32,0.2)]" : "bg-[#0c0c0d] border-[#2e2e33]"}`}>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${p.status === "approved" ? "text-[#e8a020] bg-[rgba(232,160,32,0.15)]" : "text-[#71717a] bg-[#2e2e33]"}`}>{p.status}</span>
                              {p.gtm_engine && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${p.gtm_engine === "demand_capture" ? "text-[#3b82f6] bg-[rgba(59,130,246,0.1)]" : p.gtm_engine === "narrative" ? "text-[#f59e0b] bg-[rgba(245,158,11,0.1)]" : "text-[#22c55e] bg-[rgba(34,197,94,0.1)]"}`}>{p.gtm_engine}</span>
                              )}
                              {p.angle && <span className="text-[9px] text-[#8b5cf6]">{p.angle}</span>}
                              <span className="text-[9px] text-[#71717a]">{p.scheduled_time}</span>
                              {p.hypothesis_id && <span className="text-[9px] text-[#8b5cf6] font-mono" title={p.hypothesis_id}>🧪</span>}
                              {p.has_seed_comments && <span className="text-[9px] text-[#e8a020]">💬 {p.seed_comments_count}</span>}
                            </div>
                            <p className="text-[10px] text-[#a1a1aa] truncate">{p.hook || p.body?.slice(0, 60)}</p>
                            <p className="text-[9px] text-[#22c55e] mt-1 font-semibold">→ {p.routing_label || "Chưa routing"}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* EVENING PANEL */}
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌙</span>
                  <h3 className="text-sm font-bold">Evening (20:30)</h3>
                  <span className="text-[10px] text-[#52525b] ml-auto">Layer 4→5</span>
                </div>

                {/* Step 1: Scan Comments */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">1. Scan Comments + Inbox</p>
                    <p className="text-[10px] text-[#71717a]">Detect keyword → auto-inbox leads</p>
                  </div>
                  <button onClick={ciScanComments} disabled={ciScanning}
                    className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 disabled:opacity-40 shrink-0">
                    {ciScanning ? "Scanning..." : "Scan"}
                  </button>
                </div>

                {/* Step 2: Auto Process Inbox */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">2. Auto Process Inbox</p>
                    <p className="text-[10px] text-[#71717a]">Gửi inbox cho tất cả keyword matches</p>
                  </div>
                  <button onClick={ciAutoProcess} disabled={ciProcessing}
                    className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#22c55e] text-black cursor-pointer hover:brightness-110 disabled:opacity-40 shrink-0">
                    {ciProcessing ? "Processing..." : "Auto Inbox"}
                  </button>
                </div>

                {/* Step 3: Capture Signals */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">3. Capture Signals → Hypothesis</p>
                    <p className="text-[10px] text-[#71717a]">Intent signals + engagement → cập nhật signal_score</p>
                  </div>
                  <button onClick={eveningCaptureSignals} disabled={eveningCapturing}
                    className="px-3 py-1.5 rounded text-[10px] font-bold border border-[#8b5cf6] text-[#8b5cf6] cursor-pointer hover:bg-[rgba(139,92,246,0.1)] disabled:opacity-40 shrink-0">
                    {eveningCapturing ? "Capturing..." : "Capture"}
                  </button>
                </div>

                {eveningResult && eveningResult.status === "success" && (
                  <div className="bg-[#0c0c0d] border border-[rgba(139,92,246,0.2)] rounded-lg px-3 py-2 space-y-1">
                    <p className="text-[10px] font-bold text-[#8b5cf6]">Signal capture done</p>
                    <p className="text-[10px] text-[#71717a]">Posts processed: {eveningResult.posts_processed}</p>
                    <p className="text-[10px] text-[#71717a]">Hypothesis updates: {eveningResult.evidence_updates}</p>
                    {eveningResult.details?.map((d: any, i: number) => (
                      <p key={i} className="text-[9px] text-[#52525b]">{d.hypothesis?.slice(0, 40)}: {d.signal_type} +{d.score_delta}</p>
                    ))}
                  </div>
                )}

                {/* Step 4: Sync Metrics */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2e2e33]">
                  <div>
                    <p className="text-xs font-semibold">4. Sync FB Metrics</p>
                    <p className="text-[10px] text-[#71717a]">Pull engagements → validate hypothesis evidence</p>
                  </div>
                  <button onClick={distSyncMetrics} disabled={syncingDist}
                    className="px-3 py-1.5 rounded text-[10px] font-bold border border-[#e8a020] text-[#e8a020] cursor-pointer hover:bg-[rgba(232,160,32,0.1)] disabled:opacity-40 shrink-0">
                    {syncingDist ? "Syncing..." : "Sync"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Posted today table ── */}
            {distToday?.posts.filter((p: any) => p.status === "posted").length > 0 && (
              <div className="bg-[#1c1c1f] border border-[#2e2e33] rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3">Đã đăng hôm nay ({distToday.stats.posted} bài)</h3>
                <div className="space-y-2">
                  {distToday.posts.filter((p: any) => p.status === "posted").map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#0c0c0d] last:border-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${p.gtm_engine === "demand_capture" ? "text-[#3b82f6] bg-[rgba(59,130,246,0.1)]" : p.gtm_engine === "narrative" ? "text-[#f59e0b] bg-[rgba(245,158,11,0.1)]" : "text-[#22c55e] bg-[rgba(34,197,94,0.1)]"}`}>{p.gtm_engine || "post"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{p.hook || p.body?.slice(0, 80)}</p>
                        <p className="text-[10px] text-[#52525b]">{p.routing_label} · {p.scheduled_time}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        {p.post_url && <a href={p.post_url} target="_blank" rel="noopener" className="text-[10px] text-[#3b82f6] hover:underline block">View</a>}
                        {p.impressions != null && <p className="text-[9px] text-[#71717a]">{p.impressions} views · {p.engagements} eng</p>}
                      </div>
                      {p.hypothesis_id && <span className="text-[9px] text-[#8b5cf6] font-mono shrink-0">🧪 H-{p.hypothesis_id.slice(0, 6)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Seed Comments Reminder ── */}
            {distToday?.posts.filter((p: any) => p.has_seed_comments).length > 0 && (
              <div className="bg-[rgba(232,160,32,0.05)] border border-[rgba(232,160,32,0.2)] rounded-xl p-4">
                <p className="text-xs font-bold text-[#e8a020] mb-2">💬 Seed Comments — cần làm thủ công</p>
                <p className="text-[10px] text-[#71717a] mb-3">
                  Sau khi đăng bài, paste các seed comments này lên Facebook trong 30 phút đầu để kích hoạt algorithm. Vào tab Today → chọn bài → xem comments.
                </p>
                <div className="space-y-2">
                  {distToday.posts.filter((p: any) => p.has_seed_comments).map((p: any) => (
                    <div key={p.id} className="bg-[#0c0c0d] border border-[rgba(232,160,32,0.15)] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${p.status === "posted" ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]" : p.status === "approved" ? "bg-[rgba(232,160,32,0.15)] text-[#e8a020]" : "bg-[#2e2e33] text-[#71717a]"}`}>{p.status}</span>
                        <span className="text-[9px] text-[#e8a020]">💬 {p.seed_comments_count} seed comments</span>
                        <span className="text-[9px] text-[#52525b]">{p.scheduled_time}</span>
                      </div>
                      <p className="text-[10px] text-[#a1a1aa] truncate">{p.hook || p.body?.slice(0, 60)}</p>
                      <p className="text-[9px] text-[#52525b] mt-1">→ {p.routing_label || "Chưa routing"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

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
              <button onClick={copyPostContent}
                className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${spCopied ? "bg-[#22c55e] text-black" : "bg-[#e8a020] text-black hover:brightness-110"}`}>
                {spCopied ? "Đã copy!" : "Copy nội dung"}
              </button>
            </div>
            {/* Step 2: Media */}
            {(spSelectedPost.image_url || spSelectedPost.video_url) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${spMediaCopied ? "bg-[#22c55e] text-black" : spCopied ? "bg-[#3b82f6] text-white" : "bg-[#2e2e33] text-[#71717a]"}`}>2</span>
                  <span className="text-sm font-medium">{spSelectedPost.video_url ? "Lấy video" : "Lấy ảnh"}</span>
                </div>
                {spSelectedPost.image_url && (
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={spSelectedPost.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#2e2e33] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#71717a] truncate">{spSelectedPost.image_path || spSelectedPost.image_url}</p>
                      <div className="flex gap-2 mt-1">
                        <a href={`/api/backend${spSelectedPost.image_url}`} download target="_blank" rel="noopener"
                          className="px-3 py-1.5 rounded text-[11px] font-bold bg-[#3b82f6] text-white cursor-pointer hover:brightness-110 transition-all inline-block">
                          Tải ảnh
                        </a>
                        <button onClick={async () => {
                          const localPath = spSelectedPost!.image_path || "";
                          await navigator.clipboard.writeText(localPath);
                          setSpMediaCopied(true);
                        }}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-all ${spMediaCopied ? "bg-[#22c55e] text-black" : "border border-[#3b82f6] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)]"}`}>
                          {spMediaCopied ? "Đã copy!" : "Copy đường dẫn file"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {spSelectedPost.video_url && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-16 rounded-lg bg-[#0c0c0d] border border-[#2e2e33] flex items-center justify-center shrink-0">
                      <span className="text-[#ef4444] text-lg">&#9654;</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#71717a] truncate">{spSelectedPost.video_path || spSelectedPost.video_url}</p>
                      <div className="flex gap-2 mt-1">
                        <a href={`/api/backend${spSelectedPost.video_url}`} download target="_blank" rel="noopener"
                          className="px-3 py-1.5 rounded text-[11px] font-bold bg-[#ef4444] text-white cursor-pointer hover:brightness-110 transition-all inline-block">
                          Tải video
                        </a>
                        <button onClick={async () => {
                          const localPath = spSelectedPost!.video_path || "";
                          await navigator.clipboard.writeText(localPath);
                          setSpMediaCopied(true);
                        }}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-all ${spMediaCopied ? "bg-[#22c55e] text-black" : "border border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"}`}>
                          {spMediaCopied ? "Đã copy!" : "Copy đường dẫn file"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Step 3: Post to FB */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${spCopied ? "bg-[#e8a020] text-black" : "bg-[#2e2e33] text-[#71717a]"}`}>{(spSelectedPost.image_url || spSelectedPost.video_url) ? "3" : "2"}</span>
                <span className="text-sm font-medium">Đăng lên Facebook (Page / Group / Timeline)</span>
              </div>
              <p className="text-xs text-[#71717a]">Mở Facebook, paste nội dung{(spSelectedPost.image_url || spSelectedPost.video_url) ? ", upload ảnh/video" : ""}, đăng bài.</p>
            </div>
            {/* Step 4: Paste link */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#2e2e33] text-[#71717a]">{(spSelectedPost.image_url || spSelectedPost.video_url) ? "4" : "3"}</span>
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
            {/* ── YouTube Upload ── */}
            {spSelectedPost.video_url && (
              <div className="space-y-3 border-t border-[#2e2e33] pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ef4444] text-lg">&#9654;</span>
                    <span className="text-sm font-bold">Đăng YouTube{spSelectedPost.content_type === "reel" ? " Shorts" : ""}</span>
                  </div>
                  {ytConnected && ytChannel ? (
                    <span className="text-[10px] text-[#22c4a0] bg-[rgba(34,196,160,0.1)] px-2 py-0.5 rounded">{ytChannel.title}</span>
                  ) : (
                    <button onClick={ytConnect} className="text-[10px] text-[#3b82f6] hover:underline cursor-pointer">Kết nối YouTube</button>
                  )}
                </div>
                {ytConnected ? (
                  ytResult ? (
                    <div className="bg-[rgba(34,196,160,0.05)] border border-[rgba(34,196,160,0.2)] rounded-lg p-3 space-y-1">
                      <p className="text-xs text-[#22c4a0] font-bold">Upload thành công!</p>
                      <a href={ytResult.video_url} target="_blank" rel="noopener" className="text-xs text-[#3b82f6] hover:underline break-all">{ytResult.video_url}</a>
                      <p className="text-[10px] text-[#71717a]">Privacy: {ytResult.privacy}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-[#71717a] uppercase">Tiêu đề</span>
                        <input value={ytTitle} onChange={e => setYtTitle(e.target.value)} maxLength={100}
                          className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#ef4444]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#71717a] uppercase">Mô tả</span>
                        <textarea value={ytDesc} onChange={e => setYtDesc(e.target.value)} rows={3}
                          className="w-full bg-[#0c0c0d] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#ef4444] resize-none" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[9px] text-[#71717a] uppercase">Quyền riêng tư</span>
                          <select value={ytPrivacy} onChange={e => setYtPrivacy(e.target.value)}
                            className="bg-[#0c0c0d] border border-[#2e2e33] rounded px-2 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#ef4444] cursor-pointer ml-2">
                            <option value="private">Private</option>
                            <option value="unlisted">Unlisted</option>
                            <option value="public">Public</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={ytUpload} disabled={ytUploading || !ytTitle.trim()}
                        className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#ef4444] text-white cursor-pointer hover:brightness-110 transition-all disabled:opacity-40">
                        {ytUploading ? "Đang upload lên YouTube..." : `Upload ${spSelectedPost.content_type === "reel" ? "YouTube Shorts" : "YouTube"}`}
                      </button>
                      {ytUploading && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-[#a1a1aa]">Video đang được upload...</span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3">
                    <p className="text-[11px] text-[#71717a] mb-2">Cần kết nối tài khoản YouTube để upload trực tiếp.</p>
                    <button onClick={ytConnect}
                      className="px-4 py-2 rounded-lg text-xs font-bold border border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] cursor-pointer transition-all">
                      Kết nối YouTube
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* ── TikTok Upload ── */}
            {spSelectedPost.video_url && (
              <div className="space-y-3 border-t border-[#2e2e33] pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">&#9835;</span>
                    <span className="text-sm font-bold">Đăng TikTok</span>
                  </div>
                  {ttConnected && ttUser ? (
                    <span className="text-[10px] text-[#22c4a0] bg-[rgba(34,196,160,0.1)] px-2 py-0.5 rounded">{ttUser.display_name}</span>
                  ) : (
                    <button onClick={ttConnect} className="text-[10px] text-[#e8a020] hover:underline cursor-pointer">Kết nối TikTok</button>
                  )}
                </div>
                {/* Already posted? */}
                {(ttResult || spSelectedPost.tt_post_url) ? (
                  <div className="bg-[rgba(34,196,160,0.05)] border border-[rgba(34,196,160,0.2)] rounded-lg p-3 space-y-1">
                    <p className="text-xs text-[#22c4a0] font-bold">Đã đăng TikTok!</p>
                    {(ttResult?.tiktok_url || spSelectedPost.tt_post_url) && (
                      <a href={ttResult?.tiktok_url || spSelectedPost.tt_post_url || ""} target="_blank" rel="noopener" className="text-xs text-[#3b82f6] hover:underline break-all">
                        {ttResult?.tiktok_url || spSelectedPost.tt_post_url}
                      </a>
                    )}
                    {ttResult?.publish_id && <p className="text-[10px] text-[#71717a]">TikTok đang xử lý video...</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Option A: API Upload (if connected) */}
                    {ttConnected && (
                      <div className="space-y-2 bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3">
                        <p className="text-[10px] font-bold text-[#e8a020] uppercase">Upload trực tiếp</p>
                        <div>
                          <span className="text-[9px] text-[#71717a] uppercase">Caption</span>
                          <textarea value={ttCaption} onChange={e => setTtCaption(e.target.value)} rows={2} maxLength={2200}
                            className="w-full bg-[#141416] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-[#f5f5f7] outline-none focus:border-[#e8a020] resize-none" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[#71717a] uppercase">Privacy</span>
                          <select value={ttPrivacy} onChange={e => setTtPrivacy(e.target.value)}
                            className="bg-[#141416] border border-[#2e2e33] rounded px-2 py-1 text-[10px] text-[#f5f5f7] outline-none cursor-pointer">
                            <option value="SELF_ONLY">Chỉ mình tôi</option>
                            <option value="MUTUAL_FOLLOW_FRIENDS">Bạn bè</option>
                            <option value="FOLLOWER_OF_CREATOR">Followers</option>
                            <option value="PUBLIC_TO_EVERYONE">Công khai</option>
                          </select>
                        </div>
                        <button onClick={ttUpload} disabled={ttUploading}
                          className="w-full py-2 rounded-lg text-xs font-bold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 transition-all disabled:opacity-40">
                          {ttUploading ? "Đang upload TikTok..." : "Upload TikTok"}
                        </button>
                        {ttUploading && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-[#e8a020] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] text-[#a1a1aa]">Đang upload...</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Option B: Manual post */}
                    <div className="space-y-2 bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3">
                      <p className="text-[10px] font-bold text-[#71717a] uppercase">Đăng thủ công</p>
                      <p className="text-[10px] text-[#52525b]">Copy đường dẫn video ở trên → mở TikTok → upload → paste link bên dưới</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://tiktok.com/@..." value={ttManualUrl} onChange={e => setTtManualUrl(e.target.value)}
                          className="flex-1 bg-[#141416] border border-[#2e2e33] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#52525b] outline-none focus:border-[#e8a020]" />
                        <button onClick={ttSubmitManual} disabled={!ttManualUrl.trim()}
                          className="px-3 py-1.5 rounded text-[11px] font-bold bg-[#e8a020] text-black cursor-pointer hover:brightness-110 transition-all disabled:opacity-40">
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
          {post.yt_video_id && <span className="text-[10px] text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-1.5 py-0.5 rounded">YT</span>}
          {(post.tt_video_id || post.tt_post_url) && <span className="text-[10px] text-[#e8a020] bg-[rgba(232,160,32,0.1)] px-1.5 py-0.5 rounded">TT</span>}
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
            {/* Reel frames editor */}
            {post.content_type === "reel" && editForm.reel_script?.frames && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Label small>Reel Frames ({editForm.reel_script.frames.length})</Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#71717a]">Nhạc nền:</span>
                    <select
                      value={editForm.reel_script.music_mood || "neutral"}
                      onChange={(e) => onEditChange({ reel_script: { ...editForm.reel_script, music_mood: e.target.value } })}
                      className="bg-[#0c0c0d] border border-[#2e2e33] rounded px-1.5 py-0.5 text-[10px] text-[#f5f5f7] outline-none focus:border-[#e8a020] cursor-pointer"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="upbeat">Upbeat / Vui</option>
                      <option value="chill">Chill / Nhẹ nhàng</option>
                      <option value="dramatic">Dramatic / Kịch tính</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="energetic">Energetic / Năng lượng</option>
                    </select>
                  </div>
                </div>
                {editForm.reel_script.frames.map((frame: any, idx: number) => (
                  <div key={idx} className="bg-[#0c0c0d] border border-[#2e2e33] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#ef4444]">Frame {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.5" min="0"
                          value={frame.start_time ?? 0}
                          onChange={(e) => {
                            const frames = [...editForm.reel_script.frames];
                            frames[idx] = { ...frames[idx], start_time: parseFloat(e.target.value) || 0 };
                            onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                          }}
                          className="w-14 bg-[#141416] border border-[#2e2e33] rounded px-1.5 py-0.5 text-[10px] text-[#f5f5f7] outline-none focus:border-[#e8a020] text-center"
                        />
                        <span className="text-[10px] text-[#52525b]">→</span>
                        <input type="number" step="0.5" min="0"
                          value={frame.end_time ?? 0}
                          onChange={(e) => {
                            const frames = [...editForm.reel_script.frames];
                            frames[idx] = { ...frames[idx], end_time: parseFloat(e.target.value) || 0 };
                            onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                          }}
                          className="w-14 bg-[#141416] border border-[#2e2e33] rounded px-1.5 py-0.5 text-[10px] text-[#f5f5f7] outline-none focus:border-[#e8a020] text-center"
                        />
                        <span className="text-[10px] text-[#52525b]">s</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase">Text overlay</span>
                      <input
                        value={frame.text_overlay || ""}
                        onChange={(e) => {
                          const frames = [...editForm.reel_script.frames];
                          frames[idx] = { ...frames[idx], text_overlay: e.target.value };
                          onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                        }}
                        className="w-full bg-[#141416] border border-[#2e2e33] rounded px-2 py-1 text-xs text-[#f5f5f7] font-bold outline-none focus:border-[#e8a020]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase">Voiceover</span>
                      <input
                        value={frame.voiceover_text || ""}
                        onChange={(e) => {
                          const frames = [...editForm.reel_script.frames];
                          frames[idx] = { ...frames[idx], voiceover_text: e.target.value };
                          onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                        }}
                        className="w-full bg-[#141416] border border-[#2e2e33] rounded px-2 py-1 text-[11px] text-[#a1a1aa] italic outline-none focus:border-[#e8a020]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase">Visual direction</span>
                      <textarea
                        value={frame.visual_direction || ""}
                        onChange={(e) => {
                          const frames = [...editForm.reel_script.frames];
                          frames[idx] = { ...frames[idx], visual_direction: e.target.value };
                          onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                        }}
                        rows={2}
                        className="w-full bg-[#141416] border border-[#2e2e33] rounded px-2 py-1 text-[11px] text-[#71717a] outline-none focus:border-[#e8a020] resize-none"
                      />
                    </div>
                  </div>
                ))}
                {/* Add/Remove frame buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const frames = [...editForm.reel_script.frames];
                      const lastFrame = frames[frames.length - 1];
                      const newStart = lastFrame?.end_time ?? frames.length * 3;
                      frames.push({
                        frame_number: frames.length + 1,
                        start_time: newStart,
                        end_time: newStart + 3,
                        text_overlay: "",
                        text_position: "center",
                        text_size: "medium",
                        voiceover_text: "",
                        visual_direction: "",
                        background_color: "#1a1a2e",
                      });
                      onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                    }}
                    className="text-[10px] text-[#22c4a0] hover:text-[#34d9b3] cursor-pointer"
                  >+ Thêm frame</button>
                  {editForm.reel_script.frames.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const frames = editForm.reel_script.frames.slice(0, -1);
                        onEditChange({ reel_script: { ...editForm.reel_script, frames } });
                      }}
                      className="text-[10px] text-[#ef4444] hover:text-[#f87171] cursor-pointer"
                    >− Xóa frame cuối</button>
                  )}
                </div>
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
            {/* AI Reasoning */}
            {(post.ai_reasoning || post.hypothesis_title) && !compact && (
              <details className="mt-3 group">
                <summary className="flex items-center gap-1.5 cursor-pointer text-[10px] text-[#52525b] hover:text-[#71717a] select-none list-none">
                  <span className="text-[#8b5cf6]">▸</span>
                  <span className="group-open:hidden">AI Reasoning</span>
                  <span className="hidden group-open:inline text-[#8b5cf6]">AI Reasoning</span>
                </summary>
                <div className="mt-2 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] rounded-lg p-3 space-y-2">
                  {post.hypothesis_title && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#8b5cf6] uppercase tracking-wider">Hypothesis tested</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${post.hypothesis_tier === 3 ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e]" : post.hypothesis_tier === 2 ? "bg-[rgba(232,160,32,0.1)] text-[#e8a020]" : "bg-[rgba(59,130,246,0.1)] text-[#3b82f6]"}`}>T{post.hypothesis_tier}</span>
                      <span className="text-[10px] text-[#a1a1aa]">{post.hypothesis_title}</span>
                    </div>
                  )}
                  {post.ai_reasoning && (
                    <p className="text-[10px] text-[#71717a] leading-relaxed">{post.ai_reasoning}</p>
                  )}
                </div>
              </details>
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
      <div className="px-4 pb-2 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {post.angle && (
            <span className="text-[10px] text-[#8b5cf6] bg-[rgba(139,92,246,0.1)] px-2 py-0.5 rounded font-bold">{post.angle}</span>
          )}
          {post.hypothesis_id && (
            <span className="text-[10px] text-[#22c55e] bg-[rgba(34,197,94,0.08)] px-2 py-0.5 rounded font-mono" title={`Testing hypothesis: ${post.hypothesis_id}`}>
              🧪 H-{post.hypothesis_id.slice(0, 6)}
            </span>
          )}
          {post.gtm_engine && (
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              post.gtm_engine === "narrative" ? "text-[#f59e0b] bg-[rgba(245,158,11,0.1)]" :
              post.gtm_engine === "proof" ? "text-[#22c55e] bg-[rgba(34,197,94,0.1)]" :
              post.gtm_engine === "demand_capture" ? "text-[#3b82f6] bg-[rgba(59,130,246,0.1)]" :
              "text-[#71717a] bg-[rgba(113,113,122,0.1)]"
            }`}>{post.gtm_engine}</span>
          )}
          {post.entry_point && (
            <span className="text-[10px] text-[#e8a020] bg-[rgba(232,160,32,0.1)] px-2 py-0.5 rounded">{post.entry_point}</span>
          )}
        </div>
        {post.image_prompt && (
          <p className="text-[10px] text-[#52525b]">{post.image_prompt}</p>
        )}
        {isReel && post.reel_script?.frames && (
          <p className="text-[10px] text-[#52525b]">Frames: {post.reel_script.frames.length} | {post.reel_script.duration_seconds || 10}s</p>
        )}
      </div>

      {/* Seed Comments — human-in-the-loop seeding */}
      {post.seed_comments && post.seed_comments.length > 0 && (
        <SeedCommentsPanel comments={post.seed_comments} />
      )}
    </div>
  );
}

// ── Seed Comments Panel ──

function SeedCommentsPanel({ comments }: { comments: { text: string; type: string; trigger: string }[] }) {
  const [open, setOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const typeColor: Record<string, string> = {
    expansion: "text-[#3b82f6] bg-[rgba(59,130,246,0.1)]",
    contrast:  "text-[#f59e0b] bg-[rgba(245,158,11,0.1)]",
    inquiry:   "text-[#22c55e] bg-[rgba(34,197,94,0.1)]",
  };
  const typeLabel: Record<string, string> = {
    expansion: "Mở rộng",
    contrast:  "Phản biện nhẹ",
    inquiry:   "Hỏi thêm",
  };

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="mx-4 mb-4 border border-dashed border-[#2e2e33] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-[#e8a020] bg-[rgba(232,160,32,0.05)] cursor-pointer hover:bg-[rgba(232,160,32,0.1)] transition-all"
      >
        <span>💬 Seed Comments ({comments.length})</span>
        <span className="text-[#52525b]">{open ? "▲ Đóng" : "▼ Mở để copy"}</span>
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-[#0c0c0d]">
          <p className="text-[10px] text-[#52525b]">Copy từng comment, paste thủ công sau khi đăng bài để kích hoạt conversation.</p>
          {comments.map((c, i) => (
            <div key={i} className="bg-[#1c1c1f] border border-[#2e2e33] rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${typeColor[c.type] || "text-[#71717a] bg-[#2e2e33]"}`}>
                  {typeLabel[c.type] || c.type}
                </span>
                {c.trigger && (
                  <span className="text-[9px] text-[#52525b]">trigger: {c.trigger}</span>
                )}
                <button
                  onClick={() => copy(c.text, i)}
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded cursor-pointer transition-all font-semibold ${
                    copiedIdx === i ? "bg-[#22c55e] text-black" : "border border-[#3b82f6] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)]"
                  }`}
                >
                  {copiedIdx === i ? "Đã copy!" : "Copy"}
                </button>
              </div>
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
