/* ============================================================
 *  界面逻辑 / 本地存储 / 计时器
 * ============================================================ */

const STORE_KEY = 'fitplan_v1';

const DEFAULT_STATE = {
  v: 1,
  profile: null,
  program: null,
  logs: {},
  bodyLog: [],
  settings: { step: 2.5, autoRest: true, sound: true }
};

let state = load();
let viewDate = Engine.iso(new Date());
let restTimer = null;
let restRemain = 0;
let draftProfile = null;

/* ---------------- 存储 ---------------- */

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const s = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), s);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    toast('保存失败：浏览器存储不可用');
  }
}

/* ---------------- 工具 ---------------- */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

function fmtDate(ds) {
  const d = new Date(ds + 'T00:00:00');
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function weekdayOf(ds) {
  return Engine.WEEKDAY_CN[new Date(ds + 'T00:00:00').getDay()];
}

function todayIso() { return Engine.iso(new Date()); }

/* ---------------- 初始化 ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  buildSetupForm();
  bindGlobal();
  if (state.profile && state.program) {
    showApp();
  } else {
    showView('setup');
  }
});

function showView(name) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  window.scrollTo({ top: 0 });
}

function showApp() {
  showView('app');
  renderAll();
}

function renderAll() {
  renderToday();
  renderPlan();
  renderProgress();
  renderLibrary();
  renderProfile();
  renderTabs();
}

function renderTabs() {
  const bar = $('#tabbar');
  bar.classList.toggle('hidden', !(state.profile && state.program));
}

/* ============================================================
 *  引导 / 建档
 * ============================================================ */

function buildSetupForm() {
  const days = [3, 4, 5];
  $('#f-days').innerHTML = days.map(d =>
    `<button type="button" class="chip" data-days="${d}">${d} 天</button>`).join('');
  const expOpts = [
    ['beginner', '新手（没系统练过）'],
    ['intermediate', '中级（规律训练 6 个月以上）'],
    ['advanced', '高级（规律训练 2 年以上）']
  ];
  $('#f-exp').innerHTML = expOpts.map(([v, t]) =>
    `<button type="button" class="chip" data-exp="${v}">${t}</button>`).join('');
  const goalOpts = [
    ['muscle', '增肌增重（我推荐）'],
    ['strength', '提升力量'],
    ['recomp', '保持体重、练出线条']
  ];
  $('#f-goal').innerHTML = goalOpts.map(([v, t]) =>
    `<button type="button" class="chip" data-goal="${v}">${t}</button>`).join('');
  $('#f-sex').innerHTML = [
    ['male', '男'], ['female', '女']
  ].map(([v, t]) => `<button type="button" class="chip" data-sex="${v}">${t}</button>`).join('');

  // 默认值：按用户提供的身高体重预填
  $('#in-height').value = 174;
  $('#in-weight').value = 59;
  $('#in-age').value = '';
  $('#in-dbmax').value = '';
  $('#in-pullups').value = 0;
  setChip('days', 3);
  setChip('exp', 'beginner');
  setChip('goal', 'muscle');
  setChip('sex', 'male');
  renderWeekdayPicker();
}

let setupChoice = { days: 3, exp: 'beginner', goal: 'muscle', sex: 'male' };

function setChip(group, value) {
  setupChoice[group] = value;
  const sel = group === 'days' ? '#f-days' : `#f-${group}`;
  $$(sel + ' .chip').forEach(c => {
    const v = c.dataset[group];
    c.classList.toggle('on', String(v) === String(value));
  });
  if (group === 'days') renderWeekdayPicker();
}

/**
 * 默认排课：从今天开始，把训练日均匀到一周里。
 * 新人建档当天就想练，所以默认包含今天，而不是死板的"周一三五"。
 */
function defaultWeekdays(days) {
  const today = new Date().getDay();
  const set = new Set();
  for (let i = 0; i < days; i++) set.add((today + Math.ceil(i * 7 / days)) % 7);
  let k = 0;
  while (set.size < days && k < 7) { set.add(k); k++; }
  return Array.from(set).sort((a, b) => a - b).slice(0, days);
}

let chosenWeekdays = [];   // 空数组 -> 首次渲染时按"从今天开始均匀铺开"自动排

function renderWeekdayPicker() {
  const need = Number(setupChoice.days);
  if (chosenWeekdays.length !== need) chosenWeekdays = defaultWeekdays(need);
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  $('#f-weekdays').innerHTML = names.map((n, i) =>
    `<button type="button" class="chip ${chosenWeekdays.includes(i) ? 'on' : ''}" data-wd="${i}">${n}</button>`
  ).join('');
  $('#wd-hint').textContent = `已选 ${chosenWeekdays.length} 天，需要选满 ${need} 天`;
  $('#wd-hint').classList.toggle('bad', chosenWeekdays.length !== need);
}

function collectProfile() {
  const height = Number($('#in-height').value);
  const weight = Number($('#in-weight').value);
  const age = Number($('#in-age').value);
  const dbmax = Number($('#in-dbmax').value) || 0;
  const pullups = Number($('#in-pullups').value) || 0;

  if (!height || height < 120 || height > 230) return { error: '请填写合理的身高（120-230 cm）' };
  if (!weight || weight < 30 || weight > 200) return { error: '请填写合理的体重（30-200 kg）' };
  if (!age || age < 12 || age > 80) return { error: '请填写合理的年龄（12-80 岁）' };
  if (chosenWeekdays.length !== Number(setupChoice.days)) return { error: '训练日天数要和选择的每周天数一致' };

  return {
    profile: {
      height, weight, age,
      sex: setupChoice.sex,
      exp: setupChoice.exp,
      days: Number(setupChoice.days),
      weekdays: [...chosenWeekdays].sort((a, b) => a - b),
      goal: setupChoice.goal,
      dumbbellMax: dbmax,
      pullups,
      startDate: todayIso()
    }
  };
}

/* ============================================================
 *  推荐结果页
 * ============================================================ */

function renderRecommend(p) {
  draftProfile = p;
  const m = Engine.metrics(p);
  const rec = Engine.recommendSplit(p);
  const primary = SPLITS[rec.primaryKey];
  const alt = SPLITS[rec.alternativeKey];

  const pullPlan = p.pullups >= 5
    ? '你可以做 ' + p.pullups + ' 个引体，直接练引体向上并考虑用背包加重。'
    : p.pullups >= 1
      ? '你现在能做 ' + p.pullups + ' 个引体，计划里用"引体 + 离心引体"组合，目标是 6 周内做到 8 个。'
      : '你现在还做不了标准引体，计划里会先用"离心引体 + 单杠斜身划船 + 悬垂"打基础，通常 4-8 周能做出第一个。';

  $('#view-recommend').innerHTML = `
    <div class="wrap narrow">
      <div class="rec-hero">
        <div class="rec-label">为你算出来的结果</div>
        <h1>推荐你练「${esc(primary.short)}」</h1>
        <p class="lead">${esc(primary.summary)}</p>
        <div class="pill-row">
          <span class="pill">每周 ${primary.days} 天</span>
          <span class="pill">每个肌群 / 周 ${primary.freq} 次</span>
          <span class="pill">单次约 45-55 分钟</span>
          <span class="pill">器材：哑铃 + 单杠</span>
        </div>
      </div>

      <section class="card">
        <h2>为什么是这个</h2>
        <ul class="bullets">${rec.reasons.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
      </section>

      <section class="card warn">
        <h2>为什么不推荐"部位分化"（以及你现在问的那个问题）</h2>
        <ul class="bullets">${rec.notRecommended.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
        <p class="muted">${esc(rec.fallbackNote)}</p>
      </section>

      <section class="card">
        <h2>你的身体数据</h2>
        <div class="grid4">
          <div class="stat"><span class="stat-num">${m.bmi}</span><span class="stat-lbl">BMI（${esc(m.verdict)}）</span></div>
          <div class="stat"><span class="stat-num">${m.tdee}</span><span class="stat-lbl">维持热量 kcal</span></div>
          <div class="stat"><span class="stat-num">${m.kcal}</span><span class="stat-lbl">增肌目标 kcal</span></div>
          <div class="stat"><span class="stat-num">${m.protein}<small> g</small></span><span class="stat-lbl">每日蛋白质</span></div>
        </div>
        <p class="muted">${esc(m.verdictDetail)}</p>
        <div class="eatbox">
          <div><b>每天吃多少</b></div>
          <div class="macro-row">
            <span class="macro"><b>${m.kcal}</b> kcal</span>
            <span class="macro">蛋白 <b>${m.protein}g</b></span>
            <span class="macro">脂肪 <b>${m.fat}g</b></span>
            <span class="macro">碳水 <b>${m.carb}g</b></span>
          </div>
          <div class="muted small">目标是每周涨 0.25~0.4 kg。从 ${p.weight} kg 到 ${m.goalWeightLow}~${m.goalWeightHigh} kg，大约需要 ${m.weeks} 周（按每周 0.35 kg 计算）。每周固定早上空腹称一次体重，两周没涨就每天再加 200 kcal。</div>
        </div>
        <p class="muted">${esc(pullPlan)}</p>
      </section>

      <section class="card">
        <h2>也可以选自其他方案</h2>
        <p class="muted small">默认帮你选好的是推荐方案。想换一个，点下面的卡片再生成。</p>
        <div class="split-list" id="split-list">
          ${Object.values(SPLITS).map(s => {
            const recommended = s.key === rec.primaryKey;
            const daysBad = s.days > p.days;
            return `
            <button class="split-card ${recommended ? 'on' : ''} ${daysBad ? 'off' : ''}"
                    data-split="${s.key}" ${daysBad ? 'disabled' : ''}>
              <div class="split-top">
                <b>${esc(s.short)}</b>
                <span class="tag ${recommended ? 'good' : (s.style === 'bodypart' ? 'bad' : '')}">${esc(recommended ? '推荐给你' : s.tag)}</span>
              </div>
              <div class="muted small">每周 ${s.days} 天 · 每肌群 ${s.freq} 次/周</div>
              <div class="muted small">${esc(s.summary)}</div>
              ${daysBad ? '<div class="small bad">需要每周 4 天，和你选的 3 天不符</div>' : ''}
            </button>`;
          }).join('')}
        </div>
      </section>

      <div class="actions">
        <button class="btn ghost" id="btn-back-setup">返回修改</button>
        <button class="btn primary" id="btn-generate">生成我的 ${primary.days} 天计划</button>
      </div>
    </div>`;

  let picked = rec.primaryKey;
  $$('#split-list .split-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.disabled) return;
      picked = card.dataset.split;
      $$('#split-list .split-card').forEach(c => c.classList.toggle('on', c === card));
      const s = SPLITS[picked];
      $('#btn-generate').textContent = `生成我的 ${s.days} 天计划`;
    });
  });

  $('#btn-back-setup').addEventListener('click', () => showView('setup'));
  $('#btn-generate').addEventListener('click', () => {
    const s = SPLITS[picked];
    const prof = { ...p };
    prof.days = s.days;
    if (s.days === 4 && p.days < 4) prof.weekdays = defaultWeekdays(4);
    if (s.days === 3) prof.weekdays = prof.weekdays.slice(0, 3);
    state.profile = prof;
    state.program = Engine.buildProgram(prof, picked, todayIso(), 1);
    save();
    showApp();
    toast('计划已生成，开始训练吧');
  });

  showView('recommend');
}

/* ============================================================
 *  今日训练
 * ============================================================ */

function getLog(dateStr) {
  if (!state.logs[dateStr]) {
    state.logs[dateStr] = { entries: [], completed: false, startedAt: null };
  }
  return state.logs[dateStr];
}

function lastRecord(exId, beforeDate) {
  const keys = Object.keys(state.logs).filter(k => k < beforeDate).sort().reverse();
  for (const k of keys) {
    const e = (state.logs[k].entries || []).find(x => x.exId === exId);
    if (e && e.sets && e.sets.some(s => s.w || s.r)) {
      return { date: k, sets: e.sets };
    }
  }
  return null;
}

function diagramBlock(pattern, name) {
  const dg = DIAGRAM.forPattern(pattern);
  return `
    ${dg.svg}
    <div class="ex-media">
      <a class="btn video" href="${DIAGRAM.videoUrl(name)}" target="_blank" rel="noopener">▶ 看视频教学（B站搜索）</a>
    </div>
    <div class="caution-box">
      <h4 class="warn">⚠️ 注意事项</h4>
      <ul>${dg.caution.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      <h4 class="err">✗ 常见错误</h4>
      <ul>${dg.errors.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>`;
}

function renderToday() {
  const el = $('#page-today');
  if (!state.program) { el.innerHTML = ''; return; }

  const s = Engine.sessionForDate(state, viewDate);
  const log = state.logs[viewDate];
  const isToday = viewDate === todayIso();

  const nav = `
    <div class="date-nav">
      <button class="icon-btn" data-nav="-1">‹</button>
      <div class="date-main">
        <b>${fmtDate(viewDate)} ${weekdayOf(viewDate)}</b>
        ${isToday ? '<span class="pill tiny">今天</span>' : `<button class="link" data-nav="today">回到今天</button>`}
      </div>
      <button class="icon-btn" data-nav="1">›</button>
    </div>`;

  if (!s || s.status === 'before') {
    el.innerHTML = nav + `<section class="card"><h2>计划还没开始</h2>
      <p class="muted">你的计划从 ${state.program ? fmtDate(state.program.startDate) : ''} 开始。</p></section>`;
    bindDateNav();
    return;
  }

  if (s.status === 'rest') {
    el.innerHTML = nav + `
      <section class="card rest-card">
        <div class="rest-mark">休息日</div>
        <h2>今天不训练，好好吃、好好睡</h2>
        <p class="muted">肌肉是在休息时长出来的。休息日的任务只有一个：把热量吃够。</p>
        ${s.next ? `<div class="next-box">
          <span class="muted small">下一次训练</span>
          <b>${fmtDate(s.next.date)} ${weekdayOf(s.next.date)} · ${esc(s.next.name)}</b>
          <button class="btn ghost small" id="btn-preview-next">先看看下次练什么</button>
        </div>` : ''}
        <div class="weekpos">当前进度：${esc(s.weekDef.label)}（第 ${s.cycle} 个周期）</div>
      </section>
      <section class="card">
        <h2>休息日可以做什么</h2>
        <ul class="bullets">
          <li>20-30 分钟轻松散步，促进恢复，不影响增肌</li>
          <li>拉伸胸、背、髋屈肌各 30 秒——哑铃训练容易让这些部位变紧</li>
          <li>把明天要练的动作和重量先看一眼，训练时能省 10 分钟</li>
        </ul>
      </section>`;
    bindDateNav();
    const prevNext = $('#btn-preview-next');
    if (prevNext) prevNext.addEventListener('click', () => { viewDate = s.next.date; renderToday(); });
    return;
  }

  // 训练日
  const entries = (log && log.entries) || [];
  const doneSets = entries.reduce((n, e) => n + (e.sets || []).filter(x => x.done).length, 0);
  const totalSets = s.blocks.reduce((n, b) => n + b.sets, 0);
  const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0;

  el.innerHTML = nav + `
    <section class="card hero-card">
      <div class="hero-top">
        <div>
          <div class="muted small">第 ${s.weekInBlock} 周 · 第 ${s.cycle} 个周期 · 预计 ${s.est} 分钟</div>
          <h2>${esc(s.name)}</h2>
          <div class="muted small">${esc(s.focus)}</div>
        </div>
        <div class="ring" style="--p:${pct}">
          <span>${pct}%</span>
        </div>
      </div>
      <div class="weekpos">${esc(s.weekDef.label)}：${esc(s.weekDef.instruction)}</div>
      <div class="muted small">本周渐进方式：${esc(s.weekDef.overload)}</div>
    </section>

    <section class="card warm">
      <h3>开练前（5 分钟，别跳过）</h3>
      <ul class="bullets small">${WARMUP.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
    </section>

    <div id="ex-list">
      ${s.blocks.map((b, i) => exerciseCard(b, i, log, viewDate, s)).join('')}
    </div>

    <section class="card warm">
      <h3>收尾（5 分钟）</h3>
      <ul class="bullets small">${COOLDOWN.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
    </section>

    <div class="actions sticky-actions">
      <button class="btn ${log && log.completed ? 'ghost' : 'primary'}" id="btn-finish">
        ${log && log.completed ? '✓ 已完成（点击撤销）' : '完成今天的训练'}
      </button>
    </div>`;

  bindDateNav();
  bindExerciseInputs(s);
  $('#btn-finish').addEventListener('click', () => {
    const l = getLog(viewDate);
    l.completed = !l.completed;
    if (l.completed) {
      l.finishedAt = new Date().toISOString();
      toast('练完了，去吃点东西 + 蛋白质');
    }
    save();
    renderToday();
    renderProgress();
  });
}

function exerciseCard(b, idx, log, dateStr, session) {
  const entry = (log && log.entries || []).find(e => e.exId === b.exId);
  const sets = (entry && entry.sets) || [];
  const last = lastRecord(b.exId, dateStr);
  const restTxt = b.timeBased ? '间隔 ' + b.rest + ' 秒' : '休息 ' + b.rest + ' 秒';
  const targetTxt = b.timeBased
    ? `${b.timeRange ? b.timeRange[0] + '-' + b.timeRange[1] : '30-45'} 秒`
    : `${b.reps[0]}${b.reps[1] !== b.reps[0] ? '-' + b.reps[1] : ''} 次`;

  // 计时类动作：练的是"多久"，但哑铃动作还要记重量，所以字段不一样
  const fields = b.timeBased
    ? (b.suggest ? ['w', 't'] : ['t'])
    : ['w', 'r'];
  const fieldLabel = { w: 'kg', r: '次', t: '秒' };
  const timePh = b.timeRange ? b.timeRange[0] + '-' + b.timeRange[1] : '30-45';

  const setRows = Array.from({ length: b.sets }).map((_, i) => {
    const cur = sets[i] || {};
    const prev = last && last.sets[i] ? last.sets[i] : null;
    const val = f => {
      if (cur[f] != null) return cur[f];
      if (prev && prev[f] != null) return prev[f];
      if (f === 'w') return b.suggest || '';
      return '';
    };
    return `
      <div class="set-row ${cur.done ? 'done' : ''}" data-set="${i}">
        <span class="set-idx">${i + 1}</span>
        ${fields.map(f => `
        <label class="mini">
          <span>${fieldLabel[f]}</span>
          <input type="number" step="${f === 'r' ? 1 : 0.5}" inputmode="decimal"
                 data-f="${f}" data-ex="${b.exId}" data-i="${i}"
                 value="${val(f)}"
                 placeholder="${f === 't' ? timePh : f === 'w' ? (b.suggestMode === 'perHand' ? '每只' : 'kg') : '次'}">
        </label>`).join('')}
        <button class="check ${cur.done ? 'on' : ''}" data-f="done" data-ex="${b.exId}" data-i="${i}">
          ${cur.done ? '✓' : '○'}
        </button>
      </div>`;
  }).join('');

  const lastTxt = last
    ? `<span class="muted small">上次（${fmtDate(last.date)}）：${last.sets.filter(s => s.w || s.r || s.t)
        .map(s => b.timeBased ? `${s.w ? s.w + 'kg×' : ''}${s.t || '-'}秒` : `${s.w || '-'}kg×${s.r || '-'}`).join(' / ')}</span>`
    : '';

  const sideTxt = b.perSide ? '<span class="tag">每侧分别做</span>' : '';
  const amrapTxt = b.amrap ? '<span class="tag">做到还剩 1-2 次余力</span>' : '';

  return `
  <section class="card ex-card" data-idx="${idx}">
    <div class="ex-head">
      <div class="ex-title">
        <span class="ex-no">${idx + 1}</span>
        <div>
          <b>${esc(b.name)}</b>
          <div class="muted tiny">${esc(b.primary.join(' / '))}${b.secondary.length ? ' · ' + esc(b.secondary.join('/')) : ''}</div>
        </div>
      </div>
      <button class="btn ghost small toggle" data-toggle="${idx}">▾ 示意图</button>
    </div>

    <div class="ex-plan">
      <span class="big">${b.sets} 组</span>
      <span>×</span>
      <span class="big">${targetTxt}</span>
      <span class="tag">RPE ${b.rpe}</span>
      <span class="tag">${restTxt}</span>
      ${sideTxt}${amrapTxt}
    </div>

    ${session && session.weekDef && session.weekDef.deload
      ? '<div class="suggest deload">减载周：重量用上次的 80%，组数已经自动减少。练完不应该觉得累，这才是对的。</div>'
      : ''}

    ${b.suggest && !last
      ? `<div class="suggest">起始建议：<b>${b.suggest} kg</b> ${b.suggestMode === 'perHand' ? '/ 每只手' : b.suggestMode === 'single' ? '/ 单只哑铃' : ''}
         <span class="muted tiny">（估算值，第一组按这个重量试，感觉太轻或太重就现场调，记住实际用的重量）</span></div>`
      : b.timeBased
        ? '<div class="suggest">计时动作：能轻松完成区间上限，就延长时间、加负重或改单侧</div>'
        : b.suggest
          ? ''
          : '<div class="suggest">自重动作：能轻松做完区间上限就加难度（抬脚、单腿、减速离心）</div>'}

    <div class="set-list">${setRows}</div>
    ${lastTxt}

    <div class="ex-detail hidden" data-detail="${idx}">
      <div class="note">教练备注：${esc(b.planNote)}</div>
      ${diagramBlock(b.pattern, b.name)}
      <ul class="bullets small">${b.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      ${b.alts.length ? `<div class="muted small">做不了或器械不够，可替代：${b.alts.map(a => esc(EXERCISES[a] ? EXERCISES[a].name : a)).join('、')}</div>` : ''}
      <label class="mini wide"><span>今日感受 / 备注</span>
        <input type="text" data-f="note" data-ex="${b.exId}" value="${esc(entry && entry.note || '')}" placeholder="例如：右肩有点紧 / 重量偏轻">
      </label>
    </div>
  </section>`;
}

function bindDateNav() {
  $$('[data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      const v = b.dataset.nav;
      if (v === 'today') viewDate = todayIso();
      else {
        const d = new Date(viewDate + 'T00:00:00');
        d.setDate(d.getDate() + Number(v));
        viewDate = Engine.iso(d);
      }
      renderToday();
    });
  });
}

function bindExerciseInputs(session) {
  $$('#page-today [data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = $(`#page-today [data-detail="${btn.dataset.toggle}"]`);
      d.classList.toggle('hidden');
      btn.textContent = d.classList.contains('hidden') ? '▾ 示意图' : '▴ 收起';
    });
  });

  $$('#page-today input[data-f]').forEach(inp => {
    inp.addEventListener('change', () => {
      const { f, ex } = inp.dataset;
      const log = getLog(viewDate);
      let e = log.entries.find(x => x.exId === ex);
      if (!e) { e = { exId: ex, sets: [] }; log.entries.push(e); }
      if (f === 'note') { e.note = inp.value; save(); return; }
      const i = Number(inp.dataset.i);
      if (!e.sets[i]) e.sets[i] = {};
      e.sets[i][f] = inp.value === '' ? null : Number(inp.value);
      if (!log.startedAt) log.startedAt = new Date().toISOString();
      save();
    });
  });

  $$('#page-today [data-f="done"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { ex, i } = btn.dataset;
      const idx = Number(i);
      const log = getLog(viewDate);
      let e = log.entries.find(x => x.exId === ex);
      if (!e) { e = { exId: ex, sets: [] }; log.entries.push(e); }
      if (!e.sets[idx]) e.sets[idx] = {};
      const wasDone = !!e.sets[idx].done;

      // 从输入框读取当前值，避免用户没失焦就点勾
      const row = btn.closest('.set-row');
      $$('input[data-f]', row).forEach(inp => {
        e.sets[idx][inp.dataset.f] = inp.value === '' ? null : Number(inp.value);
      });

      e.sets[idx].done = !wasDone;
      if (!wasDone) e.sets[idx].at = new Date().toISOString();
      if (!log.startedAt) log.startedAt = new Date().toISOString();
      save();

      const block = session.blocks.find(b => b.exId === ex);
      if (!wasDone && state.settings.autoRest && block) startRest(block.rest);
      renderToday();
    });
  });
}

/* ============================================================
 *  组间计时器
 * ============================================================ */

function startRest(seconds) {
  restRemain = seconds;
  $('#restbar').classList.remove('hidden');
  paintRest();
  if (restTimer) clearInterval(restTimer);
  restTimer = setInterval(() => {
    restRemain--;
    if (restRemain <= 0) {
      clearInterval(restTimer); restTimer = null;
      paintRest();
      beep();
      toast('休息结束，下一组');
      setTimeout(() => $('#restbar') && $('#restbar').classList.add('hidden'), 2500);
      return;
    }
    paintRest();
  }, 1000);
}

function paintRest() {
  const bar = $('#restbar');
  if (!bar) return;
  const m = Math.floor(Math.max(0, restRemain) / 60);
  const s = String(Math.max(0, restRemain) % 60).padStart(2, '0');
  $('#rest-time').textContent = `${m}:${s}`;
}

function beep() {
  if (!state.settings.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.12;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 260);
  } catch (e) { /* 忽略 */ }
}

/* ============================================================
 *  计划页
 * ============================================================ */

function renderPlan() {
  const el = $('#page-plan');
  if (!state.program) { el.innerHTML = ''; return; }
  const prog = state.program;
  const split = SPLITS[prog.splitKey];
  const overview = Engine.blockOverview(state);
  const byWeek = {};
  overview.forEach(s => {
    (byWeek[s.weekInBlock] = byWeek[s.weekInBlock] || []).push(s);
  });

  const weekdayTxt = prog.dayTemplates
    .map(t => `${Engine.WEEKDAY_CN[t.weekday]}：${DAY_TEMPLATES[t.template].name}`)
    .join('<br>');

  el.innerHTML = `
    <section class="card hero-card">
      <div class="muted small">当前计划</div>
      <h2>${esc(split.name)}</h2>
      <div class="pill-row">
        <span class="pill">每周 ${split.days} 天</span>
        <span class="pill">第 ${prog.step} 个中周期</span>
        <span class="pill">启动 ${fmtDate(prog.startDate)}</span>
      </div>
      <div class="weekpos">${weekdayTxt}</div>
    </section>

    <section class="card">
      <h2>四周怎么推进</h2>
      ${Engine.WEEKS.map(w => `
        <div class="week-row">
          <div class="week-badge ${w.deload ? 'deload' : ''}">${w.n}</div>
          <div>
            <b>${esc(w.label)}</b>
            <div class="muted small">${esc(w.instruction)}</div>
            <div class="tiny tag">${esc(w.overload)} · RPE ${w.rpe}</div>
          </div>
        </div>`).join('')}
      <p class="muted small">渐进超负荷的核心规则：某个动作能在次数区间上限做完所有组、并且还剩 1-2 次余力，下次就加一档重量（哑铃通常 2.5 kg/只）；加不动了就先把次数从区间下限往上堆。宁可每次加一点点，也不要一次加太多导致动作变形。</p>
    </section>

    <section class="card">
      <h2>这个中周期的训练日</h2>
      ${Object.keys(byWeek).sort().map(w => `
        <div class="block-week">
          <div class="block-week-title">${esc(Engine.WEEKS[w - 1].label)}</div>
          ${byWeek[w].map(s => {
            const done = state.logs[s.date] && state.logs[s.date].completed;
            return `<div class="day-line ${done ? 'ok' : ''}">
              <span class="dl-date">${fmtDate(s.date)} ${weekdayOf(s.date)}</span>
              <span class="dl-name">${esc(s.name)}</span>
              <span class="dl-mark">${done ? '✓' : ''}</span>
            </div>`;
          }).join('')}
        </div>`).join('')}
    </section>

    <section class="card">
      <h2>每个训练日练什么</h2>
      ${split.templates.map(t => {
        const tpl = DAY_TEMPLATES[t];
        return `<div class="tpl">
          <b>${esc(tpl.name)}</b>
          <div class="muted small">${esc(tpl.focus)} · 约 ${tpl.est} 分钟</div>
          <ol class="tpl-list">${tpl.blocks.map(b => `<li>${esc(EXERCISES[b.ex].name)} <span class="muted">${b.sets} 组</span></li>`).join('')}</ol>
        </div>`;
      }).join('')}
    </section>

    <section class="card">
      <h2>换计划</h2>
      <p class="muted small">练满 6-8 周再考虑更换。频繁换计划是新手最常见的停滞原因。</p>
      <div class="actions">
        <button class="btn ghost" id="btn-repick">重新做一次推荐</button>
        <button class="btn ghost" id="btn-next-block">进入下一个中周期</button>
      </div>
    </section>`;

  $('#btn-repick').addEventListener('click', () => {
    draftProfile = state.profile;
    renderRecommend(state.profile);
  });
  $('#btn-next-block').addEventListener('click', () => {
    const p = { ...state.profile };
    const d = new Date(state.program.startDate + 'T00:00:00');
    d.setDate(d.getDate() + 28);
    p.startDate = Engine.iso(d);
    if (!confirm(`开始第 ${state.program.step + 1} 个中周期？\n\n建议：新周期的重量按上一周期第 3 周 +5% 起步，如果某个动作上次做到区间上限很轻松，可以直接加重。`)) return;
    state.profile = p;
    state.program = Engine.buildProgram(p, state.program.splitKey, p.startDate, state.program.step + 1);
    save();
    renderAll();
    toast('新周期已开始');
  });
}

/* ============================================================
 *  进度页
 * ============================================================ */

function renderProgress() {
  const el = $('#page-progress');
  if (!state.program) { el.innerHTML = ''; return; }
  const st = Engine.stats(state);
  const weights = (state.bodyLog || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const latest = weights[weights.length - 1];
  const first = weights[0];
  const delta = latest && first ? +(latest.weight - first.weight).toFixed(1) : 0;

  // 按周聚合训练容量
  const weekVol = {};
  Object.keys(state.logs).forEach(k => {
    const l = state.logs[k];
    if (!l.completed) return;
    let v = 0;
    (l.entries || []).forEach(e => (e.sets || []).forEach(s => {
      if (s.w && s.r && s.done) v += s.w * s.r;
    }));
    const d = new Date(k + 'T00:00:00');
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const wk = Engine.iso(monday);
    weekVol[wk] = (weekVol[wk] || 0) + v;
  });
  const wkKeys = Object.keys(weekVol).sort().slice(-8);
  const maxVol = Math.max(1, ...wkKeys.map(k => weekVol[k]));

  el.innerHTML = `
    <section class="card">
      <h2>训练统计</h2>
      <div class="grid4">
        <div class="stat"><span class="stat-num">${st.total}</span><span class="stat-lbl">累计训练次数</span></div>
        <div class="stat"><span class="stat-num">${st.streak}</span><span class="stat-lbl">连续打卡</span></div>
        <div class="stat"><span class="stat-num">${st.sets}</span><span class="stat-lbl">累计完成组数</span></div>
        <div class="stat"><span class="stat-num">${(st.volume / 1000).toFixed(1)}<small> t</small></span><span class="stat-lbl">累计训练容量</span></div>
      </div>
      <p class="muted small">训练容量 = 重量 × 次数 × 组数 的总和。它会随体重和力量一起上涨，是比"今天累不累"更可靠的进步指标。</p>
    </section>

    <section class="card">
      <h2>体重记录</h2>
      ${latest ? `
        <div class="grid4">
          <div class="stat"><span class="stat-num">${latest.weight}<small> kg</small></span><span class="stat-lbl">最新（${fmtDate(latest.date)}）</span></div>
          <div class="stat"><span class="stat-num ${delta >= 0 ? 'good' : 'bad'}">${delta >= 0 ? '+' : ''}${delta}<small> kg</small></span><span class="stat-lbl">相对起始</span></div>
        </div>
        ${weights.length > 1 ? svgLine(weights) : ''}
        <p class="muted small">${delta >= 0.3
          ? '增重节奏正常，保持当前热量。'
          : '两周内体重几乎没变，说明热量还不够：每天再加 200-300 kcal（一瓶牛奶 250ml ≈ 160 kcal + 一把坚果 ≈ 180 kcal）。'}</p>
      ` : '<p class="muted small">还没记录过体重。建议每周固定时间（起床后、上完厕所、空腹）称一次，用趋势判断，不要看单日波动。</p>'}
      <div class="inline-form">
        <input type="number" id="in-bodyweight" step="0.1" inputmode="decimal" placeholder="今天的体重 kg">
        <button class="btn primary" id="btn-log-weight">记录</button>
      </div>
    </section>

    <section class="card">
      <h2>每周训练容量</h2>
      ${wkKeys.length ? wkKeys.map(k => `
        <div class="vol-row">
          <span class="muted small">${fmtDate(k)} 起</span>
          <div class="vol-bar"><i style="width:${Math.round(weekVol[k] / maxVol * 100)}%"></i></div>
          <span class="vol-num">${Math.round(weekVol[k])} kg</span>
        </div>`).join('')
        : '<p class="muted small">完成几次训练后这里会出现容量曲线。稳定上涨说明渐进超负荷在生效。</p>'}
    </section>

    <section class="card">
      <h2>训练记录</h2>
      ${Object.keys(state.logs).sort().reverse().slice(0, 12).map(k => {
        const l = state.logs[k];
        const sets = (l.entries || []).reduce((n, e) => n + (e.sets || []).filter(s => s.done).length, 0);
        return `<div class="day-line ${l.completed ? 'ok' : ''}">
          <span class="dl-date">${fmtDate(k)}</span>
          <span class="dl-name">${sets} 组${l.completed ? ' · 已完成' : l.entries && l.entries.length ? ' · 未完成' : ''}</span>
          <span class="dl-mark">${l.completed ? '✓' : ''}</span>
        </div>`;
      }).join('') || '<p class="muted small">还没有训练记录。</p>'}
    </section>`;

  $('#btn-log-weight').addEventListener('click', () => {
    const v = Number($('#in-bodyweight').value);
    if (!v || v < 30 || v > 200) { toast('请输入合理体重'); return; }
    const d = todayIso();
    const exist = state.bodyLog.find(x => x.date === d);
    if (exist) exist.weight = v; else state.bodyLog.push({ date: d, weight: v });
    state.profile.weight = v;
    save();
    renderProgress();
    toast('体重已记录');
  });
}

function svgLine(points) {
  const w = 320, h = 90, pad = 12;
  const vals = points.map(p => p.weight);
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const xs = points.map((_, i) => pad + i * (w - pad * 2) / Math.max(1, points.length - 1));
  const ys = vals.map(v => h - pad - (v - min) / (max - min) * (h - pad * 2));
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length - 1].toFixed(1)},${h - pad} L${xs[0].toFixed(1)},${h - pad} Z`;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${area}" class="chart-area"/>
    <path d="${path}" class="chart-line"/>
    ${xs.map((x, i) => `<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="2.5" class="chart-dot"/>`).join('')}
  </svg>`;
}

/* ============================================================
 *  动作库
 * ============================================================ */

const GROUPS = [
  { key: 'all', name: '全部' },
  { key: 'legs', name: '腿 / 臀' },
  { key: 'push', name: '推（胸肩三头）' },
  { key: 'pull', name: '拉（背二头）' },
  { key: 'core', name: '核心' }
];

let libGroup = 'all';

function libMatch(ex, g) {
  if (g === 'all') return true;
  if (g === 'legs') return ['squat', 'hinge', 'lunge', 'calf'].includes(ex.pattern);
  if (g === 'push') return ['push_h', 'push_v', 'ext', 'lateral', 'trap'].includes(ex.pattern);
  if (g === 'pull') return ['pull_v', 'pull_h', 'curl'].includes(ex.pattern);
  if (g === 'core') return ['core', 'carry'].includes(ex.pattern);
  return true;
}

function renderLibrary() {
  const el = $('#page-library');
  const list = Object.entries(EXERCISES).filter(([, ex]) => libMatch(ex, libGroup));
  el.innerHTML = `
    <section class="card">
      <h2>动作库（${Object.keys(EXERCISES).length} 个动作，全部只需要哑铃 / 单杠 / 自重）</h2>
      <div class="chip-row">${GROUPS.map(g =>
        `<button class="chip ${libGroup === g.key ? 'on' : ''}" data-lib="${g.key}">${g.name}</button>`).join('')}</div>
    </section>
    ${list.map(([k, ex]) => `
      <section class="card ex-lib">
        <div class="ex-title">
          <div>
            <b>${esc(ex.name)}</b>
            <div class="muted tiny">${esc(ex.en)} · ${ex.equip === 'bar' ? '单杠' : ex.equip === 'db' ? '哑铃' : '自重'} · 建议休息 ${ex.rest}s</div>
          </div>
        </div>
        <div class="chip-row small">
          <span class="tag good">${esc(ex.primary.join(' / '))}</span>
          ${ex.secondary.map(s => `<span class="tag">${esc(s)}</span>`).join('')}
          ${ex.perSide ? '<span class="tag">每侧</span>' : ''}
          ${ex.timeBased ? '<span class="tag">计时</span>' : `<span class="tag">${ex.reps[0]}-${ex.reps[1]} 次</span>`}
        </div>
        ${diagramBlock(ex.pattern, ex.name)}
        <ul class="bullets small">${ex.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${ex.alts && ex.alts.length ? `<div class="muted small">替代：${ex.alts.map(a => esc(EXERCISES[a].name)).join('、')}</div>` : ''}
      </section>`).join('')}`;

  $$('#page-library [data-lib]').forEach(b => b.addEventListener('click', () => {
    libGroup = b.dataset.lib;
    renderLibrary();
  }));
}

/* ============================================================
 *  我的 / 设置
 * ============================================================ */

function renderProfile() {
  const el = $('#page-me');
  if (!state.profile) { el.innerHTML = ''; return; }
  const p = state.profile;
  const m = Engine.metrics(p);
  const names = ['日', '一', '二', '三', '四', '五', '六'];

  el.innerHTML = `
    <section class="card">
      <h2>我的档案</h2>
      <div class="form-grid">
        <label class="mini wide"><span>身高 cm</span><input type="number" id="p-height" value="${p.height}"></label>
        <label class="mini wide"><span>体重 kg</span><input type="number" step="0.1" id="p-weight" value="${p.weight}"></label>
        <label class="mini wide"><span>年龄</span><input type="number" id="p-age" value="${p.age}"></label>
        <label class="mini wide"><span>每周训练天数</span>
          <select id="p-days">
            ${[3, 4, 5].map(d => `<option value="${d}" ${p.days === d ? 'selected' : ''}>${d} 天</option>`).join('')}
          </select></label>
        <label class="mini wide"><span>单只哑铃最大可用重量 kg</span><input type="number" step="0.5" id="p-dbmax" value="${p.dumbbellMax || ''}" placeholder="不确定就留空"></label>
        <label class="mini wide"><span>现在能连续做几个引体</span><input type="number" id="p-pullups" value="${p.pullups || 0}"></label>
        <label class="mini wide"><span>哑铃最小递增档位 kg</span><input type="number" step="0.5" id="p-step" value="${state.settings.step}"></label>
      </div>
      <div class="chip-row">
        ${names.map((n, i) => `<button class="chip ${p.weekdays.includes(i) ? 'on' : ''}" data-pwd="${i}">${n}</button>`).join('')}
      </div>
      <p class="muted small">训练日按这里选的星期排课，一共选 ${p.days} 天。改完点保存后，如果天数或星期变了需要重新生成计划。</p>
      <div class="actions">
        <button class="btn primary" id="btn-save-profile">保存档案</button>
      </div>
    </section>

    <section class="card">
      <h2>营养目标（自动计算）</h2>
      <div class="grid4">
        <div class="stat"><span class="stat-num">${m.kcal}</span><span class="stat-lbl">kcal / 天</span></div>
        <div class="stat"><span class="stat-num">${m.protein}<small> g</small></span><span class="stat-lbl">蛋白质</span></div>
        <div class="stat"><span class="stat-num">${m.fat}<small> g</small></span><span class="stat-lbl">脂肪</span></div>
        <div class="stat"><span class="stat-num">${m.carb}<small> g</small></span><span class="stat-lbl">碳水</span></div>
      </div>
      <ul class="bullets small">
        <li>蛋白质来源：鸡蛋 2 个 ≈ 12g、鸡胸 100g ≈ 23g、牛奶 250ml ≈ 8g、乳清蛋白一勺 ≈ 24g</li>
        <li>你现在每天需要 ${m.protein}g 蛋白，靠三餐正常吃通常只有 70-80g，差的部分用牛奶 + 鸡蛋 + 蛋白粉补最快</li>
        <li>训练日练前 1-2 小时吃一点碳水（香蕉 / 面包），练后 1 小时内吃正餐</li>
        <li>睡够 7-8 小时。熬夜会直接抵消一部分训练成果</li>
      </ul>
    </section>

    <section class="card">
      <h2>设置</h2>
      <label class="switch-row"><span>勾选一组后自动开始休息计时</span>
        <input type="checkbox" id="s-autorest" ${state.settings.autoRest ? 'checked' : ''}></label>
      <label class="switch-row"><span>休息结束提示音</span>
        <input type="checkbox" id="s-sound" ${state.settings.sound ? 'checked' : ''}></label>
    </section>

    <section class="card">
      <h2>数据</h2>
      <p class="muted small">所有数据只保存在这台电脑的浏览器里，不会上传到任何服务器。换电脑或清浏览器缓存前记得导出备份。</p>
      <div class="actions">
        <button class="btn ghost" id="btn-export">导出备份</button>
        <button class="btn ghost" id="btn-import">导入备份</button>
        <button class="btn danger" id="btn-reset">清空所有数据</button>
      </div>
      <input type="file" id="file-import" accept=".json" class="hidden">
    </section>

    <section class="card">
      <h2>关于器材：哑铃重量不够怎么办</h2>
      <ul class="bullets small">
        <li><b>改单侧</b>：双手动作改单手/单腿（保加利亚分腿蹲、单臂划船、单腿提踵），难度立刻翻倍</li>
        <li><b>加暂停</b>：最低点停 2 秒，去掉弹性和借力，同样重量会难很多</li>
        <li><b>放慢离心</b>：下放用 4 秒，肌肉受力时间变长，增肌刺激不输大重量</li>
        <li><b>提高次数</b>：次数从 8 次做到 15-20 次，接近力竭同样有效</li>
        <li><b>缩短休息</b>：从 120 秒压到 90 秒（但主项不建议少于 90 秒）</li>
        <li>以上都做完了还是太轻，再考虑买一副可调哑铃的加片或弹力带</li>
      </ul>
    </section>

    <section class="card">
      <h2>安全提示</h2>
      <p class="muted small">本计划基于通用训练学原则和你的身体数据生成，属于健身建议，不是医疗建议。如果有心脏、血压、关节、腰椎等既往问题，或训练中出现刺痛、头晕、胸闷，请立即停止并咨询医生。疼痛（不是酸胀）出现时不要硬撑。</p>
    </section>`;

  $$('#page-me [data-pwd]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.pwd);
    const arr = new Set(p.weekdays);
    if (arr.has(i)) arr.delete(i); else arr.add(i);
    p.weekdays = Array.from(arr).sort((a, b) => a - b);
    save();
    renderProfile();
  }));

  $('#btn-save-profile').addEventListener('click', () => {
    const oldDays = p.days, oldWd = p.weekdays.join(',');
    p.height = Number($('#p-height').value) || p.height;
    p.weight = Number($('#p-weight').value) || p.weight;
    p.age = Number($('#p-age').value) || p.age;
    p.days = Number($('#p-days').value);
    p.dumbbellMax = Number($('#p-dbmax').value) || 0;
    p.pullups = Number($('#p-pullups').value) || 0;
    state.settings.step = Number($('#p-step').value) || 2.5;
    if (p.weekdays.length !== p.days) {
      toast(`训练日需要选满 ${p.days} 天（现在 ${p.weekdays.length} 天）`);
      return;
    }
    if (p.startDate && (p.startDate + '').match(/^\d{4}-\d{2}-\d{2}$/)) { /* ok */ }
    save();
    const changed = oldDays !== p.days || oldWd !== p.weekdays.join(',');
    if (changed) {
      if (confirm('训练天数或星期变了，需要用新设置重新生成计划。是否现在重新生成？\n（已有的训练记录会保留）')) {
        state.program = Engine.buildProgram(p, state.program.splitKey, todayIso(), state.program.step);
        save();
      }
    }
    renderAll();
    toast('已保存');
  });

  $('#s-autorest').addEventListener('change', e => { state.settings.autoRest = e.target.checked; save(); });
  $('#s-sound').addEventListener('change', e => { state.settings.sound = e.target.checked; save(); });

  $('#btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `健身计划备份-${todayIso()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#btn-import').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data.profile) throw new Error('格式不对');
        state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), data);
        save();
        renderAll();
        toast('已导入');
      } catch (err) { toast('导入失败：文件格式不对'); }
    };
    r.readAsText(f);
  });
  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('确定清空所有数据？包括档案、计划和训练记录，且无法恢复。')) return;
    localStorage.removeItem(STORE_KEY);
    location.reload();
  });
}

/* ============================================================
 *  全局事件
 * ============================================================ */

function bindGlobal() {
  $$('#f-days .chip').forEach(c => c.addEventListener('click', () => setChip('days', Number(c.dataset.days))));
  $$('#f-exp .chip').forEach(c => c.addEventListener('click', () => setChip('exp', c.dataset.exp)));
  $$('#f-goal .chip').forEach(c => c.addEventListener('click', () => setChip('goal', c.dataset.goal)));
  $$('#f-sex .chip').forEach(c => c.addEventListener('click', () => setChip('sex', c.dataset.sex)));

  $('#f-weekdays').addEventListener('click', e => {
    const b = e.target.closest('[data-wd]');
    if (!b) return;
    const i = Number(b.dataset.wd);
    const need = Number(setupChoice.days);
    const set = new Set(chosenWeekdays);
    if (set.has(i)) set.delete(i);
    else {
      if (set.size >= need) { toast(`只需要选 ${need} 天`); return; }
      set.add(i);
    }
    chosenWeekdays = Array.from(set).sort((a, b) => a - b);
    renderWeekdayPicker();
  });

  $('#btn-build').addEventListener('click', () => {
    const r = collectProfile();
    if (r.error) { toast(r.error); return; }
    renderRecommend(r.profile);
  });

  // 顶部标签
  $$('#tabbar [data-tab]').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.dataset.tab;
      $$('#tabbar [data-tab]').forEach(x => x.classList.toggle('on', x === b));
      $$('.page').forEach(pg => pg.classList.toggle('active', pg.id === 'page-' + t));
      window.scrollTo({ top: 0 });
    });
  });

  $('#btn-rest-skip').addEventListener('click', () => {
    if (restTimer) { clearInterval(restTimer); restTimer = null; }
    $('#restbar').classList.add('hidden');
  });
  $('#btn-rest-add').addEventListener('click', () => { restRemain += 30; paintRest(); });

  // 键盘快捷键：1-5 切换标签
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const map = { '1': 'today', '2': 'plan', '3': 'progress', '4': 'library', '5': 'me' };
    if (map[e.key]) {
      const b = $(`#tabbar [data-tab="${map[e.key]}"]`);
      if (b) b.click();
    }
  });
}
