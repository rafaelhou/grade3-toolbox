(() => {
'use strict';
const KEY = 'dietlog.v1';
const KEY_UI = 'dietlog.ui';
// 體重 73 kg、維持體重：蛋白質 2.0 g/kg、脂肪 0.85 g/kg，其餘給碳水
const DEF = { kcal: 2400, p: 146, c: 315, f: 62, goalWeight: null };
// 第一版的預設值（82.1 kg 時算的）。手機上存的還是這組、代表沒改過，就換成新的預設值
const OLD_DEF = { kcal: 2400, p: 165, c: 275, f: 70 };
const MEALS = [{ k: 'b', name: '早餐' }, { k: 'l', name: '午餐' }, { k: 'd', name: '晚餐' }, { k: 's', name: '點心' }];
const WORKOUTS = ['休息', '胸', '背', '腿', '肩', '手臂', '核心', '有氧', '全身'];
// 常見食物（份量與數值為概估，加入後可以點開修改）
const FOODS = [
  { name: '雞胸肉', qty: '150 g', kcal: 170, p: 35, c: 0, f: 3 },
  { name: '鮭魚', qty: '150 g', kcal: 310, p: 30, c: 0, f: 20 },
  { name: '白飯', qty: '200 g', kcal: 260, p: 5, c: 57, f: 1 },
  { name: '地瓜', qty: '200 g', kcal: 172, p: 3, c: 40, f: 0 },
  { name: '水煮蛋', qty: '1 顆', kcal: 75, p: 6, c: 1, f: 5 },
  { name: '無糖希臘優格', qty: '150 g', kcal: 100, p: 15, c: 6, f: 1 },
  { name: '鮮奶', qty: '240 ml', kcal: 150, p: 8, c: 12, f: 8 },
  { name: '乳清蛋白', qty: '1 匙 30 g', kcal: 120, p: 24, c: 3, f: 2 },
  { name: '香蕉', qty: '1 根', kcal: 105, p: 1, c: 27, f: 0 },
  { name: '燙青菜', qty: '150 g', kcal: 35, p: 3, c: 6, f: 1 },
  { name: '橄欖油', qty: '1 小匙', kcal: 40, p: 0, c: 0, f: 5 },
  { name: '燕麥', qty: '40 g', kcal: 150, p: 5, c: 27, f: 3 },
  { name: '無糖豆漿', qty: '300 ml', kcal: 100, p: 10, c: 4, f: 5 },
  { name: '傳統豆腐', qty: '150 g', kcal: 130, p: 13, c: 4, f: 7 },
];

const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const todayStr = () => ymd(new Date());
const WD = ['日', '一', '二', '三', '四', '五', '六'];
const dlabel = s => { const d = parseD(s); return `${d.getMonth() + 1}月${d.getDate()}日 週${WD[d.getDay()]}`; };
const shortD = s => { const d = parseD(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
const n0 = v => Math.round(v || 0).toLocaleString('en-US');
const n1 = v => (Math.round(v * 10) / 10).toString();
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const num = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : null; };

const state = { profile: { ...DEF }, days: {} };
const ui = { tab: 'today', date: todayStr(), range: 7, meal: 'b', installHidden: false, lastBackup: null };
let addedN = 0, quick = [], editId = null, lastDeleted = null, deferredInstall = null;

/* ---------- 儲存（只存在這台裝置的 localStorage） ---------- */
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (raw) { state.profile = { ...DEF, ...(raw.profile || {}) }; state.days = raw.days || {}; }
  const u = JSON.parse(localStorage.getItem(KEY_UI) || 'null');
  if (u) { ui.installHidden = !!u.installHidden; ui.lastBackup = u.lastBackup || null; }
} catch (e) {}
if (['kcal', 'p', 'c', 'f'].every(k => state.profile[k] === OLD_DEF[k])) ['kcal', 'p', 'c', 'f'].forEach(k => { state.profile[k] = DEF[k]; });
let saveFailed = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); saveFailed = false; }
  catch (e) { if (!saveFailed) toast('存檔失敗，手機空間可能不足'); saveFailed = true; }
}
const saveUI = () => { try { localStorage.setItem(KEY_UI, JSON.stringify({ installHidden: ui.installHidden, lastBackup: ui.lastBackup })); } catch (e) {} };
// 請瀏覽器不要在空間吃緊時自動清掉資料
navigator.storage?.persist?.().catch(() => {});
const ensureDay = d => (state.days[d] ||= { items: [] });

/* ---------- 計算 ---------- */
const sum = items => items.reduce((t, i) => ({ kcal: t.kcal + (i.kcal || 0), p: t.p + (i.p || 0), c: t.c + (i.c || 0), f: t.f + (i.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
const pct = (v, t) => t > 0 ? Math.max(0, Math.min(100, v / t * 100)) : 0;
const lastWeight = () => { const ds = Object.keys(state.days).filter(d => state.days[d].weight).sort(); return ds.length ? state.days[ds[ds.length - 1]].weight : null; };

/* ---------- 安裝提示 ---------- */
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (ui.tab === 'today') render(); });
const SHARE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M6 11v9h12v-9"/></svg>';
function installHTML() {
  if (standalone || ui.installHidden) return '';
  let body;
  if (deferredInstall) body = `<b>安裝成 App</b><br>裝到主畫面，之後點圖示就能直接打開，沒有網路也能用。<br><button class="btn" data-act="install">安裝</button>`;
  else if (isIOS) body = `<b>加到主畫面當 App 用</b><br>在 Safari 點下方的分享按鈕 ${SHARE_ICON}，往下滑選「加入主畫面」。之後從主畫面打開，就是全螢幕、離線也能用。`;
  else return '';
  return `<div class="install"><p>${body}</p><button class="x" data-act="hideinstall" aria-label="不要再顯示">✕</button></div>`;
}

/* ---------- 畫面 ---------- */
const topbar = () => `<div class="topbar"><h1>飲食健康日誌</h1></div>`;
const meter = (v, t, over) => `<div class="meter${over ? ' over' : ''}"><span style="width:${pct(v, t)}%"></span></div>`;

function viewToday() {
  const day = state.days[ui.date] || { items: [] };
  const items = day.items || [];
  const t = sum(items), P = state.profile, left = P.kcal - t.kcal;
  const isToday = ui.date === todayStr();
  const macro = (name, color, v, tg) => `<div class="macro-row"><span class="lab"><i style="background:${color}"></i>${name}</span>
    <span class="val"><b>${n0(v)}</b>/ ${n0(tg)} g</span><div class="meter"><span style="width:${pct(v, tg)}%;background:${color}"></span></div></div>`;
  const meals = MEALS.map(m => {
    const its = items.filter(i => i.meal === m.k);
    return `<section class="meal"><header><h3>${m.name}</h3><span class="sub">${its.length ? n0(sum(its).kcal) + ' 大卡' : ''}</span></header>
      ${its.map(i => `<button class="item" data-act="edit" data-id="${i.id}"><span class="i-main"><span class="i-name">${esc(i.name)}</span>${i.qty ? `<span class="i-qty">${esc(i.qty)}</span>` : ''}</span>
        <span class="i-side"><b>${n0(i.kcal)}</b><small>蛋 ${n0(i.p)} · 碳 ${n0(i.c)} · 脂 ${n0(i.f)}</small></span></button>`).join('')}
      <button class="add" data-act="add" data-meal="${m.k}">＋ 新增${m.name}</button></section>`;
  }).join('');
  const wo = day.workout || [];
  const wph = lastWeight();
  return `${topbar()}${installHTML()}
  <div class="datebar">
    <button class="icon-btn" data-act="day" data-n="-1" aria-label="前一天">‹</button>
    <label class="datelabel"><span>${isToday ? '今天 · ' : ''}${dlabel(ui.date)}</span>${isToday ? '' : '<button class="chip-today" data-act="today">回到今天</button>'}<input type="date" id="datepick" value="${ui.date}" max="${todayStr()}" aria-label="選擇日期"></label>
    <button class="icon-btn" data-act="day" data-n="1" aria-label="後一天" ${ui.date >= todayStr() ? 'disabled' : ''}>›</button>
  </div>
  <div class="card">
    <h2>${isToday ? '今天實際飲食' : '當天飲食'}<small>目標可在「設定」修改</small></h2>
    <div class="hero"><span class="big">${n0(t.kcal)}</span><span class="of">/ ${n0(P.kcal)} 大卡</span></div>
    ${meter(t.kcal, P.kcal, left < 0)}
    <p class="hint${left < 0 ? ' over' : ''}">${left >= 0 ? `還可以吃 <b>${n0(left)}</b> 大卡` : `超過目標 <b>${n0(-left)}</b> 大卡`}</p>
    <div class="macros">
      ${macro('蛋白質', 'var(--protein)', t.p, P.p)}
      ${macro('碳水', 'var(--carb)', t.c, P.c)}
      ${macro('脂肪', 'var(--fat)', t.f, P.f)}
    </div>
  </div>
  <div class="card">
    <h2>吃了什麼</h2>
    ${items.length === 0 ? `<div class="nudge">還沒有紀錄。按「＋ 新增」，點常吃的食物就記好一份，或自己輸入。</div>` : ''}
    ${meals}
  </div>
  <div class="card">
    <h2>身體狀況<small>輸入後自動儲存</small></h2>
    <div class="hgrid">
      <label class="field"><span>體重</span><span class="input-unit"><input class="input" id="h-weight" data-field="weight" inputmode="decimal" placeholder="${wph ? n1(wph) : '0.0'}" value="${day.weight ?? ''}"><em>kg</em></span></label>
      <label class="field"><span>體脂率</span><span class="input-unit"><input class="input" id="h-bf" data-field="bodyFat" inputmode="decimal" placeholder="0.0" value="${day.bodyFat ?? ''}"><em>%</em></span></label>
      <label class="field"><span>飲水</span><span class="input-unit"><input class="input" id="h-water" data-field="water" inputmode="numeric" placeholder="0" value="${day.water ?? ''}"><em>ml</em></span></label>
      <label class="field"><span>睡眠</span><span class="input-unit"><input class="input" id="h-sleep" data-field="sleep" inputmode="decimal" placeholder="0" value="${day.sleep ?? ''}"><em>小時</em></span></label>
      <div class="field wide"><span>快速加水</span><div class="qrow"><button class="qbtn" data-act="water" data-n="250">+250 ml</button><button class="qbtn" data-act="water" data-n="500">+500 ml</button><button class="qbtn" data-act="water" data-n="-250">−250 ml</button></div></div>
      <label class="field wide"><span>步數</span><span class="input-unit"><input class="input" id="h-steps" data-field="steps" inputmode="numeric" placeholder="0" value="${day.steps ?? ''}"><em>步</em></span></label>
      <div class="field wide"><span>今天練什麼</span><div class="qrow" id="wo-row">${WORKOUTS.map(w => `<button class="chip${wo.includes(w) ? ' on' : ''}" data-act="wo" data-v="${w}" aria-pressed="${wo.includes(w)}">${w}</button>`).join('')}</div></div>
      <label class="field wide"><span>備註</span><textarea class="input" id="h-note" data-field="note" placeholder="精神、肌肉痠痛、手錶消耗…">${esc(day.note || '')}</textarea></label>
    </div>
  </div>`;
}

/* ----- 趨勢 ----- */
function rangeRows(n) {
  const end = todayStr(), rows = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(end, -i), day = state.days[d], items = day?.items || [];
    rows.push({ d, has: items.length > 0, ...sum(items), weight: day?.weight ?? null, day });
  }
  return rows;
}
const rt = (x, y, w, h, r) => { r = Math.min(r, h, w / 2); return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; };
const kfmt = v => v >= 1000 ? (v / 1000) + 'K' : String(v);
function xlabels(rows, xc, y) {
  const n = rows.length;
  return rows.map((r, i) => ((n <= 7) || ((n - 1 - i) % 7 === 0)) ? `<text x="${xc(i)}" y="${y}" text-anchor="middle">${shortD(r.d)}</text>` : '').join('');
}
function calChart(rows) {
  const W = 340, H = 176, l = 34, r = 8, t = 14, b = 26, pw = W - l - r, ph = H - t - b, n = rows.length;
  const target = state.profile.kcal;
  const mx = Math.max(target * 1.1, ...rows.map(x => x.kcal));
  const step = mx > 5000 ? 2000 : 1000, top = Math.ceil(mx / step) * step;
  const y = v => t + ph - (v / top) * ph, band = pw / n, bw = Math.min(24, band * 0.62), xc = i => l + band * i + band / 2;
  let g = '';
  for (let v = 0; v <= top; v += step) g += `<line class="${v === 0 ? 'ax' : 'gl'}" x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}"/><text x="${l - 6}" y="${y(v) + 3}" text-anchor="end">${kfmt(v)}</text>`;
  const bars = rows.map((x, i) => x.has ? `<path d="${rt(xc(i) - bw / 2, y(x.kcal), bw, y(0) - y(x.kcal), 4)}" fill="var(--accent)"/>` : '').join('');
  const hits = rows.map((x, i) => `<rect class="band" x="${l + band * i}" y="${t}" width="${band}" height="${ph}"/><rect class="hit" data-ro="cal" data-i="${i}" x="${l + band * i}" y="${t}" width="${band}" height="${ph + 20}"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="近 ${n} 天每日熱量，目標 ${n0(target)} 大卡">${g}${hits}${bars}
    <line class="tgt" x1="${l}" x2="${W - r}" y1="${y(target)}" y2="${y(target)}"/><text class="tlab" x="${W - r}" y="${y(target) - 5}" text-anchor="end">目標 ${n0(target)}</text>
    ${xlabels(rows, xc, H - 8)}</svg>`;
}
function wtChart(rows) {
  const pts = rows.map((x, i) => ({ i, v: x.weight, d: x.d })).filter(p => p.v);
  if (!pts.length) return null;
  const W = 340, H = 176, l = 38, r = 22, t = 16, b = 26, pw = W - l - r, ph = H - t - b, n = rows.length;
  const gw = state.profile.goalWeight, vals = pts.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (gw && Math.abs(gw - lo) <= 6 && Math.abs(gw - hi) <= 6) { lo = Math.min(lo, gw); hi = Math.max(hi, gw); }
  if (hi - lo < 2) { const m = (hi + lo) / 2; lo = m - 1; hi = m + 1; } else { lo -= 0.4; hi += 0.4; }
  const y = v => t + ph - ((v - lo) / (hi - lo)) * ph, band = pw / n, xc = i => l + band * i + band / 2;
  let g = '';
  [lo, (lo + hi) / 2, hi].forEach((v, k) => g += `<line class="${k === 0 ? 'ax' : 'gl'}" x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}"/><text x="${l - 6}" y="${y(v) + 3}" text-anchor="end">${n1(v)}</text>`);
  const line = pts.map((p, k) => `${k ? 'L' : 'M'}${xc(p.i)},${y(p.v)}`).join('');
  const area = pts.length > 1 ? `<path d="${line}L${xc(pts[pts.length - 1].i)},${y(lo)}L${xc(pts[0].i)},${y(lo)}Z" fill="var(--carb)" opacity=".1"/>` : '';
  const showAll = pts.length <= 10, end = pts[pts.length - 1];
  const dots = pts.map(p => (showAll || p === end) ? `<circle cx="${xc(p.i)}" cy="${y(p.v)}" r="4" fill="var(--carb)" stroke="var(--surface)" stroke-width="2"/>` : '').join('');
  const hits = pts.map(p => `<circle class="hit" data-ro="wt" data-i="${p.i}" cx="${xc(p.i)}" cy="${y(p.v)}" r="14"/>`).join('');
  const goal = gw && gw >= lo && gw <= hi ? `<line class="tgt" x1="${l}" x2="${W - r}" y1="${y(gw)}" y2="${y(gw)}"/><text class="tlab" x="${l + 4}" y="${y(gw) - 5}">目標 ${n1(gw)}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="近 ${n} 天體重，最新 ${n1(end.v)} 公斤">${g}${goal}${area}
    <path d="${line}" fill="none" stroke="var(--carb)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}
    <text class="tlab" x="${xc(end.i)}" y="${y(end.v) - 9}" text-anchor="middle" style="font-size:11px;font-weight:700">${n1(end.v)}</text>${hits}${xlabels(rows, xc, H - 8)}</svg>`;
}
function roText(kind, i, rows) {
  const r = rows[i]; if (!r) return '';
  const head = `<b>${shortD(r.d)} 週${WD[parseD(r.d).getDay()]}</b> · `;
  if (kind === 'wt') return head + (r.weight ? `<b>${n1(r.weight)}</b> kg${r.day?.bodyFat ? ` · 體脂 ${n1(r.day.bodyFat)}%` : ''}` : '沒有體重');
  return head + (r.has ? `<b>${n0(r.kcal)}</b> 大卡 · 蛋白質 ${n0(r.p)} g · 碳水 ${n0(r.c)} g · 脂肪 ${n0(r.f)} g` : '沒有飲食紀錄');
}
function viewTrends() {
  const n = ui.range, rows = rangeRows(n), P = state.profile;
  const logged = rows.filter(r => r.has);
  const avg = k => logged.length ? logged.reduce((s, r) => s + r[k], 0) / logged.length : 0;
  const hit = logged.filter(r => r.p >= P.p * 0.9).length;
  const ws = rows.filter(r => r.weight);
  const dW = ws.length > 1 ? ws[ws.length - 1].weight - ws[0].weight : null;
  const wchart = wtChart(rows);
  const tbl = `<details class="tbl"><summary>顯示數據表</summary><div class="tbl-wrap"><table><thead><tr><th>日期</th><th>大卡</th><th>蛋白</th><th>碳水</th><th>脂肪</th><th>體重</th></tr></thead><tbody>
    ${rows.slice().reverse().map(r => `<tr><td>${shortD(r.d)}</td><td>${r.has ? n0(r.kcal) : '–'}</td><td>${r.has ? n0(r.p) : '–'}</td><td>${r.has ? n0(r.c) : '–'}</td><td>${r.has ? n0(r.f) : '–'}</td><td>${r.weight ? n1(r.weight) : '–'}</td></tr>`).join('')}</tbody></table></div></details>`;
  return `${topbar()}
  <div class="seg" role="group" aria-label="時間範圍"><button data-act="range" data-n="7" class="${n === 7 ? 'on' : ''}">近 7 天</button><button data-act="range" data-n="30" class="${n === 30 ? 'on' : ''}">近 30 天</button></div>
  <div class="tiles">
    <div class="tile"><div class="k">平均熱量</div><div class="v">${logged.length ? n0(avg('kcal')) : '–'}<small>大卡</small></div><div class="s">目標 ${n0(P.kcal)}</div></div>
    <div class="tile"><div class="k">平均蛋白質</div><div class="v">${logged.length ? n0(avg('p')) : '–'}<small>g</small></div><div class="s">目標 ${n0(P.p)}</div></div>
    <div class="tile"><div class="k">蛋白質達標</div><div class="v">${hit}<small>/ ${logged.length} 天</small></div><div class="s">達目標 90% 以上</div></div>
    <div class="tile"><div class="k">體重變化</div><div class="v">${dW === null ? '–' : (dW > 0 ? '+' : dW < 0 ? '−' : '') + n1(Math.abs(dW))}<small>kg</small></div><div class="s">${ws.length > 1 ? shortD(ws[0].d) + ' → ' + shortD(ws[ws.length - 1].d) : '需要至少 2 天體重'}</div></div>
  </div>
  <div class="card"><h2>每日熱量<small>大卡</small></h2>
    ${logged.length ? `<div class="readout" id="ro-cal">${roText('cal', rows.indexOf(logged[logged.length - 1]), rows)}</div>${calChart(rows)}${tbl}` : `<div class="empty">還沒有飲食紀錄。記錄第一餐後，這裡會畫出每天的熱量。</div>`}
  </div>
  <div class="card"><h2>體重<small>公斤</small></h2>
    ${wchart ? `<div class="readout" id="ro-wt">${roText('wt', rows.indexOf(ws[ws.length - 1]), rows)}</div>${wchart}${ws.length < 2 ? '<p class="note">再記一天體重，就會畫出變化線。</p>' : ''}` : `<div class="empty">還沒有體重紀錄。在「今天」的身體狀況輸入體重。</div>`}
  </div>`;
}

/* ----- 設定 ----- */
function viewSettings() {
  const P = state.profile, implied = P.p * 4 + P.c * 4 + P.f * 9, w = lastWeight();
  const nDays = Object.values(state.days).filter(d => d.items?.length || d.weight).length;
  const row = (k, label, unit, v, extra) => `<div class="srow"><label for="pf-${k}">${label}${extra ? `<small>${extra}</small>` : ''}</label><span class="input-unit"><input class="input" id="pf-${k}" data-pf="${k}" inputmode="decimal" value="${v ?? ''}" placeholder="—"><em>${unit}</em></span></div>`;
  const since = ui.lastBackup ? Math.floor((Date.now() - ui.lastBackup) / 864e5) : null;
  return `${topbar()}
  <div class="card"><h2>每日目標</h2>
    ${row('kcal', '熱量', '大卡', P.kcal)}
    ${row('p', '蛋白質', 'g', P.p, w ? `最近體重 ${n1(w)} kg，約 ${n1(P.p / w)} g/kg` : '')}
    ${row('c', '碳水', 'g', P.c)}
    ${row('f', '脂肪', 'g', P.f)}
    ${row('goalWeight', '目標體重', 'kg', P.goalWeight, '選填，會畫在體重圖上')}
    <p class="note">三大營養素換算約 <b>${n0(implied)}</b> 大卡（蛋白質、碳水 4 大卡/g，脂肪 9 大卡/g）。</p>
    ${w ? `<div class="btn-row"><button class="btn ghost" data-act="setp" data-k="2.0">蛋白質設為體重 × 2.0 g</button><button class="btn ghost" data-act="setp" data-k="1.6">× 1.6 g</button></div>` : ''}
  </div>
  <div class="card"><h2>備份<small>${nDays} 天的紀錄</small></h2>
    <p class="note" style="margin-top:0">資料只存在這支手機裡，不會上傳。換手機或刪掉 App 前，先匯出備份檔，到新手機再匯入。${since === null ? '<br><b>還沒有備份過。</b>' : `<br>上次備份是 ${since === 0 ? '今天' : since + ' 天前'}。`}</p>
    <div class="btn-row">
      <button class="btn" data-act="backup">匯出備份</button>
      <button class="btn ghost" data-act="import">匯入備份</button>
      <button class="btn ghost" data-act="csv">匯出食物明細 CSV</button>
      <input type="file" id="import-file" accept=".json,application/json" hidden>
    </div>
    <p class="note">匯入時，備份裡有的日期會蓋掉手機上同一天的資料，其他日期保留。</p>
  </div>
  <p class="note" style="text-align:center">熱量與營養素都是估算，只供參考，不是醫療建議。</p>`;
}

/* ---------- render ---------- */
function render() {
  $('#app').innerHTML = ui.tab === 'today' ? viewToday() : ui.tab === 'trends' ? viewTrends() : viewSettings();
  document.querySelectorAll('#tabs .tab').forEach(b => { const on = b.dataset.t === ui.tab; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
}

/* ---------- toast ---------- */
let toastT;
function toast(msg, action) {
  const el = $('#toast'); el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button data-act="${action.act}">${action.label}</button>` : ''}`;
  el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, action ? 6000 : 2200);
}

/* ---------- 新增 / 編輯面板 ---------- */
const mform = it => `<div class="mform">
  <label class="field"><span>名稱</span><input class="input" id="m-name" value="${esc(it?.name || '')}" placeholder="例：雞腿便當"></label>
  <label class="field"><span>份量</span><input class="input" id="m-qty" value="${esc(it?.qty || '')}" placeholder="1 個"></label>
  <label class="field"><span>大卡</span><input class="input" id="m-kcal" inputmode="decimal" value="${it?.kcal ?? ''}" placeholder="自動"></label>
  <label class="field"><span>蛋白質 g</span><input class="input" id="m-p" inputmode="decimal" value="${it?.p ?? ''}" placeholder="0"></label>
  <label class="field"><span>碳水 g</span><input class="input" id="m-c" inputmode="decimal" value="${it?.c ?? ''}" placeholder="0"></label>
  <label class="field"><span>脂肪 g</span><input class="input" id="m-f" inputmode="decimal" value="${it?.f ?? ''}" placeholder="0"></label></div>`;
function readForm() {
  const name = $('#m-name').value.trim(), p = num($('#m-p').value) || 0, c = num($('#m-c').value) || 0, f = num($('#m-f').value) || 0;
  let kcal = num($('#m-kcal').value); if (kcal === null) kcal = p * 4 + c * 4 + f * 9;
  if (!name) { $('#m-name').focus(); toast('請先輸入食物名稱'); return null; }
  return { name, qty: $('#m-qty').value.trim(), kcal: Math.round(kcal), p: Math.round(p * 10) / 10, c: Math.round(c * 10) / 10, f: Math.round(f * 10) / 10 };
}
function recents() {
  const seen = new Set(), out = [];
  for (const d of Object.keys(state.days).sort().reverse().slice(0, 60)) for (const it of (state.days[d].items || []).slice().reverse()) {
    if (!seen.has(it.name)) { seen.add(it.name); out.push({ name: it.name, qty: it.qty, kcal: it.kcal, p: it.p, c: it.c, f: it.f }); }
    if (out.length >= 12) return out;
  }
  return out;
}
function openSheet(mode, arg) {
  const body = $('#sheet-body');
  if (mode === 'edit') {
    editId = arg; const it = (state.days[ui.date]?.items || []).find(i => i.id === arg); if (!it) return;
    body.innerHTML = `<div class="sheet-head"><h2 id="sh-title">編輯食物</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>${mform(it)}
      <div class="sheet-foot"><button class="btn ghost" data-act="del">刪除</button><button class="btn" data-act="save">儲存</button></div>`;
  } else {
    editId = null; ui.meal = arg || ui.meal; addedN = 0;
    const rec = recents(); quick = [...rec, ...FOODS.filter(f => !rec.some(r => r.name === f.name))];
    body.innerHTML = `<div class="sheet-head"><h2 id="sh-title">新增食物</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
      <div class="seg" id="meal-seg" role="group" aria-label="餐別">${MEALS.map(m => `<button data-act="meal" data-meal="${m.k}" class="${m.k === ui.meal ? 'on' : ''}">${m.name}</button>`).join('')}</div>
      <h4>${rec.length ? '最近吃過與常見食物' : '常見食物'}（點一下就記錄 1 份）</h4>
      <div class="chips">${quick.map((f, i) => `<button class="chip" data-act="quick" data-i="${i}">${esc(f.name)}<small>${esc(f.qty || '')} · ${n0(f.kcal)}</small></button>`).join('')}</div>
      <h4>自己輸入</h4>${mform()}
      <div class="btn-row" style="margin:0"><button class="btn ghost" data-act="manual">加入這筆</button></div>
      <div class="sheet-foot"><span class="count" id="added-n"></span><button class="btn" data-act="close">完成</button></div>`;
  }
  $('#sheet').hidden = false; document.documentElement.classList.add('lock'); body.scrollTop = 0;
}
function closeSheet() { $('#sheet').hidden = true; document.documentElement.classList.remove('lock'); render(); }
function addItem(it) {
  ensureDay(ui.date).items.push({ id: uid(), meal: ui.meal, ...it });
  save(); addedN++;
  const el = $('#added-n'); if (el) el.textContent = `已加入 ${addedN} 項到${MEALS.find(m => m.k === ui.meal).name}`;
}

/* ---------- 匯出 / 匯入 ---------- */
async function shareFile(name, text, type) {
  const file = new File([text], name, { type });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return true; }
    catch (e) { if (e.name === 'AbortError') return false; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  return true;
}
function csvAll() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`, rows = [['日期', '餐別', '食物', '份量', '大卡', '蛋白質g', '碳水g', '脂肪g'].map(q).join(',')];
  for (const d of Object.keys(state.days).sort()) for (const it of state.days[d].items || []) rows.push([d, MEALS.find(m => m.k === it.meal)?.name, it.name, it.qty, it.kcal, it.p, it.c, it.f].map(q).join(','));
  return '﻿' + rows.join('\n');
}
async function importFile(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data.days !== 'object') throw new Error('format');
    let n = 0;
    for (const [d, day] of Object.entries(data.days)) if (/^\d{4}-\d{2}-\d{2}$/.test(d) && day && typeof day === 'object') { state.days[d] = { items: [], ...day }; n++; }
    if (data.profile) state.profile = { ...DEF, ...data.profile };
    save(); render(); toast(`已匯入 ${n} 天的紀錄`);
  } catch (e) { toast('這個檔案不是飲食日誌的備份'); }
}

/* ---------- 事件 ---------- */
function setField(k, raw) {
  const day = ensureDay(ui.date), v = k === 'note' ? raw.trim() : num(raw);
  if (v === null || v === '') delete day[k]; else day[k] = v;
  save();
}
function showRO(el) {
  const kind = el.dataset.ro, i = +el.dataset.i, rows = rangeRows(ui.range);
  const out = $('#ro-' + kind); if (out) out.innerHTML = roText(kind, i, rows);
  if (kind === 'cal') document.querySelectorAll('.chart .band').forEach((b, k) => b.classList.toggle('on', k === i));
}
document.addEventListener('click', async e => {
  const ro = e.target.closest('[data-ro]');
  if (ro) { showRO(ro); return; }
  const t = e.target.closest('[data-act]');
  if (!t) { if (e.target === $('#sheet')) closeSheet(); return; }
  const a = t.dataset.act, D = t.dataset;
  switch (a) {
    case 'tab': ui.tab = D.t; render(); window.scrollTo(0, 0); break;
    case 'day': { const nd = addDays(ui.date, +D.n); if (nd <= todayStr()) { ui.date = nd; render(); } break; }
    case 'today': e.preventDefault(); ui.date = todayStr(); render(); break;
    case 'add': openSheet('add', D.meal); break;
    case 'edit': openSheet('edit', D.id); break;
    case 'close': closeSheet(); break;
    case 'meal': ui.meal = D.meal; document.querySelectorAll('#meal-seg button').forEach(b => b.classList.toggle('on', b.dataset.meal === ui.meal)); break;
    case 'quick': { const f = quick[+D.i]; addItem({ name: f.name, qty: f.qty, kcal: f.kcal, p: f.p, c: f.c, f: f.f }); t.animate?.([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], 160); break; }
    case 'manual': { const it = readForm(); if (it) { addItem(it); ['name', 'qty', 'kcal', 'p', 'c', 'f'].forEach(k => { $('#m-' + k).value = ''; }); } break; }
    case 'save': { const it = readForm(); if (it) { Object.assign(state.days[ui.date].items.find(i => i.id === editId), it); save(); closeSheet(); } break; }
    case 'del': { const items = state.days[ui.date].items, idx = items.findIndex(i => i.id === editId); lastDeleted = { date: ui.date, idx, it: items[idx] }; items.splice(idx, 1); save(); closeSheet(); toast('已刪除', { act: 'undo', label: '復原' }); break; }
    case 'undo': if (lastDeleted) { ensureDay(lastDeleted.date).items.splice(lastDeleted.idx, 0, lastDeleted.it); save(); lastDeleted = null; $('#toast').hidden = true; render(); } break;
    case 'wo': {
      const day = ensureDay(ui.date); let w = new Set(day.workout || []);
      if (D.v === '休息') { w = w.has('休息') ? new Set() : new Set(['休息']); } else { w.delete('休息'); w.has(D.v) ? w.delete(D.v) : w.add(D.v); }
      day.workout = [...w]; if (!day.workout.length) delete day.workout; save();
      document.querySelectorAll('#wo-row .chip').forEach(b => { const on = w.has(b.dataset.v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); break;
    }
    case 'water': { const day = ensureDay(ui.date); day.water = Math.max(0, (day.water || 0) + (+D.n)); if (!day.water) delete day.water; save(); $('#h-water').value = day.water ?? ''; break; }
    case 'range': ui.range = +D.n; render(); break;
    case 'setp': { const w = lastWeight(); if (w) { state.profile.p = Math.round(w * +D.k); save(); render(); toast(`蛋白質目標改成 ${state.profile.p} g`); } break; }
    case 'install': if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice.catch(() => {}); deferredInstall = null; render(); } break;
    case 'hideinstall': ui.installHidden = true; saveUI(); render(); break;
    case 'backup': {
      const ok = await shareFile(`飲食日誌備份-${todayStr()}.json`, JSON.stringify({ app: 'dietlog', version: 1, exportedAt: new Date().toISOString(), profile: state.profile, days: state.days }), 'application/json');
      if (ok) { ui.lastBackup = Date.now(); saveUI(); if (ui.tab === 'settings') render(); }
      break;
    }
    case 'csv': shareFile(`飲食明細-${todayStr()}.csv`, csvAll(), 'text/csv'); break;
    case 'import': $('#import-file').click(); break;
  }
});
document.addEventListener('pointerover', e => { const ro = e.target.closest?.('[data-ro]'); if (ro && e.pointerType === 'mouse') showRO(ro); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'datepick') { if (t.value && t.value <= todayStr()) { ui.date = t.value; render(); } }
  else if (t.id === 'import-file') { if (t.files[0]) importFile(t.files[0]); t.value = ''; }
  else if (t.dataset.field) setField(t.dataset.field, t.value);
  else if (t.dataset.pf) {
    const k = t.dataset.pf, v = num(t.value);
    if (k === 'goalWeight') state.profile.goalWeight = v; else if (v !== null && v >= 0) state.profile[k] = v; else t.value = state.profile[k];
    save();
    const sy = window.scrollY;
    setTimeout(() => { const a = document.activeElement; if (ui.tab === 'settings' && !(a && a.tagName === 'INPUT')) { render(); window.scrollTo(0, sy); } }, 0);
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

// App 一直開著跨過午夜：回到畫面時，原本在看「今天」就跳到新的一天
let viewedToday = todayStr();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const now = todayStr();
  if (now !== viewedToday) { if (ui.date === viewedToday) ui.date = now; viewedToday = now; if ($('#sheet').hidden) render(); }
});

render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
