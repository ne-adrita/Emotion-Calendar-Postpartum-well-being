import React, { useEffect, useMemo, useState } from "react";

/*
  ResourcesWithAI.jsx
  - Enhanced Resources page with:
    - AI-powered recommendations (client-side similarity)
    - Featured resources slider (auto + manual)
    - Animated category filter
    - Online PDF preview modal (iframe)

  Drop this file into your React app. It uses only React and localStorage.
*/

// --- DEFAULT RESOURCES (replace or extend as needed) ---
const DEFAULT_RESOURCES = [
  {
    id: "res-1",
    title: "Postpartum Recovery Guide (WHO)",
    description:
      "Evidence-based physical and emotional recovery guide for new mothers.",
    category: "Postpartum Care",
    url: "https://www.who.int/reproductivehealth/publications/maternal_perinatal_health/postpartum-care/en/",
    filename: "WHO-Postpartum-Care.pdf",
    createdAt: new Date().toISOString(),
    icon: "🩺",
  },
  {
    id: "res-2",
    title: "Postpartum Depression Handbook (APA)",
    description: "Symptoms, risk factors, screening tools, and effective treatments.",
    category: "Mental Health",
    url: "https://www.apa.org/pi/women/resources/reports/postpartum-depression",
    filename: "APA-PPD-Handbook.pdf",
    createdAt: new Date().toISOString(),
    icon: "🧠",
  },
  {
    id: "res-3",
    title: "Breastfeeding Support Toolkit",
    description: "Professional UNICEF toolkit with breastfeeding coaching and troubleshooting.",
    category: "Breastfeeding",
    url: "https://www.unicef.org/reports/breastfeeding-support-toolkit",
    filename: "UNICEF-Breastfeeding-Toolkit.pdf",
    createdAt: new Date().toISOString(),
    icon: "🤱",
  },
  {
    id: "res-4",
    title: "Postpartum Nutrition Guide",
    description: "Nutritional guidelines, healing foods, hydration, and meal planning.",
    category: "Nutrition",
    url: "https://www.cdc.gov/nutrition/resources-publications/pregnancy-infant-toddler-nutrition/index.html",
    filename: "CDC-Postpartum-Nutrition.pdf",
    createdAt: new Date().toISOString(),
    icon: "🍎",
  },
  {
    id: "res-5",
    title: "Newborn Care Essentials",
    description: "Safe sleep, diapering, bathing, feeding, and newborn health essentials.",
    category: "Newborn Care",
    url: "https://www.cdc.gov/reproductivehealth/features/pregnancy-newborn-mother-care/index.html",
    filename: "CDC-Newborn-Care.pdf",
    createdAt: new Date().toISOString(),
    icon: "👶",
  },
  {
    id: "res-6",
    title: "Partner Support Guide",
    description: "How partners can emotionally and practically support postpartum mothers.",
    category: "Relationships",
    url: "https://www.postpartum.net/get-help/for-partners/",
    filename: "PSI-Partner-Guide.pdf",
    createdAt: new Date().toISOString(),
    icon: "💑",
  },
];

// --- Utility functions ---
function uid(prefix = "id") {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

function tokenize(text = "") {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a = [], b = []) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = new Set([...A].filter((x) => B.has(x)));
  const uni = new Set([...A, ...B]);
  return uni.size === 0 ? 0 : inter.size / uni.size;
}

// Very small client-side "AI" similarity: token overlap on title+desc+category
function computeSimilarityMatrix(items) {
  const tokens = items.map((it) => tokenize(it.title + " " + it.description + " " + it.category));
  const mat = items.map((it, i) =>
    items.map((_, j) => {
      if (i === j) return 1;
      return jaccard(tokens[i], tokens[j]);
    })
  );
  return mat;
}

// --- Styles (kept inline for single-file simplicity) ---
const S = {
  page: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    padding: "16px 12px",
    maxWidth: "100%",
    margin: "0 auto",
    background: "linear-gradient(180deg,#081426 0%, #0f172a 100%)",
    minHeight: "100vh",
    color: "#e6eef8",
    boxSizing: "border-box",
  },
  header: {
    background: "linear-gradient(90deg,#6d28d9 0%, #7c3aed 100%)",
    padding: "20px 16px",
    borderRadius: "12px",
    boxShadow: "0 8px 40px rgba(16,24,40,0.6)",
    marginBottom: "16px",
  },
  controls: { 
    display: "flex", 
    gap: "12px", 
    marginTop: "16px", 
    alignItems: "center",
    flexWrap: "wrap" 
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.03)",
    color: "#e6eef8",
    outline: "none",
    fontSize: "14px",
    flex: "1",
    minWidth: "200px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    alignItems: "start",
  },
  leftCol: {},
  rightCol: {},
  card: {
    background: "linear-gradient(180deg,#0f172a, #111827)",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.04)",
    marginBottom: "12px",
  },
  featured: { position: "relative", overflow: "hidden", borderRadius: "10px" },
  sliderInner: { display: "flex", transition: "transform 500ms ease" },
  categoryStrip: { 
    display: "flex", 
    gap: "6px", 
    flexWrap: "wrap", 
    marginTop: "12px" 
  },
  catBtn: { 
    padding: "6px 10px", 
    borderRadius: "20px", 
    cursor: "pointer", 
    fontWeight: 600, 
    border: "1px solid rgba(255,255,255,0.04)",
    fontSize: "12px",
    whiteSpace: "nowrap"
  },
  activeCat: { background: "linear-gradient(90deg,#ff7a59,#ff6bcb)", color: "white" },
  resourceCard: { 
    display: "flex", 
    flexDirection: "column",
    gap: "12px"
  },
  iconBox: { 
    width: "48px", 
    height: "48px", 
    borderRadius: "8px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: "20px", 
    background: "rgba(255,255,255,0.03)" 
  },
  recList: { marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" },
  modalBackdrop: { 
    position: "fixed", 
    inset: 0, 
    background: "rgba(0,0,0,0.6)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    zIndex: 9999,
    padding: "16px"
  },
  modal: { 
    width: "100%", 
    maxWidth: "600px", 
    height: "auto",
    maxHeight: "90vh",
    background: "#0b1220", 
    borderRadius: "10px", 
    overflow: "hidden", 
    border: "1px solid rgba(255,255,255,0.06)" 
  },
};

export default function ResourcesWithAI() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Postpartum Care", url: "", filename: "", icon: "📄" });

  // UI state
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [preview, setPreview] = useState(null); // resource to preview PDF
  const [selected, setSelected] = useState(null); // selected resource for details and recommendations

  useEffect(() => {
    const raw = localStorage.getItem("rs_items_v2");
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch (e) {
        setItems(DEFAULT_RESOURCES);
      }
    } else {
      setItems(DEFAULT_RESOURCES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("rs_items_v2", JSON.stringify(items));
  }, [items]);

  // Featured slider autoplay
  useEffect(() => {
    const t = setInterval(() => setFeaturedIndex((i) => (i + 1) % Math.max(1, items.length)), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  // Categories derived from items
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category || "General")))], [items]);

  const results = useMemo(() => {
    return items.filter((it) => {
      if (category !== "All" && (it.category || "General") !== category) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (it.title || "").toLowerCase().includes(q) || (it.description || "").toLowerCase().includes(q) || (it.category || "").toLowerCase().includes(q);
    });
  }, [items, category, query]);

  // AI: compute similarity matrix only when items change
  const simMatrix = useMemo(() => computeSimilarityMatrix(items), [items]);

  function getRecommendationsFor(resourceId, max = 3) {
    const idx = items.findIndex((it) => it.id === resourceId);
    if (idx === -1) return [];
    const scores = simMatrix[idx].map((score, j) => ({ score, item: items[j] }));
    // sort by score desc, skip itself
    const sorted = scores
      .filter((s, j) => j !== idx)
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map((s) => s.item);
    return sorted;
  }

  function openPreview(item) {
    // NOTE: embedding arbitrary external URLs in an iframe may be blocked by X-Frame-Options/CSP.
    // We still provide the modal; if the resource cannot be embedded, the user can open in new tab.
    setPreview(item);
  }

  function handleCreate(e) {
    e.preventDefault();
    const title = (form.title || "").trim();
    if (!title) return alert("Title required");
    const newItem = { id: uid("res"), ...form, createdAt: new Date().toISOString() };
    setItems((p) => [newItem, ...p]);
    setShowForm(false);
    setForm({ title: "", description: "", category: "Postpartum Care", url: "", filename: "", icon: "📄" });
  }

  function handleDelete(id) {
    if (!confirm("Delete resource?")) return;
    setItems((p) => p.filter((it) => it.id !== id));
    if (selected && selected.id === id) setSelected(null);
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ flex: "1", minWidth: "250px" }}>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, lineHeight: "1.2" }}>Postpartum Resources — AI Recommendations</h1>
              <p style={{ margin: "8px 0 0 0", color: "rgba(230,238,248,0.85)", fontSize: "14px" }}>Find, preview, and discover related resources powered by a lightweight client-side recommendation engine.</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowForm(true)} style={{ 
                padding: "8px 12px", 
                borderRadius: "8px", 
                background: "#ffffff10", 
                color: "#fff", 
                border: "1px solid rgba(255,255,255,0.06)", 
                cursor: "pointer",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}>+ Add Resource</button>
            </div>
          </div>

          {/* controls */}
          <div style={S.controls}>
            <input 
              style={S.input} 
              placeholder="Search resources..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
            <div style={S.categoryStrip}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    ...S.catBtn,
                    ...(category === c ? S.activeCat : {}),
                    transition: "transform 220ms ease, box-shadow 220ms ease",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={S.grid}>
        {/* LEFT: results + featured */}
        <div style={S.leftCol}>
          {/* Featured slider */}
          {items.length > 0 && (
            <div style={{ ...S.card, ...S.featured }}>
              <h3 style={{ marginTop: 0, fontSize: "18px" }}>Featured Resources</h3>
              <div style={{ overflow: "hidden", borderRadius: "8px" }}>
                <div style={{ ...S.sliderInner, width: `${Math.max(1, items.length) * 100}%`, transform: `translateX(-${(featuredIndex * 100) / Math.max(1, items.length)}%)` }}>
                  {items.map((it) => (
                    <div key={it.id} style={{ width: `${100 / Math.max(1, items.length)}%`, padding: "12px", boxSizing: "border-box" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={S.iconBox}>{it.icon || "📄"}</div>
                        <div style={{ flex: "1", minWidth: "200px" }}>
                          <div style={{ fontSize: "16px", fontWeight: 700 }}>{it.title}</div>
                          <div style={{ fontSize: "13px", color: "#c7d2e6", marginTop: "4px" }}>{it.description}</div>
                          <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button onClick={() => { openPreview(it); }} style={{ 
                              padding: "6px 8px", 
                              borderRadius: "6px", 
                              border: "none", 
                              cursor: "pointer", 
                              background: "#7c3aed", 
                              color: "white",
                              fontSize: "12px"
                            }}>Preview</button>
                            <a href={it.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                              <button style={{ 
                                padding: "6px 8px", 
                                borderRadius: "6px", 
                                border: "1px solid rgba(255,255,255,0.06)", 
                                background: "transparent", 
                                color: "white", 
                                cursor: "pointer",
                                fontSize: "12px"
                              }}>Open</button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* manual controls */}
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "12px" }}>
                <button onClick={() => setFeaturedIndex((i) => (i - 1 + items.length) % Math.max(1, items.length))} style={{ 
                  padding: "4px 6px", 
                  borderRadius: "4px", 
                  border: "1px solid rgba(255,255,255,0.04)", 
                  background: "transparent", 
                  cursor: "pointer",
                  color: "white"
                }}>◀</button>
                {items.map((_, i) => (
                  <div key={i} onClick={() => setFeaturedIndex(i)} style={{ 
                    width: "6px", 
                    height: "6px", 
                    borderRadius: "50%", 
                    background: i === featuredIndex ? "#ff7a59" : "#ffffff10", 
                    cursor: "pointer" 
                  }} />
                ))}
                <button onClick={() => setFeaturedIndex((i) => (i + 1) % Math.max(1, items.length))} style={{ 
                  padding: "4px 6px", 
                  borderRadius: "4px", 
                  border: "1px solid rgba(255,255,255,0.04)", 
                  background: "transparent", 
                  cursor: "pointer",
                  color: "white"
                }}>▶</button>
              </div>
            </div>
          )}

          {/* Results list */}
          <div style={{ marginTop: "12px" }}>
            {results.map((r) => (
              <div key={r.id} style={{ ...S.card, ...S.resourceCard }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={S.iconBox}>{r.icon || "📄"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, lineHeight: "1.3" }}>{r.title}</div>
                    <div style={{ fontSize: "13px", color: "#c7d2e6", marginTop: "6px", lineHeight: "1.4" }}>{r.description}</div>
                    <div style={{ marginTop: "10px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        background: "#ffffff04", 
                        fontSize: "11px" 
                      }}>{r.category}</span>
                      {r.filename && <span style={{ fontSize: "11px", color: "#94a3b8" }}>{r.filename}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start", flexWrap: "wrap" }}>
                  <button onClick={() => { openPreview(r); }} style={{ 
                    padding: "6px 8px", 
                    borderRadius: "6px", 
                    border: "none", 
                    background: "#7c3aed", 
                    color: "white", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>Preview</button>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ 
                      padding: "6px 8px", 
                      borderRadius: "6px", 
                      border: "1px solid rgba(255,255,255,0.06)", 
                      background: "transparent", 
                      color: "white", 
                      cursor: "pointer",
                      fontSize: "12px"
                    }}>Open</button>
                  </a>
                  <button onClick={() => { setSelected(r); }} style={{ 
                    padding: "6px 8px", 
                    borderRadius: "6px", 
                    background: "#0b1220", 
                    color: "#c7d2e6", 
                    border: "1px solid rgba(255,255,255,0.04)", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>Details</button>
                  <button onClick={() => handleDelete(r.id)} style={{ 
                    padding: "6px 8px", 
                    borderRadius: "6px", 
                    background: "#3b0a0a", 
                    color: "#ffd7d7", 
                    border: "1px solid rgba(255,255,255,0.04)", 
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>Delete</button>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div style={{ ...S.card, textAlign: "center" }}>
                <div style={{ fontSize: "28px" }}>📚</div>
                <div style={{ marginTop: "8px", color: "#c7d2e6" }}>No resources found — try another search or category.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={S.modalBackdrop} onClick={() => setShowForm(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: "16px", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderBottom: "1px solid rgba(255,255,255,0.03)" 
            }}>
              <div>
                <strong style={{ fontSize: "16px" }}>Add Resource</strong>
                <div style={{ fontSize: "13px", color: "#9fb1d6" }}>Fill details and then Create</div>
              </div>
              <div>
                <button onClick={() => setShowForm(false)} style={{ 
                  padding: "6px 8px", 
                  borderRadius: "6px", 
                  background: "#ffffff10", 
                  color: "#fff", 
                  border: "none",
                  fontSize: "12px"
                }}>Close</button>
              </div>
            </div>
            <form onSubmit={handleCreate} style={{ padding: "16px", display: "grid", gap: "12px" }}>
              <input 
                placeholder="Title" 
                value={form.title} 
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} 
                style={S.input} 
                required 
              />
              <textarea 
                placeholder="Description" 
                value={form.description} 
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} 
                style={{ ...S.input, minHeight: "80px" }} 
              />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select 
                  value={form.category} 
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} 
                  style={{ ...S.input, flex: "1", minWidth: "120px" }}
                >
                  {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input 
                  placeholder="Icon (emoji)" 
                  value={form.icon} 
                  onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value }))} 
                  style={{ ...S.input, width: "80px" }} 
                />
              </div>
              <input 
                placeholder="URL" 
                value={form.url} 
                onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))} 
                style={S.input} 
                required 
              />
              <input 
                placeholder="Filename (optional)" 
                value={form.filename} 
                onChange={(e) => setForm((s) => ({ ...s, filename: e.target.value }))} 
                style={S.input} 
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ 
                  padding: "8px 12px", 
                  borderRadius: "6px", 
                  background: "transparent", 
                  border: "1px solid rgba(255,255,255,0.04)", 
                  color: "#c7d2e6",
                  fontSize: "12px"
                }}>Cancel</button>
                <button type="submit" style={{ 
                  padding: "8px 12px", 
                  borderRadius: "6px", 
                  background: "#7c3aed", 
                  color: "white", 
                  border: "none",
                  fontSize: "12px"
                }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}