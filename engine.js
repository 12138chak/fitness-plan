/* ============================================================
 *  训练学引擎
 *  1) 身体指标 / 营养建议
 *  2) 分化推荐（三分化 vs 四分化）
 *  3) 周期化训练计划生成（4 周一个中周期）
 *  4) 起始重量估算 + 渐进超负荷规则
 * ============================================================ */

const Engine = (() => {

  /* ---------------- 1. 身体指标 ---------------- */

  function metrics(p) {
    const h = p.height / 100;
    const bmi = p.weight / (h * h);

    const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'female' ? -161 : 5);
    // 活动系数：按每周训练天数粗略上浮
    const actFactor = [1.35, 1.42, 1.48, 1.53, 1.58][Math.min(4, Math.max(0, p.days - 2))] || 1.45;
    const tdee = bmr * actFactor;
    const kcal = Math.round((tdee + 350) / 10) * 10;

    const protein = Math.round(p.weight * 2.0);
    const fat = Math.round(p.weight * 0.9);
    const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));

    // 目标体重：BMI 22.5 左右是偏瘦体型增肌的合理中段目标
    const goalWeightLow = Math.round(22.0 * h * h);
    const goalWeightHigh = Math.round(23.5 * h * h);
    const needGain = Math.max(0, goalWeightLow - p.weight);
    // 新手前 3 个月：0.35 kg/周是可持续的增重速度
    const weeks = needGain > 0 ? Math.ceil(needGain / 0.35) : 0;

    let verdict, verdictDetail;
    if (bmi < 18.5) {
      verdict = '偏瘦';
      verdictDetail = '你的第一优先级是"吃够"，训练只是给身体一个"该长肉"的信号。热量不够，练得再好也不长。';
    } else if (bmi < 21) {
      verdict = '偏瘦但有基础';
      verdictDetail = '目前处于适合高效增肌的区间——体脂不高，增重的每一公斤都更容易是肌肉。';
    } else if (bmi < 24) {
      verdict = '正常';
      verdictDetail = '体重正常，可以按标准增肌节奏推进，注意观察腰围变化。';
    } else {
      verdict = '偏重';
      verdictDetail = '建议先保持热量平衡，用力量训练做身体重组，而不是先大量增重。';
    }

    return {
      bmi: +bmi.toFixed(1), bmr: Math.round(bmr), tdee: Math.round(tdee), kcal,
      protein, fat, carb, verdict, verdictDetail,
      goalWeightLow, goalWeightHigh, needGain, weeks,
      gainPerWeek: 0.35,
      weekly: {
        surplus: 350,
        weightTarget: '每周增加 0.25-0.4 kg'
      }
    };
  }

  /* ---------------- 2. 分化推荐 ---------------- */

  /**
   * 推荐逻辑（按优先级）：
   *  a. 每周能稳定训练的天数——执行率 > 理论上限
   *  b. 训练经验——新手需要更高频率
   *  c. 器材限制——哑铃重量上限低，单次训练容量受限
   */
  function recommendSplit(p) {
    const days = p.days;
    const isBeginner = p.exp === 'beginner';
    const limitedEquipment = true; // 只有哑铃 + 单杠

    const primaryKey = days >= 4 ? 'ul4' : 'full3';
    const alternativeKey = days >= 4 ? 'full3' : 'ul4';

    const reasons = [];

    if (days >= 4) {
      reasons.push(`你选了一周 ${days} 天，所以推荐「上下肢四分化」：每个肌群每周练 2 次，单次训练 45 分钟左右，比一次性练全身更容易坚持。`);
    } else {
      reasons.push(`你选了一周 ${days} 天，所以推荐「全身三分化」：每个肌群每周被刺激 3 次，这是新手在训练天数有限时增肌效率最高的排法。`);
    }
    reasons.push('依据：在每周总组数相同的前提下，同一肌群分散到每周 2-3 次训练，增肌与增力效果都优于集中到 1 次。');

    if (isBeginner) {
      reasons.push('你是新手：神经适应快、恢复能力强，但单次训练的"可承受容量"有限，靠提高频率积累训练量最划算。');
    }
    if (limitedEquipment) {
      reasons.push('器材只有哑铃和单杠：哑铃重量有天花板，很难在一天里用大重量把某个部位彻底练透，所以更要用频率补足刺激。');
    }
    reasons.push(`你的体重 ${p.weight} kg、BMI ${(p.weight / Math.pow(p.height / 100, 2)).toFixed(1)}：当前最缺的是"总训练容量 + 热量盈余"，不是极限强度，所以不追求力竭、不追求大重量更安全也更有效。`);

    const notRecommended = [];
    if (days >= 4) {
      notRecommended.push('部位四分化（胸/背/腿/肩臂）：每个肌群每周只练 1 次，频率过低，且肩与胸的动作高度重叠，哑铃条件下很难排出 4 个不凑数的训练日。');
      notRecommended.push('推拉腿三分化：对新手频率偏低，而且你一周能练 4 天，没必要压成 3 天。');
    } else {
      notRecommended.push('推拉腿三分化 / 部位四分化：同样是"练 3 天"，每个肌群每周只被刺激 1 次，增肌效率低于全身三分化。这是健美选手在容量过大后的拆分方式，不是新手的最优解。');
    }

    return {
      primaryKey,
      alternativeKey,
      reasons,
      notRecommended,
      fallbackNote: days >= 4
        ? '如果这周只能练 3 天：直接跳过「下肢 B」，改成练 3 天（上下肢上下循环里去掉最后一个下肢日），不要改成一周只练 2 天。'
        : '如果你临时多出一天：把它当成"技术日"，做引体、臀桥、侧平举和核心，不要额外加一组大重量深蹲。'
    };
  }

  /* ---------------- 3. 起始重量估算 ---------------- */

  // 倍数 = 相对体重的起始负荷系数（单只哑铃重量，或自重动作的等效难度）
  const LOAD_TABLE = {
    db_goblet: [0.22, 'goblet'],
    db_goblet_pause: [0.18, 'goblet'],
    db_rdl: [0.17, 'perHand'],
    db_sldl: [0.15, 'perHand'],
    db_sumo: [0.19, 'perHand'],
    db_hip_thrust: [0.28, 'single'],
    db_bulgarian: [0.13, 'perHand'],
    db_lunge: [0.11, 'perHand'],
    db_reverse_lunge: [0.11, 'perHand'],
    db_stepup: [0.11, 'perHand'],
    db_floor_press: [0.14, 'perHand'],
    db_bench_press: [0.14, 'perHand'],
    db_incline_press: [0.12, 'perHand'],
    db_fly: [0.07, 'perHand'],
    db_ohp: [0.11, 'perHand'],
    db_seated_press: [0.12, 'perHand'],
    db_arnold: [0.09, 'perHand'],
    db_lateral: [0.055, 'perHand'],
    db_lateral_partial: [0.07, 'perHand'],
    db_rear_delt: [0.05, 'perHand'],
    db_shrug: [0.25, 'perHand'],
    db_row_1arm: [0.20, 'single'],
    db_row_bent: [0.16, 'perHand'],
    db_pullover: [0.20, 'single'],
    db_curl: [0.10, 'perHand'],
    db_hammer: [0.12, 'perHand'],
    db_concentration: [0.11, 'single'],
    db_incline_curl: [0.08, 'perHand'],
    db_oh_ext: [0.16, 'single'],
    db_skull: [0.09, 'perHand'],
    db_kickback: [0.06, 'perHand'],
    db_russian: [0.12, 'single'],
    db_farmer: [0.22, 'perHand'],
    db_calf: [0.20, 'perHand'],
    db_calf_1leg: [0.14, 'single']
  };

  function roundTo(value, step) {
    return Math.max(step, Math.round(value / step) * step);
  }

  function startWeight(exId, p, step) {
    const entry = LOAD_TABLE[exId];
    if (!entry) return null;
    let [factor, mode] = entry;
    if (p.exp === 'intermediate') factor *= 1.25;
    if (p.exp === 'advanced') factor *= 1.5;
    if (p.sex === 'female') factor *= 0.7;
    let kg = p.weight * factor;
    // 有哑铃训练经验的人，用他报的"能舒适完成 8 次的重量"校正
    if (p.dumbbellMax && p.dumbbellMax > 0) {
      kg = Math.min(kg, p.dumbbellMax * 0.75);
    }
    return { kg: roundTo(kg, step), mode };
  }

  /* ---------------- 4. 周期化参数 ---------------- */

  const WEEKS = [
    {
      n: 1, label: '第 1 周 · 适应', deload: false, setAdj: 0, rpe: 7,
      repPos: 'low',
      instruction: '这周的任务是"找重量"：每组做完还应该能多做 3 次。所有动作记录下实际用的重量，之后每周都跟这一周对比。',
      overload: '重量保持，把动作做标准'
    },
    {
      n: 2, label: '第 2 周 · 加次', deload: false, setAdj: 0, rpe: 7.5,
      repPos: 'mid',
      instruction: '同样的重量，每组比上周多做 1-2 次。如果上周某一组就已经到了次数区间上限，那这周直接加一档重量。',
      overload: '同重量 +1~2 次，或 +1 档重量'
    },
    {
      n: 3, label: '第 3 周 · 冲量', deload: false, setAdj: 1, rpe: 8.5,
      repPos: 'high',
      instruction: '主项多加 1 组，尽量在次数区间上限完成。所有组都到上限并且感觉还能再做 1-2 次，下次就加重。这一周会最累，正常。',
      overload: '主项 +1 组 / +1 档重量'
    },
    {
      n: 4, label: '第 4 周 · 减载', deload: true, setAdj: -1, rpe: 6,
      repPos: 'low',
      instruction: '主动减量周：组数减少，重量降到上周的 80%。这不是退步，是让身体超量恢复，下周才有劲打破纪录。第 4 周结束后，下一个周期用第 3 周的最大重量重新开始。',
      overload: '重量 ×0.8，享受轻松'
    }
  ];

  // 新周期开始时的重量推进幅度（相对上一周期第 3 周）
  const BLOCK_STEP = { beginner: 1.05, intermediate: 1.08, advanced: 1.1 };

  /* ---------------- 5. 计划生成 ---------------- */

  function applyWeek(block, week) {
    let sets = block.sets + week.setAdj;
    // 孤立动作不加组，避免小肌群过量
    const ex = EXERCISES[block.ex];
    // 孤立动作、核心、小腿不加组：这几个部位加了容易恢复不过来
    if (week.setAdj > 0 && ex && (ex.cls === 'iso' || ex.cls === 'core' || ex.pattern === 'calf')) sets = block.sets;
    sets = Math.max(2, Math.min(5, sets));

    const [lo, hi] = ex ? ex.reps : [8, 12];
    let reps, timeRange = null;

    if (ex && ex.timeBased) {
      // 计时类动作（平板支撑、悬垂、农夫行走）按秒推进，而不是按次数
      const base = ex.time || [30, 45];
      if (week.repPos === 'low') timeRange = [base[0], base[0] + 10];
      else if (week.repPos === 'mid') timeRange = [base[0] + 10, base[1]];
      else timeRange = [base[1], base[1] + 15];
      timeRange = [Math.min(90, Math.round(timeRange[0])), Math.min(120, Math.round(timeRange[1]))];
      reps = [1, 1];
    } else if (week.repPos === 'low') {
      reps = [lo, Math.min(hi, lo + 1)];
    } else if (week.repPos === 'mid') {
      const mid = Math.round((lo + hi) / 2);
      reps = [Math.max(lo, mid - 1), Math.max(lo + 1, mid + 1)];
    } else {
      reps = [Math.max(lo, hi - 2), hi];
    }

    return {
      sets,
      reps,
      timeRange,
      rpe: week.rpe,
      rest: ex ? ex.rest : 90,
      timeBased: !!(ex && ex.timeBased),
      perSide: !!(ex && ex.perSide),
      amrap: !!(ex && ex.amrap)
    };
  }

  /**
   * 根据用户当前引体能力调整计划：
   * 还做不了引体的人，直接给离心引体，而不是让他对着"5-10 次"发愁。
   */
  function adaptPull(block, week, p) {
    if (!block.amrap) return block;
    const n = Math.max(0, p.pullups || 0);
    if (n === 0) {
      const ex = EXERCISES.eccentric_pullup;
      const wk = applyWeek({ ex: 'eccentric_pullup', sets: block.sets, note: '' }, week);
      return {
        ...block, exId: 'eccentric_pullup', name: ex.name, en: ex.en,
        primary: ex.primary, secondary: ex.secondary, tips: ex.tips, alts: ex.alts || [],
        cls: ex.cls, suggest: null, suggestMode: null,
        planNote: '你还做不了标准引体，所以自动换成离心引体：跳上去让下巴过杠，然后用 5 秒慢慢放下。做到能连续完成 3 个离心，就开始试标准引体。',
        ...wk
      };
    }
    // 有能力的人：按当前水平定次数目标，而不是死板的 5-10 次
    let reps;
    if (week.repPos === 'low') reps = [Math.max(1, n - 1), n];
    else if (week.repPos === 'mid') reps = [Math.max(2, n - 1), n + 1];
    else reps = [n, n + 2];
    return { ...block, reps, name: block.name, planNote: block.planNote + `（以你现在能做 ${n} 个为基础定的目标）` };
  }

  function buildProgram(p, splitKey, startDate, blockNo) {
    const split = SPLITS[splitKey];
    const dayTemplates = split.templates.map((t, i) => ({
      idx: i,
      template: t,
      weekday: p.weekdays[i]
    }));
    return {
      splitKey,
      splitName: split.name,
      startDate,
      step: blockNo || 1,        // 第几个中周期（不是重量档位）
      blockLength: 4,
      goal: p.goal,
      dayTemplates,
      createdAt: new Date().toISOString(),
      weeks: WEEKS.map(w => ({ ...w }))
    };
  }

  /**
   * 计算某个日期应该练什么。
   * 以"计划生效后第几个训练日"来推算，而不是死板按周几，
   * 这样漏练一天后不会错位。
   */
  function sessionForDate(state, dateStr) {
    const prog = state.program;
    if (!prog) return null;

    const start = new Date(prog.startDate + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    if (target < start) return { status: 'before', date: dateStr };

    const daysSinceStart = Math.floor((target - start) / 86400000);
    const weekIndex = Math.floor(daysSinceStart / 7) + 1;

    // 一周内的第几天（0=起始日所在周的第0天）
    const dow = ((start.getDay() + daysSinceStart) % 7);
    const slotIdx = prog.dayTemplates.findIndex(t => t.weekday === dow);

    const cycle = Math.floor((weekIndex - 1) / prog.blockLength) + 1;
    const weekInBlock = ((weekIndex - 1) % prog.blockLength) + 1;
    const weekDef = prog.weeks[weekInBlock - 1];

    if (slotIdx === -1) {
      const next = nextSession(state, dateStr);
      return { status: 'rest', date: dateStr, weekIndex, weekInBlock, weekDef, cycle, next };
    }

    const dt = prog.dayTemplates[slotIdx];
    const tpl = DAY_TEMPLATES[dt.template];
    const blocks = tpl.blocks.map(b => {
      const ex = EXERCISES[b.ex];
      const wk = applyWeek(b, weekDef);
      const sw = startWeight(b.ex, state.profile, state.settings.step);
      const base = {
        exId: b.ex,
        name: ex.name,
        en: ex.en,
        equip: ex.equip,
        primary: ex.primary,
        secondary: ex.secondary,
        tips: ex.tips,
        alts: ex.alts || [],
        cls: ex.cls,
        pattern: ex.pattern,
        planNote: b.note,
        ...wk,
        suggest: sw ? sw.kg : null,
        suggestMode: sw ? sw.mode : null
      };
      return adaptPull(base, weekDef, state.profile);
    });

    return {
      status: 'train',
      date: dateStr,
      weekIndex, weekInBlock, weekDef, cycle,
      slotIdx,
      template: dt.template,
      name: tpl.name,
      focus: tpl.focus,
      est: tpl.est,
      blocks,
      logKey: `${dateStr}`
    };
  }

  /** 下一次训练日（含今天之后的） */
  function nextSession(state, fromDate) {
    const base = new Date(fromDate + 'T00:00:00');
    for (let i = 1; i <= 14; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      const s = sessionForDate(state, iso(d));
      if (s && s.status === 'train') return { date: iso(d), name: s.name };
    }
    return null;
  }

  /** 整个中周期（4 周 × 训练日）的清单，用于"计划"页 */
  function blockOverview(state) {
    const prog = state.program;
    if (!prog) return [];
    const out = [];
    const start = new Date(prog.startDate + 'T00:00:00');
    for (let i = 0; i < 7 * prog.blockLength; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const s = sessionForDate(state, iso(d));
      if (s && s.status === 'train') out.push(s);
    }
    return out;
  }

  /* ---------------- 工具 ---------------- */

  function iso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const WEEKDAY_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  /** 统计信息：连续打卡、总训练次数、本周容量 */
  function stats(state) {
    const logs = state.logs || {};
    const keys = Object.keys(logs).sort();
    let total = 0, volume = 0, sets = 0;
    keys.forEach(k => {
      const l = logs[k];
      if (!l.completed) return;
      total++;
      (l.entries || []).forEach(e => {
        (e.sets || []).forEach(s => {
          sets++;
          if (s.w && s.r) volume += s.w * s.r;
        });
      });
    });
    // 连续打卡（允许休息日，只看训练日是否漏练）
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      const k = iso(d);
      const s = sessionForDate(state, k);
      if (!s || s.status !== 'train') continue;
      if (logs[k] && logs[k].completed) streak++;
      else if (i === 0) continue; // 今天还没练不算断
      else break;
    }
    return { total, volume: Math.round(volume), sets, streak };
  }

  return {
    metrics, recommendSplit, buildProgram, sessionForDate, nextSession,
    blockOverview, stats, startWeight, iso, WEEKDAY_CN, WEEKS, SPLITS, BLOCK_STEP
  };
})();
