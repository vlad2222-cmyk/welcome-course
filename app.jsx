/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

const STORAGE_KEY = "dragonWizard.v1";

const COLORS = [
  { id: "violet", hex: "#6366f1", theme: "#5b57e8" },
  { id: "green", hex: "#22c55e", theme: "#1faa55" },
  { id: "orange", hex: "#f59e0b", theme: "#ef8c0c" },
  { id: "red", hex: "#ef4444", theme: "#e23b3b" },
  { id: "pink", hex: "#ec4899", theme: "#e23b8a" },
  { id: "blue", hex: "#0ea5e9", theme: "#0c9bdc" },
];
const DEFAULT_PRIMARY = "#5b57e8";
const themeFor = (id) => (COLORS.find((c) => c.id === id) || {}).theme || DEFAULT_PRIMARY;

/* ---- color helpers (no color-mix, works on old Safari) ---- */
function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(hex, other, amt) {
  const a = hexToRgb(hex);
  const r = Math.round(a[0] * amt + other[0] * (1 - amt));
  const g = Math.round(a[1] * amt + other[1] * (1 - amt));
  const b = Math.round(a[2] * amt + other[2] * (1 - amt));
  return "rgb(" + r + ", " + g + ", " + b + ")";
}
function rgba(hex, al) {
  const a = hexToRgb(hex);
  return "rgba(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + al + ")";
}
const WHITE = [255, 255, 255], BLACK = [0, 0, 0], PAGE_BASE = [243, 244, 250];

function applyTheme(primary) {
  const s = document.documentElement.style;
  s.setProperty("--primary", primary);
  s.setProperty("--primary-dark", mix(primary, BLACK, 0.82));
  s.setProperty("--primary-soft", mix(primary, WHITE, 0.15));
  s.setProperty("--primary-softer", mix(primary, WHITE, 0.08));
  s.setProperty("--primary-glow", rgba(primary, 0.6));
  s.setProperty("--primary-locked", mix(primary, WHITE, 0.32));
  s.setProperty("--primary-ring", rgba(primary, 0.14));
  s.setProperty("--primary-ring-strong", rgba(primary, 0.35));
  s.setProperty("--page", mix(primary, PAGE_BASE, 0.09));
  s.setProperty("--page-hi", mix(primary, WHITE, 0.05));
  // explicit fallback so the base layer tints even on very old browsers
  document.body.style.backgroundColor = mix(primary, PAGE_BASE, 0.09);
}

const VARIANTS = {
  home: {
    title: "Alege varianta de homepage",
    v1: { label: "Varianta 1", img: "assets/v1-home.png" },
    v2: { label: "Varianta 2", img: "assets/v2-home.png" },
  },
  search: {
    title: "Alege varianta de cautare",
    v1: { label: "Varianta 1", img: "assets/v1-search.png" },
    v2: { label: "Varianta 2", img: "assets/v2-search.png" },
  },
  details: {
    title: "Alege varianta de detalii/catalog",
    v1: { label: "Varianta 1", img: "assets/v1-details.png" },
    v2: { label: "Varianta 2", img: "assets/v2-details.png" },
  },
};

const DEFAULT = {
  step: 0,
  profil: { nume: "", varsta: "", pasiuni: "", culoare: "" },
  nevoia: { nume: "", caracteristica: "", obiectiv: "", obstacol: "" },
  choices: { home: "", search: "", details: "" },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...parsed,
      profil: { ...DEFAULT.profil, ...(parsed.profil || {}) },
      nevoia: { ...DEFAULT.nevoia, ...(parsed.nevoia || {}) },
      choices: { ...DEFAULT.choices, ...(parsed.choices || {}) },
    };
  } catch (e) {
    return DEFAULT;
  }
}

/* ---------- small icons ---------- */
const IconCheck = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconWarn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7.5v6M12 16.4h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/* ---------- Header ---------- */
const STEP_META = [
  { sub: "User Persona", pas: 1 },
  { sub: "Problem Statement", pas: 2 },
  { sub: "Ideație", pas: 3 },
  { sub: "Ideație", pas: 3 },
  { sub: "Ideație", pas: 3 },
  { sub: "Rezumat", pas: 4 },
];

function Header({ step }) {
  const meta = STEP_META[step];
  return (
    <header className="app-header">
      <div className="brand">
        <img className="brand-logo" src="assets/gameloft-logo.png" alt="Gameloft" />
        <div>
          <div className="brand-title">Curs de Product Design</div>
          <div className="brand-sub">{meta.sub}</div>
        </div>
      </div>
      <div className="step-pill">Pasul {meta.pas} din 4</div>
    </header>
  );
}

/* ---------- Stepper ---------- */
const STEPPER = ["Profil", "Nevoia", "Idei", "Rezumat"];
function activePhase(step) {
  if (step <= 1) return step;
  if (step <= 4) return 2;
  return 3;
}
function Stepper({ step }) {
  const phase = activePhase(step);
  return (
    <div className="stepper">
      {STEPPER.map((label, i) => (
        <React.Fragment key={label}>
          <div className={"stepper-node " + (i < phase ? "done" : i === phase ? "active" : "")}>
            <div className="node-circle">{i < phase ? <IconCheck /> : i + 1}</div>
            <div className="node-label">{label}</div>
          </div>
          {i < STEPPER.length - 1 && (
            <div className={"stepper-line " + (i < phase ? "filled" : "")}>
              <div className="fill" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Field error helper ---------- */
const ErrMsg = () => (
  <div className="field-error"><IconWarn /> Completează acest câmp</div>
);

/* ---------- Step 1: Profil ---------- */
function StepProfil({ data, set, showErr }) {
  const p = data.profil;
  const upd = (k, v) => set({ ...data, profil: { ...p, [k]: v } });
  const bad = (k) => showErr && !String(p[k]).trim();

  return (
    <div className="card">
      <span className="eyebrow">User Persona</span>
      <h2 className="card-title">Profilul Utilizatorului</h2>
      <p className="card-desc">Spune-ne câteva detalii ca să construim o persona împreună.</p>

      <div className="form-grid">
        <Field label="Nume" onClear={() => upd("nume", "")} canClear={!!p.nume}>
          <input className={"input" + (bad("nume") ? " invalid" : "")} placeholder="Ex: Maria Popescu"
            value={p.nume} onChange={(e) => upd("nume", e.target.value)} />
          {bad("nume") && <ErrMsg />}
        </Field>

        <Field label="Vârstă" onClear={() => upd("varsta", "")} canClear={!!p.varsta}>
          <input className={"input" + (bad("varsta") ? " invalid" : "")} placeholder="Ex: 28" inputMode="numeric"
            value={p.varsta} onChange={(e) => upd("varsta", e.target.value)} />
          {bad("varsta") && <ErrMsg />}
        </Field>

        <Field label="Pasiuni" onClear={() => upd("pasiuni", "")} canClear={!!p.pasiuni}>
          <input className={"input" + (bad("pasiuni") ? " invalid" : "")} placeholder="Ex: pictură, drumeții, muzică"
            value={p.pasiuni} onChange={(e) => upd("pasiuni", e.target.value)} />
          {bad("pasiuni") && <ErrMsg />}
        </Field>

        <Field label="Culoare preferată" onClear={() => upd("culoare", "")} canClear={!!p.culoare}>
          <div className={"color-field" + (bad("culoare") ? " invalid" : "")}>
            {COLORS.map((c) => (
              <button key={c.id} type="button"
                className={"swatch" + (p.culoare === c.id ? " selected" : "")}
                style={{ background: c.hex, color: c.hex }}
                aria-label={c.id}
                onClick={() => upd("culoare", c.id)} />
            ))}
          </div>
          {bad("culoare") && <ErrMsg />}
        </Field>
      </div>
    </div>
  );
}

function Field({ label, onClear, canClear, children }) {
  return (
    <div className="form-field">
      <div className="field-label-row">
        <span className="field-label">{label}</span>
        <button type="button" className="clear-btn" onClick={onClear} disabled={!canClear}>Sterge</button>
      </div>
      {children}
    </div>
  );
}

/* ---------- Step 2: Nevoia ---------- */
function StepNevoia({ data, set, showErr }) {
  const n = data.nevoia;
  const upd = (k, v) => set({ ...data, nevoia: { ...n, [k]: v } });
  const bad = (k) => showErr && !String(n[k]).trim();
  const cls = (k) => "input on-white" + (bad(k) ? " invalid" : "");

  return (
    <div className="card">
      <span className="eyebrow">Enunțarea nevoilor</span>
      <h2 className="card-title">Formulează nevoia utilizatorului</h2>
      <p className="card-desc">Completează spațiile pentru a contura nevoia utilizatorului.</p>

      <div className="statement">
        <div className="stmt-row">
          <div className="stmt-field name">
            <input className={cls("nume")} placeholder="Nume utilizator"
              value={n.nume} onChange={(e) => upd("nume", e.target.value)} />
          </div>
          <span className="stmt-connector">este un/o</span>
          <div className="stmt-field">
            <input className={cls("caracteristica")} placeholder="Ex: student, părinte, antreprenor"
              value={n.caracteristica} onChange={(e) => upd("caracteristica", e.target.value)} />
            <div className="stmt-hint">caracteristica utilizatorului</div>
          </div>
        </div>

        <div className="stmt-row">
          <span className="stmt-connector">care vrea să</span>
          <div className="stmt-field">
            <input className={cls("obiectiv")} placeholder="Ex: învețe o limbă nouă rapid"
              value={n.obiectiv} onChange={(e) => upd("obiectiv", e.target.value)} />
            <div className="stmt-hint">obiectivul / dorința</div>
          </div>
        </div>

        <div className="stmt-row">
          <span className="stmt-connector">dar nu poate pentru că</span>
          <div className="stmt-field">
            <input className={cls("obstacol")} placeholder="Ex: are foarte puțin timp liber"
              value={n.obstacol} onChange={(e) => upd("obstacol", e.target.value)} />
            <div className="stmt-hint">obstacolul / frustrarea</div>
          </div>
        </div>
      </div>

      <div className="example-box">
        Exemplu: „Maria este un student care vrea să învețe o limbă nouă rapid, dar nu poate pentru că are foarte puțin timp liber.”
      </div>
    </div>
  );
}

/* ---------- Steps 3-5: Variant comparison ---------- */
function StepVariant({ kind, data, set, showErr }) {
  const cfg = VARIANTS[kind];
  const chosen = data.choices[kind];
  const choose = (v) => set({ ...data, choices: { ...data.choices, [kind]: v } });
  const need = showErr && !chosen;

  return (
    <div className="card wide">
      <span className="eyebrow">Alegeri Design</span>
      <h2 className="card-title">{cfg.title}</h2>
      <p className="card-desc">Compară cele două variante și selecteaz-o pe cea preferată.</p>

      <div className="variant-toggle">
        <div className="toggle-cell">
          <button type="button"
            className={"toggle-btn" + (chosen === "v1" ? " selected" : need ? " need" : "")}
            onClick={() => choose("v1")}>Varianta 1</button>
        </div>
        <div className="toggle-cell">
          <button type="button"
            className={"toggle-btn" + (chosen === "v2" ? " selected" : need ? " need" : "")}
            onClick={() => choose("v2")}>Varianta 2</button>
        </div>
      </div>

      <div className="compare-panel">
        <VariantCol info={cfg.v1} selected={chosen === "v1"} onClick={() => choose("v1")} />
        <VariantCol info={cfg.v2} selected={chosen === "v2"} onClick={() => choose("v2")} />
      </div>

      {need && (
        <p className="select-error"><IconWarn /> Selectează o variantă pentru a continua</p>
      )}
    </div>
  );
}

function VariantCol({ info, selected, onClick }) {
  return (
    <div className={"variant-col" + (selected ? " selected" : "")}>
      <div className="variant-col-label">{info.label}</div>
      <div className="variant-phone" onClick={onClick}>
        <div className="variant-check"><IconCheck s={16} /></div>
        <img src={info.img} alt={info.label} />
      </div>
    </div>
  );
}

/* ---------- Step 6: Rezumat ---------- */
const colorName = (id) => ({
  violet: "Violet", green: "Verde", orange: "Portocaliu",
  red: "Roșu", pink: "Roz", blue: "Albastru",
}[id] || "—");
const colorHex = (id) => (COLORS.find((c) => c.id === id) || {}).hex || "transparent";
const variantName = (v) => (v === "v1" ? "Varianta 1" : v === "v2" ? "Varianta 2" : "—");

function StepRezumat({ data }) {
  const p = data.profil, n = data.nevoia, c = data.choices;
  const shots = [
    { kind: "home", cap: "Homepage" },
    { kind: "search", cap: "Căutare" },
    { kind: "details", cap: "Detalii" },
  ];
  return (
    <div className="card">
      <span className="eyebrow">Rezumat</span>
      <h2 className="card-title">Persona &amp; alegerile tale</h2>
      <p className="card-desc">Tot ce ai completat este salvat. Poți reveni oricând pentru ajustări.</p>

      <div className="persona-sentence">
        <b>{n.nume || p.nume || "Utilizatorul"}</b> este un {n.caracteristica || "…"} care vrea să {n.obiectiv || "…"}, dar nu poate pentru că {n.obstacol || "…"}.
      </div>

      <div className="summary-grid">
        <div className="summary-block">
          <h4>Profilul Utilizatorului</h4>
          <div className="summary-line"><span className="k">Nume</span><span className="v">{p.nume || "—"}</span></div>
          <div className="summary-line"><span className="k">Vârstă</span><span className="v">{p.varsta || "—"}</span></div>
          <div className="summary-line"><span className="k">Pasiuni</span><span className="v">{p.pasiuni || "—"}</span></div>
          <div className="summary-line"><span className="k">Culoare preferată</span><span className="v">{colorName(p.culoare)}<span className="dot" style={{ background: colorHex(p.culoare) }} /></span></div>
        </div>
        <div className="summary-block">
          <h4>Variante alese</h4>
          <div className="summary-line"><span className="k">Homepage</span><span className="v"><span className="choice-tag">{variantName(c.home)}</span></span></div>
          <div className="summary-line"><span className="k">Căutare</span><span className="v"><span className="choice-tag">{variantName(c.search)}</span></span></div>
          <div className="summary-line"><span className="k">Detalii / Catalog</span><span className="v"><span className="choice-tag">{variantName(c.details)}</span></span></div>
        </div>
      </div>

      <div className="summary-full">
        {shots.map((s) => {
          const v = c[s.kind];
          if (!v) return null;
          return (
            <div className="summary-shot" key={s.kind}>
              <div className="variant-phone">
                <img src={VARIANTS[s.kind][v].img} alt={s.cap} />
              </div>
              <div className="cap">{s.cap} · {variantName(v)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [data, setData] = useState(load);
  const [showErr, setShowErr] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // recolor the whole UI based on the chosen favourite colour
  useEffect(() => {
    applyTheme(themeFor(data.profil.culoare));
  }, [data.profil.culoare]);

  const step = data.step;
  const set = (d) => { setData(d); setShowErr(false); };
  const goStep = (s) => { setData((d) => ({ ...d, step: s })); setShowErr(false); if (topRef.current) topRef.current.scrollTo({ top: 0 }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // when entering step 2, prefill name from profil if empty
  useEffect(() => {
    if (step === 1 && !data.nevoia.nume && data.profil.nume) {
      setData((d) => ({ ...d, nevoia: { ...d.nevoia, nume: d.profil.nume } }));
    }
  }, [step]);

  const isValid = () => {
    if (step === 0) return ["nume", "varsta", "pasiuni", "culoare"].every((k) => String(data.profil[k]).trim());
    if (step === 1) return ["nume", "caracteristica", "obiectiv", "obstacol"].every((k) => String(data.nevoia[k]).trim());
    if (step === 2) return !!data.choices.home;
    if (step === 3) return !!data.choices.search;
    if (step === 4) return !!data.choices.details;
    return true;
  };

  const next = () => {
    if (!isValid()) { setShowErr(true); return; }
    if (step < 5) goStep(step + 1);
  };
  const back = () => { if (step > 0) goStep(step - 1); };

  const valid = isValid();
  const lastStep = step === 5;

  return (
    <div className="page" ref={topRef}>
      <div className="wizard">
        <Header step={step} />
        <Stepper step={step} />

        {step === 0 && <StepProfil data={data} set={set} showErr={showErr} />}
        {step === 1 && <StepNevoia data={data} set={set} showErr={showErr} />}
        {step === 2 && <StepVariant kind="home" data={data} set={set} showErr={showErr} />}
        {step === 3 && <StepVariant kind="search" data={data} set={set} showErr={showErr} />}
        {step === 4 && <StepVariant kind="details" data={data} set={set} showErr={showErr} />}
        {step === 5 && <StepRezumat data={data} />}

        <div className="footer">
          {step === 0 ? (
            <span className="footer-hint">Poți reveni oricând la acest pas.</span>
          ) : (
            <button className="btn btn-ghost" onClick={back}>Înapoi</button>
          )}
          {!lastStep && (
            <button className={"btn btn-primary" + (valid ? "" : " locked")} onClick={next}>Înainte</button>
          )}
          {lastStep && (
            <button className="btn btn-primary" onClick={() => { localStorage.removeItem(STORAGE_KEY); setData({ ...DEFAULT }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Începe din nou</button>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
