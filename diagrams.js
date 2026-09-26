/* ============================================================
 *  动作示意图（内联 SVG 火柴人）+ 常见错误 + 安全注意事项 + 视频入口
 *  全部离线自绘，不依赖外部图片；"视频教学"走 B 站搜索（国内可直接打开）
 * ============================================================ */

const DIAGRAM = (() => {
  const L = (a, b, c) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${c}"/>`;
  const C = (p, r, c) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" class="${c}"/>`;
  const DB = p => `<g class="dbell">${C([p[0], p[1] - 6], 3.6, 'dbell-h')}${C([p[0], p[1] + 6], 3.6, 'dbell-h')}${L([p[0], p[1] - 6], [p[0], p[1] + 6], 'dbell-b')}</g>`;
  const ARR = (a, b, id) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="arrow" marker-end="url(#ar-${id})"/>`;

  function s(id, body) {
    return `<svg viewBox="0 0 130 150" class="motion" role="img" aria-label="动作示意图">
      <defs><marker id="ar-${id}" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" class="arrow"/></marker></defs>
      <line x1="5" y1="142" x2="125" y2="142" class="ground"/>
      ${body}
    </svg>`;
  }

  // 侧面火柴人（面向右）
  function side(p, cls) {
    return [
      L(p.ankle, p.toe, cls),                 // 脚
      L(p.hip, p.knee, cls),                  // 大腿
      L(p.knee, p.ankle, cls),                // 小腿
      L(p.shoulder, p.hip, cls),              // 躯干
      L(p.shoulder, p.elbow, cls),            // 大臂
      L(p.elbow, p.wrist, cls),               // 前臂
      C(p.head, 9, cls)                       // 头
    ].join('');
  }
  // 正面火柴人（面向观察者）
  function front(p, cls) {
    const out = [];
    out.push(C(p.head, 9, cls));
    out.push(L(p.shoulder, p.hip, cls));                     // 躯干
    out.push(L(p.hip, p.kneeL, cls)); out.push(L(p.kneeL, p.ankleL, cls));
    out.push(L(p.hip, p.kneeR, cls)); out.push(L(p.kneeR, p.ankleR, cls));
    out.push(L(p.shoulder, p.elbowL, cls)); out.push(L(p.elbowL, p.wristL, cls));
    out.push(L(p.shoulder, p.elbowR, cls)); out.push(L(p.elbowR, p.wristR, cls));
    return out.join('');
  }

  const STAND = { head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [64, 68], wrist: [66, 86] };
  const FIG = { 'pose-start': 'start', 'pose-end': 'end' };

  const P = {};

  /* 深蹲 */
  P.squat = s('squat',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [56, 72], wrist: [61, 80] }, 'pose-start') +
    side({ head: [71, 43], shoulder: [63, 59], hip: [61, 106], knee: [74, 124], ankle: [57, 143], toe: [67, 145], elbow: [63, 88], wrist: [67, 94] }, 'pose-end') +
    DB([61, 80]) + DB([67, 94]) + ARR([56, 90], [61, 106], 'squat'));

  /* 髋铰链（硬拉） */
  P.hinge = s('hinge',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [56, 66], wrist: [54, 86] }, 'pose-start') +
    side({ head: [45, 43], shoulder: [51, 66], hip: [44, 96], knee: [47, 122], ankle: [57, 143], toe: [67, 145], elbow: [46, 86], wrist: [41, 108] }, 'pose-end') +
    DB([54, 86]) + DB([41, 108]) + ARR([59, 53], [51, 66], 'hinge'));

  /* 单腿蹲（分腿） */
  P.lunge = s('lunge',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [64, 68], wrist: [66, 86] }, 'pose-start') +
    side({ head: [71, 40], shoulder: [63, 57], hip: [60, 98], knee: [72, 120], ankle: [76, 143], toe: [85, 145], elbow: [66, 70], wrist: [68, 88] }, 'pose-end') +
    L([60, 98], [50, 133], 'pose-end') + L([50, 133], [46, 143], 'pose-end') +
    DB([66, 86]) + ARR([56, 90], [60, 98], 'lunge'));

  /* 水平推（地板卧推，仰卧） */
  P.push_h = s('push_h',
    L([28, 120], [88, 120], 'pose-start') + L([88, 120], [100, 118], 'pose-start') +   // 躯干+腿
    C([22, 120], 9, 'pose-start') + L([28, 120], [34, 120], 'pose-start') +             // 头+颈
    L([48, 120], [48, 92], 'pose-start') + L([48, 92], [42, 74], 'pose-start') +        // 起势臂
    L([48, 120], [60, 88], 'pose-end') + L([60, 88], [66, 70], 'pose-end') +            // 推起臂
    C([48, 120], 2, 'pose-start') +
    DB([42, 74]) + DB([66, 70]) + ARR([42, 74], [66, 70], 'push_h'));

  /* 垂直推（肩推，侧面） */
  P.push_v = s('push_v',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [60, 66], wrist: [63, 80] }, 'pose-start') +
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [63, 46], wrist: [67, 30] }, 'pose-end') +
    DB([63, 80]) + DB([67, 30]) + ARR([63, 80], [67, 30], 'push_v'));

  /* 垂直拉（引体向上，正面） */
  P.pull_v = s('pull_v',
    L([30, 24], [100, 24], 'bar') +
    front({ head: [65, 68], shoulder: [65, 52], hip: [65, 82], kneeL: [57, 108], ankleL: [57, 136], kneeR: [73, 108], ankleR: [73, 136], elbowL: [49, 40], wristL: [39, 27], elbowR: [81, 40], wristR: [91, 27] }, 'pose-start') +
    front({ head: [65, 56], shoulder: [65, 40], hip: [65, 70], kneeL: [58, 96], ankleL: [58, 128], kneeR: [72, 96], ankleR: [72, 128], elbowL: [49, 34], wristL: [39, 26], elbowR: [81, 34], wristR: [91, 26] }, 'pose-end') +
    ARR([65, 68], [65, 56], 'pull_v'));

  /* 水平拉（划船，侧面） */
  P.pull_h = s('pull_h',
    side({ head: [49, 44], shoulder: [53, 66], hip: [46, 96], knee: [49, 122], ankle: [57, 143], toe: [67, 145], elbow: [56, 74], wrist: [60, 92] }, 'pose-start') +
    side({ head: [49, 44], shoulder: [53, 66], hip: [46, 96], knee: [49, 122], ankle: [57, 143], toe: [67, 145], elbow: [52, 82], wrist: [55, 98] }, 'pose-end') +
    DB([60, 92]) + DB([55, 98]) + ARR([60, 92], [55, 98], 'pull_h'));

  /* 侧平举（正面） */
  P.lateral = s('lateral',
    front({ head: [65, 42], shoulder: [65, 58], hip: [65, 88], kneeL: [57, 116], ankleL: [57, 140], kneeR: [73, 116], ankleR: [73, 140], elbowL: [58, 64], wristL: [42, 66], elbowR: [72, 64], wristR: [88, 66] }, 'pose-start') +
    front({ head: [65, 42], shoulder: [65, 58], hip: [65, 88], kneeL: [57, 116], ankleL: [57, 140], kneeR: [73, 116], ankleR: [73, 140], elbowL: [50, 52], wristL: [34, 44], elbowR: [80, 52], wristR: [96, 44] }, 'pose-end') +
    DB([42, 66]) + DB([34, 44]) + ARR([42, 66], [34, 44], 'lateral'));

  /* 弯举（侧面） */
  P.curl = s('curl',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [56, 72], wrist: [64, 92] }, 'pose-start') +
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [56, 72], wrist: [61, 68] }, 'pose-end') +
    DB([64, 92]) + DB([61, 68]) + ARR([64, 92], [61, 68], 'curl'));

  /* 臂屈伸（侧面，过头） */
  P.ext = s('ext',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [62, 34], wrist: [62, 52] }, 'pose-start') +
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [62, 34], wrist: [68, 48] }, 'pose-end') +
    DB([62, 52]) + DB([68, 48]) + ARR([62, 52], [68, 48], 'ext'));

  /* 核心（正面，悬垂举腿） */
  P.core = s('core',
    L([30, 24], [100, 24], 'bar') +
    front({ head: [65, 66], shoulder: [65, 50], hip: [65, 80], kneeL: [57, 104], ankleL: [57, 134], kneeR: [73, 104], ankleR: [73, 134], elbowL: [49, 40], wristL: [39, 27], elbowR: [81, 40], wristR: [91, 27] }, 'pose-start') +
    front({ head: [65, 66], shoulder: [65, 50], hip: [65, 80], kneeL: [59, 74], ankleL: [61, 90], kneeR: [71, 74], ankleR: [69, 90], elbowL: [49, 40], wristL: [39, 27], elbowR: [81, 40], wristR: [91, 27] }, 'pose-end') +
    ARR([58, 128], [60, 90], 'core'));

  /* 提踵（侧面） */
  P.calf = s('calf',
    side({ head: [67, 34], shoulder: [59, 53], hip: [56, 90], knee: [53, 118], ankle: [57, 143], toe: [67, 145], elbow: [64, 68], wrist: [66, 86] }, 'pose-start') +
    side({ head: [67, 30], shoulder: [59, 49], hip: [56, 86], knee: [53, 114], ankle: [57, 136], toe: [67, 142], elbow: [64, 68], wrist: [66, 86] }, 'pose-end') +
    ARR([67, 34], [67, 30], 'calf'));

  /* 负重行走（正面，静态 + 行走箭头） */
  P.carry = s('carry',
    front({ head: [65, 42], shoulder: [65, 58], hip: [65, 88], kneeL: [57, 116], ankleL: [57, 140], kneeR: [73, 116], ankleR: [73, 140], elbowL: [58, 70], wristL: [52, 88], elbowR: [72, 70], wristR: [78, 88] }, 'pose-end') +
    DB([52, 88]) + DB([78, 88]) +
    ARR([70, 52], [98, 52], 'carry') + ARR([104, 52], [106, 52], 'carry'));

  /* 耸肩（正面） */
  P.trap = s('trap',
    front({ head: [65, 42], shoulder: [65, 60], hip: [65, 88], kneeL: [57, 116], ankleL: [57, 140], kneeR: [73, 116], ankleR: [73, 140], elbowL: [58, 70], wristL: [52, 88], elbowR: [72, 70], wristR: [78, 88] }, 'pose-start') +
    front({ head: [65, 42], shoulder: [65, 54], hip: [65, 88], kneeL: [57, 116], ankleL: [57, 140], kneeR: [73, 116], ankleR: [73, 140], elbowL: [58, 70], wristL: [52, 88], elbowR: [72, 70], wristR: [78, 88] }, 'pose-end') +
    DB([52, 88]) + DB([78, 88]) + ARR([65, 60], [65, 54], 'trap'));

  /* ---------------- 每个模式的文字说明 ---------------- */
  const META = {
    squat: { label: '深蹲',
      caution: ['膝盖始终和脚尖同方向，不要内扣', '腰背挺直，不要弓背；先减重做标准，再谈加重', '脚后跟踩实，重心不稳就减小幅度'],
      errors: ['脚跟离地、重心前移', '只做半蹲、幅度不足', '膝盖内扣'] },
    hinge: { label: '髋铰链（硬拉）',
      caution: ['全程脊柱中立，不要弓背弯腰', '下放靠"屁股往后推"，不是弯腰', '哑铃贴大腿越近越安全'],
      errors: ['圆背弓腰', '过度挺腰后仰', '哑铃离身体太远'] },
    lunge: { label: '单腿蹲',
      caution: ['前膝不要明显超过脚尖太多', '躯干保持稳定，不左右晃', '膝盖不舒服就减小步幅或改后撤步'],
      errors: ['前膝内扣', '重心前倾', '后腿蹬地借力'] },
    push_h: { label: '水平推（卧推）',
      caution: ['手肘约 45-60 度，别完全摊平打开', '下放要控制，别让哑铃砸下去', '没有卧推凳就用地板卧推保护肩'],
      errors: ['手肘外展过大', '耸肩', '腰部过度反弓'] },
    push_v: { label: '垂直推（肩推）',
      caution: ['核心收紧，别用下腰后仰借力', '肩有卡压感就换坐姿或手心朝前 45 度', '从轻重量开始，肩关节最脆弱'],
      errors: ['塌腰后仰借力', '推起时耸肩', '下放幅度不足'] },
    pull_v: { label: '垂直拉（引体）',
      caution: ['不要甩腿借力', '下放要控制，别直接掉下来', '做不了标准引体就先练离心引体'],
      errors: ['靠摆荡借力', '只用手臂、背部没发力', '半程（下巴不过杠）'] },
    pull_h: { label: '水平拉（划船）',
      caution: ['背部保持平直，不弓背', '用背部发力，不要靠身体旋转甩', '腰容易累就改单臂有支撑的划船'],
      errors: ['弓背', '耸肩', '身体旋转借力'] },
    lateral: { label: '侧平举',
      caution: ['重量宁轻勿重，这个动作最怕借力', '抬到与肩齐平就停，不要过肩', '用肘部带动，别耸肩'],
      errors: ['重量过大甩上去', '耸肩', '抬得过高'] },
    curl: { label: '弯举',
      caution: ['手肘固定贴身，别前后晃', '下放到底再弯起，别做半程', '身体不要后仰甩重量'],
      errors: ['手肘前移', '身体摆动借力', '只做半程'] },
    ext: { label: '臂屈伸',
      caution: ['手肘夹紧别外张', '落到头后方要控制，别砸头', '手肘不适就改锤式握法（手心相对）'],
      errors: ['手肘外张', '幅度不够', '肩膀前移'] },
    core: { label: '核心',
      caution: ['全程腹部收紧，别塌腰', '动作慢，别靠惯性', '腰有旧伤优先做死虫式而不是卷腹'],
      errors: ['塌腰', '憋气', '借惯性摆荡'] },
    calf: { label: '提踵',
      caution: ['动作慢，顶端和底端都停一下', '前脚掌踩稳，别打滑', '小腿恢复快，但别一次练到抽筋'],
      errors: ['弹震式上下', '幅度不足', '重心不稳'] },
    carry: { label: '负重行走',
      caution: ['挺胸沉肩，别耸肩含胸', '步子小、走得稳', '选能走稳的重量，别逞强'],
      errors: ['耸肩', '身体歪斜', '步幅过大'] },
    trap: { label: '耸肩',
      caution: ['只做上下，不要绕圈', '顶端停 1 秒', '别用太重的重量代偿'],
      errors: ['绕肩', '用腿借力', '低头缩颈'] }
  };

  function forPattern(key) {
    const svg = P[key] || P.squat;
    const m = META[key] || META.squat;
    return { svg, label: m.label, caution: m.caution, errors: m.errors };
  }

  function videoUrl(name) {
    return 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(name + ' 动作教学');
  }

  return { forPattern, videoUrl, META };
})();
