/* ============================================================
 *  动作库 + 分化模板
 *  器材限定：哑铃、单杠、自重（仅额外允许一个凳子/椅子/沙发/靠垫）
 *  pattern 分类用于生成计划时保证推/拉/腿/核心平衡
 * ============================================================ */

// equip: db = 哑铃, bar = 单杠, bw = 自重
// pattern: squat 深蹲 / hinge 髋铰链 / lunge 单腿 / push_h 水平推 / push_v 垂直推
//          pull_v 垂直拉 / pull_h 水平拉 / lateral 侧后束 / curl 二头 / ext 三头
//          core 核心 / calf 小腿 / carry 负重行走 / trap 斜方
// cls: main 主项（大重量复合） / assist 辅助 / iso 孤立 / core 核心

const EXERCISES = {
  /* ---------------- 腿：深蹲 ---------------- */
  db_goblet: {
    name: '哑铃高脚杯深蹲', en: 'Goblet Squat', equip: 'db', pattern: 'squat', cls: 'main',
    primary: ['股四头肌'], secondary: ['臀大肌', '核心'],
    rest: 120, reps: [6, 10],
    tips: [
      '双手抱住一只哑铃的顶端，哑铃贴胸口，手肘自然下垂',
      '下蹲时膝盖跟脚尖同方向，蹲到大腿平行或略低',
      '全程挺胸，脚后跟不要离地'
    ],
    alts: ['db_goblet_pause', 'db_bulgarian']
  },
  db_goblet_pause: {
    name: '哑铃暂停高脚杯深蹲', en: 'Pause Goblet Squat', equip: 'db', pattern: 'squat', cls: 'main',
    primary: ['股四头肌'], secondary: ['臀大肌', '核心'],
    rest: 120, reps: [6, 8],
    tips: ['在最低点停 2 秒再起身，消除弹震借力', '停留时保持核心绷紧、背部挺直', '重量比普通深蹲轻 10-20%']
  },
  wall_sit: {
    name: '靠墙静蹲', en: 'Wall Sit', equip: 'bw', pattern: 'squat', cls: 'iso',
    primary: ['股四头肌'], secondary: ['臀大肌'],
    rest: 60, reps: [1, 1], timeBased: true, time: [30, 45],
    tips: ['背贴墙，大腿与地面平行，膝盖 90 度', '保持 30-60 秒，正常呼吸不憋气', '重量不够时的补充刺激手段']
  },

  /* ---------------- 腿：髋铰链 ---------------- */
  db_rdl: {
    name: '哑铃罗马尼亚硬拉', en: 'Dumbbell RDL', equip: 'db', pattern: 'hinge', cls: 'main',
    primary: ['腘绳肌', '臀大肌'], secondary: ['下背', '握力'],
    rest: 120, reps: [8, 10],
    tips: [
      '哑铃贴大腿前侧下放，像把屁股往后推，不是弯腰',
      '下放到小腿中部、感觉大腿后侧被拉紧就停',
      '脊柱中立，顶端夹紧臀部但不要过度挺腰'
    ],
    alts: ['db_sldl', 'db_sumo']
  },
  db_sldl: {
    name: '哑铃直腿硬拉', en: 'Dumbbell SLDL', equip: 'db', pattern: 'hinge', cls: 'main',
    primary: ['腘绳肌'], secondary: ['臀大肌', '下背'],
    rest: 120, reps: [8, 10],
    tips: ['膝盖近乎伸直（微屈），靠屈髋下放', '腘绳肌柔韧性差就减小幅度', '感觉是"拉伸"而不是"弯腰"']
  },
  db_sumo: {
    name: '哑铃相扑硬拉', en: 'Sumo Deadlift', equip: 'db', pattern: 'hinge', cls: 'main',
    primary: ['臀大肌', '内收肌'], secondary: ['股四头肌', '下背'],
    rest: 120, reps: [8, 10],
    tips: ['双脚宽于肩，脚尖外展 30-45 度', '哑铃在双腿之间，垂直接近身体', '起身时膝盖主动外推']
  },
  db_hip_thrust: {
    name: '哑铃臀桥（背靠沙发）', en: 'Hip Thrust', equip: 'db', pattern: 'hinge', cls: 'assist',
    primary: ['臀大肌'], secondary: ['腘绳肌'],
    rest: 90, reps: [10, 15],
    tips: ['上背靠在沙发边缘，哑铃压在髋部（垫毛巾）', '顶端用力夹臀 1 秒，收紧下巴', '不要靠腰部发力把身体顶起来']
  },

  /* ---------------- 腿：单腿 ---------------- */
  db_bulgarian: {
    name: '哑铃保加利亚分腿蹲', en: 'Bulgarian Split Squat', equip: 'db', pattern: 'lunge', cls: 'main',
    primary: ['股四头肌', '臀大肌'], secondary: ['核心', '平衡'],
    rest: 90, reps: [8, 12], perSide: true,
    tips: [
      '后脚脚背搭在椅子/沙发上，前脚往前迈一大步',
      '身体略前倾更多练臀，保持直立更多练股四',
      '这是哑铃重量不足时最好的腿部刺激动作，很酸但很值'
    ],
    alts: ['db_lunge', 'db_stepup']
  },
  db_lunge: {
    name: '哑铃箭步蹲', en: 'Dumbbell Lunge', equip: 'db', pattern: 'lunge', cls: 'assist',
    primary: ['股四头肌', '臀大肌'], secondary: ['核心'],
    rest: 90, reps: [10, 14], perSide: true,
    tips: ['后膝轻触地面，前膝不要超过脚尖太多', '躯干保持直立，哑铃自然垂在身体两侧', '走不动就原地做，别憋气']
  },
  db_reverse_lunge: {
    name: '哑铃后撤步箭步蹲', en: 'Reverse Lunge', equip: 'db', pattern: 'lunge', cls: 'assist',
    primary: ['臀大肌', '股四头肌'], secondary: ['核心'],
    rest: 90, reps: [10, 14], perSide: true,
    tips: ['向后迈步，膝盖压力比向前箭步更小', '更适合膝盖有点不舒服的人', '起身时用前脚脚跟发力']
  },
  db_stepup: {
    name: '哑铃上台阶', en: 'Step Up', equip: 'db', pattern: 'lunge', cls: 'assist',
    primary: ['臀大肌', '股四头肌'], secondary: ['平衡'],
    rest: 75, reps: [10, 12], perSide: true,
    tips: ['台阶高度约到膝盖，全程用上面那条腿发力', '不要用下面的腿蹬地借力', '慢下快上，控制离心']
  },

  /* ---------------- 水平推 ---------------- */
  db_floor_press: {
    name: '哑铃地板卧推', en: 'Floor Press', equip: 'db', pattern: 'push_h', cls: 'main',
    primary: ['胸大肌'], secondary: ['肱三头肌', '三角肌前束'],
    rest: 120, reps: [8, 12],
    tips: [
      '躺在地上做，手肘触地即停——天然保护肩膀',
      '哑铃下放时手肘约 45-60 度，别完全摊平',
      '推起时把两个哑铃往中间靠，感受胸部收缩'
    ],
    alts: ['db_bench_press', 'pushup']
  },
  db_bench_press: {
    name: '哑铃平板卧推', en: 'Dumbbell Bench Press', equip: 'db', pattern: 'push_h', cls: 'main',
    primary: ['胸大肌'], secondary: ['肱三头肌', '三角肌前束'],
    rest: 120, reps: [8, 12],
    tips: ['需要平凳或硬床沿；肩胛骨后缩下沉再推', '下放到胸部两侧，手肘略低于肩', '没有凳子就用地板卧推替代']
  },
  db_incline_press: {
    name: '哑铃上斜卧推', en: 'Incline Dumbbell Press', equip: 'db', pattern: 'push_h', cls: 'main',
    primary: ['胸大肌上束'], secondary: ['三角肌前束', '肱三头肌'],
    rest: 120, reps: [8, 12],
    tips: [
      '上半身垫高 30 度左右（靠沙发/床头/瑜伽砖 + 垫子）',
      '角度不要超过 45 度，否则变成肩推',
      '上胸是你穿衣服显壮的关键部位，别省这个动作'
    ],
    alts: ['pushup_feet_up', 'db_floor_press']
  },
  pushup: {
    name: '俯卧撑', en: 'Push-up', equip: 'bw', pattern: 'push_h', cls: 'assist',
    primary: ['胸大肌'], secondary: ['肱三头肌', '核心'],
    rest: 90, reps: [10, 20],
    tips: ['身体一条直线，屁股不要塌也不要翘', '手肘向后 45 度而不是向两侧摊开', '做不动就手撑高（桌子/沙发）降低难度']
  },
  pushup_feet_up: {
    name: '抬脚俯卧撑', en: 'Feet-Elevated Push-up', equip: 'bw', pattern: 'push_h', cls: 'assist',
    primary: ['胸大肌上束'], secondary: ['三角肌前束', '肱三头肌'],
    rest: 90, reps: [8, 15],
    tips: ['双脚放在椅子/沙发上，更多刺激上胸', '越高越难，先从 20-30cm 开始', '核心全程绷紧，别让腰塌下去']
  },
  db_fly: {
    name: '哑铃地板飞鸟', en: 'Floor Fly', equip: 'db', pattern: 'push_h', cls: 'iso',
    primary: ['胸大肌'], secondary: ['三角肌前束'],
    rest: 75, reps: [12, 15],
    tips: ['手肘微屈固定角度，像抱一棵大树', '地面会限制下放幅度，正好保护肩关节', '重量要轻，这是拉伸位的孤立动作']
  },

  /* ---------------- 垂直推 ---------------- */
  db_ohp: {
    name: '哑铃站姿推举', en: 'Standing Overhead Press', equip: 'db', pattern: 'push_v', cls: 'main',
    primary: ['三角肌'], secondary: ['肱三头肌', '核心'],
    rest: 120, reps: [8, 12],
    tips: [
      '推起时收腹夹臀，别用腰后仰借力',
      '哑铃从耳朵两侧往上推到头顶，手肘略在身体前方',
      '坐下做也可以，但站姿对核心要求更高、更实用'
    ],
    alts: ['db_seated_press', 'db_arnold']
  },
  db_seated_press: {
    name: '哑铃坐姿推举', en: 'Seated Dumbbell Press', equip: 'db', pattern: 'push_v', cls: 'main',
    primary: ['三角肌'], secondary: ['肱三头肌'],
    rest: 120, reps: [8, 12],
    tips: ['背靠沙发/墙面，下背有支撑可推更大重量', '下放到耳侧就推起，不用触肩', '肩膀不舒服就把手心改成朝前前方 45 度']
  },
  db_arnold: {
    name: '阿诺德推举', en: 'Arnold Press', equip: 'db', pattern: 'push_v', cls: 'assist',
    primary: ['三角肌'], secondary: ['肱三头肌', '上胸'],
    rest: 100, reps: [10, 12],
    tips: ['起始手心朝向自己，推起过程中旋转到朝前', '旋转要连贯缓慢，不要甩', '重量比普通肩推轻一档']
  },

  /* ---------------- 侧束 / 后束 / 斜方 ---------------- */
  db_lateral: {
    name: '哑铃侧平举', en: 'Lateral Raise', equip: 'db', pattern: 'lateral', cls: 'iso',
    primary: ['三角肌中束'], secondary: ['斜方肌上部'],
    rest: 60, reps: [12, 20],
    tips: [
      '小拇指略高，抬到与肩齐平就停，不要过肩',
      '想象是"肘部带动"向上，不是用手把哑铃提起来',
      '这是让肩变宽、显壮性价比最高的动作，宁可轻也要标准'
    ],
    alts: ['db_lateral_partial']
  },
  db_lateral_partial: {
    name: '哑铃侧平举（下半程）', en: 'Partial Lateral Raise', equip: 'db', pattern: 'lateral', cls: 'iso',
    primary: ['三角肌中束'], secondary: [],
    rest: 60, reps: [15, 25],
    tips: ['只做下半程 0-45 度，用轻重量做高次数', '适合哑铃最轻档还是偏重时使用', '最后 5 次会非常烧，坚持住']
  },
  db_rear_delt: {
    name: '哑铃俯身反向飞鸟', en: 'Bent-Over Reverse Fly', equip: 'db', pattern: 'lateral', cls: 'iso',
    primary: ['三角肌后束'], secondary: ['菱形肌', '中斜方'],
    rest: 60, reps: [12, 20],
    tips: [
      '上半身前倾接近平行地面，背保持平直',
      '手肘微屈，向两侧打开到与肩齐平',
      '后束练好了肩才立体，也避免圆肩驼背'
    ]
  },
  db_shrug: {
    name: '哑铃耸肩', en: 'Dumbbell Shrug', equip: 'db', pattern: 'trap', cls: 'iso',
    primary: ['斜方肌上部'], secondary: ['握力'],
    rest: 60, reps: [12, 15],
    tips: ['只做上下，不要绕圈', '顶端停 1 秒耸肩', '脖子粗一点视觉上更有力量感']
  },

  /* ---------------- 垂直拉（单杠） ---------------- */
  pullup: {
    name: '引体向上（正手）', en: 'Pull-up', equip: 'bar', pattern: 'pull_v', cls: 'main',
    primary: ['背阔肌'], secondary: ['肱二头肌', '下斜方', '核心'],
    rest: 150, reps: [5, 10], amrap: true,
    tips: [
      '正握略宽于肩，从悬垂开始，下巴过杠算一次',
      '启动时先"沉肩"，用背部把身体拉起来，别只用手臂',
      '做不到 5 个就退到离心引体或弹力辅助，不要甩腿'
    ],
    alts: ['eccentric_pullup', 'chinup', 'inverted_row']
  },
  chinup: {
    name: '引体向上（反手）', en: 'Chin-up', equip: 'bar', pattern: 'pull_v', cls: 'main',
    primary: ['背阔肌', '肱二头肌'], secondary: ['核心'],
    rest: 150, reps: [5, 12], amrap: true,
    tips: ['反手与肩同宽，二头参与更多、通常能做更多次', '手肘贴着身体两侧往下拉', '做完还觉得有余力，加做离心控制']
  },
  neutral_pullup: {
    name: '对握引体向上', en: 'Neutral-Grip Pull-up', equip: 'bar', pattern: 'pull_v', cls: 'assist',
    primary: ['背阔肌'], secondary: ['肱肌', '肱二头肌'],
    rest: 150, reps: [5, 12], amrap: true,
    tips: ['用毛巾搭在单杠上做对握，对手腕肩膀最友好', '感受背阔肌"夹住"身体', '肩部有不舒服时优先选这个变式']
  },
  eccentric_pullup: {
    name: '离心引体（5 秒慢放）', en: 'Eccentric Pull-up', equip: 'bar', pattern: 'pull_v', cls: 'assist',
    primary: ['背阔肌'], secondary: ['肱二头肌'],
    rest: 120, reps: [4, 6],
    tips: [
      '跳上去让下巴过杠，然后用 5 秒慢慢放到直臂',
      '这是从 0 个练到第一个引体最快的路径',
      '放的过程要匀速，别一下掉下来'
    ]
  },
  hang: {
    name: '单杠悬垂（计时）', en: 'Dead Hang', equip: 'bar', pattern: 'pull_v', cls: 'iso',
    primary: ['握力', '肩胛稳定'], secondary: ['背阔肌'],
    rest: 60, reps: [1, 1], timeBased: true, time: [30, 60],
    tips: ['双手握杠自然垂挂，目标 30-60 秒', '肩膀主动下沉离开耳朵（主动悬垂）', '引体做不动时用它累积握力和背部张力']
  },
  inverted_row: {
    name: '单杠斜身划船', en: 'Inverted Row', equip: 'bar', pattern: 'pull_h', cls: 'assist',
    primary: ['背阔肌', '菱形肌'], secondary: ['肱二头肌', '核心'],
    rest: 90, reps: [8, 15],
    tips: ['把单杠调低（或脚往前踩），身体后倾，胸口拉到杠', '身体绷直成一条线，屁股不要往下掉', '越接近水平越难，这是引体的最佳入门替代']
  },

  /* ---------------- 水平拉 ---------------- */
  db_row_1arm: {
    name: '单臂哑铃划船', en: 'One-Arm Dumbbell Row', equip: 'db', pattern: 'pull_h', cls: 'main',
    primary: ['背阔肌'], secondary: ['菱形肌', '肱二头肌', '后束'],
    rest: 90, reps: [8, 12], perSide: true,
    tips: [
      '单手撑在椅子/床沿，背保持水平',
      '肘部贴身后拉，把哑铃拉到腰腹位置',
      '顶端停顿 1 秒感受背部收缩，不要靠身体旋转借力'
    ],
    alts: ['db_row_bent', 'inverted_row']
  },
  db_row_bent: {
    name: '哑铃俯身双臂划船', en: 'Bent-Over Row', equip: 'db', pattern: 'pull_h', cls: 'main',
    primary: ['背阔肌', '菱形肌'], secondary: ['肱二头肌', '下背'],
    rest: 100, reps: [8, 12],
    tips: ['屈髋前倾 45 度左右，背部平直', '双手哑铃拉到腹部两侧，肘部贴身', '腰容易累就改做单臂划船（有支撑）']
  },
  db_pullover: {
    name: '哑铃仰卧上拉', en: 'Dumbbell Pullover', equip: 'db', pattern: 'pull_v', cls: 'assist',
    primary: ['背阔肌'], secondary: ['胸大肌', '前锯肌'],
    rest: 90, reps: [10, 15],
    tips: ['仰卧持一只哑铃，手臂微屈从头顶后方拉回胸口', '感受背阔肌被拉长再收缩', '哑铃重量不够时，这是练背宽度很好用的动作']
  },

  /* ---------------- 二头 ---------------- */
  db_curl: {
    name: '哑铃弯举', en: 'Dumbbell Curl', equip: 'db', pattern: 'curl', cls: 'iso',
    primary: ['肱二头肌'], secondary: ['肱肌'],
    rest: 60, reps: [10, 15],
    tips: ['手肘固定在身体两侧不动，只有前臂在动', '下放到底再弯起，别做半程', '身体不要后仰甩重量']
  },
  db_hammer: {
    name: '哑铃锤式弯举', en: 'Hammer Curl', equip: 'db', pattern: 'curl', cls: 'iso',
    primary: ['肱肌', '肱桡肌'], secondary: ['肱二头肌'],
    rest: 60, reps: [10, 15],
    tips: ['手心相对像握锤子，能练到手臂外侧厚度', '通常比普通弯举能多用一点重量', '和普通弯举交替做，手臂围度涨更快']
  },
  db_concentration: {
    name: '哑铃集中弯举', en: 'Concentration Curl', equip: 'db', pattern: 'curl', cls: 'iso',
    primary: ['肱二头肌'], secondary: [],
    rest: 60, reps: [10, 12], perSide: true,
    tips: ['坐姿，手肘抵住大腿内侧，动作幅度最大化', '顶端挤一下二头肌峰', '适合作为手臂训练最后一个动作']
  },
  db_incline_curl: {
    name: '哑铃上斜弯举', en: 'Incline Curl', equip: 'db', pattern: 'curl', cls: 'iso',
    primary: ['肱二头肌'], secondary: [],
    rest: 60, reps: [10, 12],
    tips: ['靠沙发/椅背把身体后倾，让二头肌起始位被拉长', '重量要减，拉伸位更难', '想突破手臂围度瓶颈时很有效']
  },

  /* ---------------- 三头 ---------------- */
  db_oh_ext: {
    name: '哑铃颈后臂屈伸', en: 'Overhead Triceps Extension', equip: 'db', pattern: 'ext', cls: 'iso',
    primary: ['肱三头肌长头'], secondary: [],
    rest: 75, reps: [10, 15],
    tips: ['双手握一只哑铃举过头顶，小臂往后下放', '手肘尽量夹紧不外张', '长头是手臂围度的大头，这个动作不能少']
  },
  db_skull: {
    name: '哑铃仰卧臂屈伸', en: 'Lying Triceps Extension', equip: 'db', pattern: 'ext', cls: 'iso',
    primary: ['肱三头肌'], secondary: [],
    rest: 75, reps: [10, 12],
    tips: ['仰卧，小臂向后弯再伸直，上臂保持不动', '落在额头后方而不是砸向头', '手腕不舒服就用锤式握法（手心相对）']
  },
  bench_dip: {
    name: '凳上臂屈伸', en: 'Bench Dip', equip: 'bw', pattern: 'ext', cls: 'assist',
    primary: ['肱三头肌'], secondary: ['三角肌前束'],
    rest: 75, reps: [10, 20],
    tips: ['手撑椅子边缘，屁股往前离开椅子，屈肘下沉', '下沉到大臂接近平行地面', '想加难度就把脚放远或抬到另一张椅子上']
  },
  db_kickback: {
    name: '哑铃俯身臂屈伸', en: 'Triceps Kickback', equip: 'db', pattern: 'ext', cls: 'iso',
    primary: ['肱三头肌'], secondary: [],
    rest: 60, reps: [12, 15], perSide: true,
    tips: ['俯身，大臂贴紧身体并与地面平行', '只有小臂在动，伸直后停 1 秒', '用很轻的重量就够，重点是挤压']
  },

  /* ---------------- 核心 ---------------- */
  bar_leg_raise: {
    name: '单杠悬垂举腿', en: 'Hanging Leg Raise', equip: 'bar', pattern: 'core', cls: 'core',
    primary: ['腹直肌'], secondary: ['髋屈肌', '握力'],
    rest: 75, reps: [8, 15],
    tips: ['悬挂，用腹部力量把腿抬到水平以上', '不要靠摆荡借力，控制下放', '做不动就做屈膝版本']
  },
  bar_knee_raise: {
    name: '单杠悬垂屈膝举腿', en: 'Hanging Knee Raise', equip: 'bar', pattern: 'core', cls: 'core',
    primary: ['腹直肌'], secondary: ['髋屈肌'],
    rest: 60, reps: [10, 15],
    tips: ['膝盖收向胸口，下腹主动收缩', '身体不要前后晃', '进阶到直腿举腿后再加次数']
  },
  plank: {
    name: '平板支撑', en: 'Plank', equip: 'bw', pattern: 'core', cls: 'core',
    primary: ['腹直肌', '腹横肌'], secondary: ['肩', '臀'],
    rest: 60, reps: [1, 1], timeBased: true, time: [30, 60],
    tips: ['肘在肩正下方，身体一条直线', '夹臀收腹，别塌腰', '能撑 60 秒就改做单腿或加负重']
  },
  dead_bug: {
    name: '死虫式', en: 'Dead Bug', equip: 'bw', pattern: 'core', cls: 'core',
    primary: ['腹横肌'], secondary: [],
    rest: 45, reps: [10, 12], perSide: true,
    tips: ['仰卧，对侧手脚同时缓慢伸出', '下背始终贴地（这是判断标准）', '腰不好的人优先练这个而不是卷腹']
  },
  db_russian: {
    name: '哑铃俄罗斯转体', en: 'Russian Twist', equip: 'db', pattern: 'core', cls: 'core',
    primary: ['腹斜肌'], secondary: ['腹直肌'],
    rest: 45, reps: [12, 20], perSide: true,
    tips: ['身体后倾 45 度，持哑铃左右转体', '转动来自躯干而不是手臂', '腰有伤的人跳过这个动作']
  },
  db_farmer: {
    name: '哑铃农夫行走', en: "Farmer's Walk", equip: 'db', pattern: 'carry', cls: 'core',
    primary: ['握力', '斜方肌'], secondary: ['核心', '前臂'],
    rest: 75, reps: [1, 1], timeBased: true, time: [30, 45],
    tips: ['双手各提一只哑铃，挺胸走 30-45 秒', '肩膀下沉不要耸肩含胸', '同时练握力、斜方和核心，效率很高']
  },

  /* ---------------- 小腿 ---------------- */
  db_calf: {
    name: '哑铃站姿提踵', en: 'Standing Calf Raise', equip: 'db', pattern: 'calf', cls: 'iso',
    primary: ['腓肠肌'], secondary: [],
    rest: 45, reps: [15, 25],
    tips: ['前脚掌踩在书本/台阶边缘，脚跟尽量下沉再提起', '顶端停 1 秒，底端拉伸 1 秒', '小腿恢复快，次数高一点、可以每周练 3 次']
  },
  db_calf_1leg: {
    name: '单腿哑铃提踵', en: 'Single-Leg Calf Raise', equip: 'db', pattern: 'calf', cls: 'iso',
    primary: ['腓肠肌', '比目鱼肌'], secondary: [],
    rest: 45, reps: [12, 20], perSide: true,
    tips: ['单腿站立，单手扶墙保持平衡', '哑铃重量不足时用单腿提高强度', '全程慢速，不要弹震']
  }
};

/* ============================================================
 *  分化模板
 *  freq = 每个肌群每周被刺激的次数（决定增肌效率）
 * ============================================================ */

const SPLITS = {
  full3: {
    key: 'full3',
    name: '全身三分化（A / B / C）',
    short: '全身三分化',
    days: 3,
    freq: 3,
    style: 'frequency',
    tag: '新手首选',
    summary: '三天练三种不同的全身训练，每个肌群一周被刺激 3 次。',
    why: [
      '你 174cm / 59kg，属于偏瘦的增肌型体质，现阶段最大的敌人是"总训练容量不够"而不是"强度不够"',
      '研究结论：在总容量相同的前提下，每个肌群每周练 2-3 次，增肌效果优于只练 1 次',
      '哑铃重量有上限，单次训练很难把某个部位练透，靠提高频率补足刺激更划算',
      '练完 48-72 小时就恢复好，再练一次，生长信号不断档'
    ],
    templates: ['fbA', 'fbB', 'fbC']
  },

  ppl3: {
    key: 'ppl3',
    name: '部位三分化（推 / 拉 / 腿）',
    short: '推拉腿三分化',
    days: 3,
    freq: 1,
    style: 'bodypart',
    tag: '训练 1 年以上再考虑',
    summary: '一天推、一天拉、一天腿，每个部位一周只练 1 次。',
    why: [
      '这是健身房里最流行的三分化，但它是给"训练容量已经很大、必须分开练"的中高级选手设计的',
      '新手每周每个肌群只刺激 1 次，频率太低，增肌效率低于同等的全身三分化',
      '你只有哑铃：胸部一次训练能做的动作和组数有限，全堆在一天里后半段质量会掉',
      '如果你就是喜欢这种练法、练着更有动力，那也可以，但至少练够 2 个循环（6 周）再评估'
    ],
    templates: ['ppPush', 'ppPull', 'ppLegs']
  },

  ul4: {
    key: 'ul4',
    name: '上下肢四分化（上A / 下A / 上B / 下B）',
    short: '上下肢四分化',
    days: 4,
    freq: 2,
    style: 'frequency',
    tag: '能稳定练 4 天就选它',
    summary: '上肢、下肢各练两次，每个肌群一周被刺激 2 次。',
    why: [
      '如果你一周确实能稳定练 4 天，这是性价比最高的选择：频率 2 次/周 + 单次训练时长合理',
      '比部位四分化的优势：每个肌群每周练 2 次，而不是 1 次',
      '每个训练日只有 5-6 个动作，40-50 分钟能完成，容易坚持',
      '注意：一定要"练 4 天"而不是"计划 4 天实际练 2 天"，否则效果不如老老实实练 3 天全身'
    ],
    templates: ['ulUpperA', 'ulLowerA', 'ulUpperB', 'ulLowerB']
  },

  body4: {
    key: 'body4',
    name: '部位四分化（胸 / 背 / 腿 / 肩臂）',
    short: '部位四分化',
    days: 4,
    freq: 1,
    style: 'bodypart',
    tag: '不推荐，但支持',
    summary: '每个部位单独一天，一周只练 1 次。',
    why: [
      '同样是"四分化"，它的效率低于上下肢四分化，因为每个肌群每周只被刺激 1 次',
      '胸日、肩日大量动作重叠（推肩也练胸、卧推也练肩），实际分配并不均匀',
      '器械只有哑铃的情况下，单独一个"胸日"很难排满 5-6 个有效动作，容易变成凑数',
      '除非你非常享受这种练法，否则建议用上下肢四分化'
    ],
    templates: ['bpChest', 'bpBack', 'bpLegs', 'bpShoulderArm']
  }
};

/* ============================================================
 *  训练日模板
 *  slot 用来保证结构平衡：每个部位限制最多几个动作
 * ============================================================ */

const DAY_TEMPLATES = {
  /* ---------- 全身三分化 ---------- */
  fbA: {
    name: '全身 A · 蹲 + 推',
    focus: '腿部主项 + 水平推 + 垂直拉',
    est: 55,
    blocks: [
      { ex: 'db_goblet', sets: 3, note: '主项：全程控制，不要急着加重' },
      { ex: 'db_floor_press', sets: 3, note: '主项：手肘 45-60 度' },
      { ex: 'db_row_1arm', sets: 3, note: '每侧都算一组，两边次数要一样' },
      { ex: 'db_ohp', sets: 3, note: '核心收紧，别后仰' },
      { ex: 'pullup', sets: 3, note: '做不到 5 个就用离心引体替代' },
      { ex: 'plank', sets: 3, note: '结束动作，收紧核心' }
    ]
  },
  fbB: {
    name: '全身 B · 髋铰链 + 上斜推',
    focus: '腘绳肌 + 上胸 + 单杠',
    est: 55,
    blocks: [
      { ex: 'db_rdl', sets: 3, note: '主项：感受大腿后侧被拉长' },
      { ex: 'db_incline_press', sets: 3, note: '主项：垫高 30 度左右' },
      { ex: 'chinup', sets: 3, note: '反手通常能做更多次' },
      { ex: 'db_lateral', sets: 3, note: '轻重量，肘部带动' },
      { ex: 'db_bulgarian', sets: 3, note: '每侧轮换，重心在前脚' },
      { ex: 'bar_knee_raise', sets: 3, note: '控制下放，不摆荡' }
    ]
  },
  fbC: {
    name: '全身 C · 单腿 + 水平拉',
    focus: '单腿力量 + 背部厚度 + 手臂',
    est: 55,
    blocks: [
      { ex: 'db_bulgarian', sets: 3, note: '主项：哑铃不足时靠它提高腿部强度' },
      { ex: 'db_row_bent', sets: 3, note: '主项：背保持平直' },
      { ex: 'pushup_feet_up', sets: 3, note: '做不动就用普通俯卧撑' },
      { ex: 'db_rear_delt', sets: 3, note: '后束，改善圆肩' },
      { ex: 'db_hammer', sets: 3, note: '和颈后臂屈伸组成超级组，省时间' },
      { ex: 'db_oh_ext', sets: 3, note: '超级组第二项：三头长头' },
      { ex: 'db_farmer', sets: 2, note: '握力 + 核心收尾' }
    ]
  },

  /* ---------- 推拉腿 ---------- */
  ppPush: {
    name: '推日 · 胸肩三头',
    focus: '所有推类动作',
    est: 55,
    blocks: [
      { ex: 'db_floor_press', sets: 4, note: '主项' },
      { ex: 'db_ohp', sets: 4, note: '主项' },
      { ex: 'db_incline_press', sets: 3, note: '上胸' },
      { ex: 'db_lateral', sets: 3, note: '中束' },
      { ex: 'db_oh_ext', sets: 3, note: '三头' },
      { ex: 'bench_dip', sets: 3, note: '三头收尾' }
    ]
  },
  ppPull: {
    name: '拉日 · 背二头后束',
    focus: '所有拉类动作',
    est: 55,
    blocks: [
      { ex: 'pullup', sets: 4, note: '主项' },
      { ex: 'db_row_1arm', sets: 4, note: '主项' },
      { ex: 'db_pullover', sets: 3, note: '背阔拉伸' },
      { ex: 'db_rear_delt', sets: 3, note: '后束' },
      { ex: 'db_curl', sets: 3, note: '二头' },
      { ex: 'db_hammer', sets: 3, note: '二头外侧' },
      { ex: 'bar_leg_raise', sets: 3, note: '核心收尾' }
    ]
  },
  ppLegs: {
    name: '腿日 · 下肢',
    focus: '股四头肌 / 臀 / 腘绳 / 小腿',
    est: 55,
    blocks: [
      { ex: 'db_goblet', sets: 4, note: '主项' },
      { ex: 'db_rdl', sets: 4, note: '主项' },
      { ex: 'db_bulgarian', sets: 3, note: '单腿' },
      { ex: 'db_hip_thrust', sets: 3, note: '臀' },
      { ex: 'db_calf', sets: 4, note: '小腿' },
      { ex: 'db_farmer', sets: 2, note: '收尾' }
    ]
  },

  /* ---------- 上下肢四分化 ---------- */
  ulUpperA: {
    name: '上肢 A · 水平推主导',
    focus: '胸 + 背 + 肩 + 手臂',
    est: 50,
    blocks: [
      { ex: 'db_floor_press', sets: 4, note: '主项：本周期的推类核心动作' },
      { ex: 'db_row_1arm', sets: 4, note: '主项：每侧一组，先做力量弱的那侧' },
      { ex: 'db_ohp', sets: 3, note: '肩推' },
      { ex: 'pullup', sets: 3, note: '引体' },
      { ex: 'db_lateral', sets: 3, note: '中束' },
      { ex: 'db_curl', sets: 3, note: '和臂屈伸组成超级组' },
      { ex: 'db_skull', sets: 3, note: '超级组第二项' }
    ]
  },
  ulLowerA: {
    name: '下肢 A · 深蹲主导',
    focus: '股四头肌 + 臀 + 核心',
    est: 45,
    blocks: [
      { ex: 'db_goblet', sets: 4, note: '主项' },
      { ex: 'db_rdl', sets: 3, note: '髋铰链' },
      { ex: 'db_bulgarian', sets: 3, note: '每侧' },
      { ex: 'db_calf', sets: 4, note: '小腿' },
      { ex: 'plank', sets: 3, note: '核心' }
    ]
  },
  ulUpperB: {
    name: '上肢 B · 垂直拉主导',
    focus: '背 + 上胸 + 后束 + 手臂',
    est: 50,
    blocks: [
      { ex: 'pullup', sets: 4, note: '主项：今天从引体开始，趁最有劲' },
      { ex: 'db_incline_press', sets: 4, note: '主项：上胸' },
      { ex: 'db_row_bent', sets: 3, note: '背部厚度' },
      { ex: 'db_rear_delt', sets: 3, note: '后束' },
      { ex: 'db_lateral_partial', sets: 3, note: '中束补量' },
      { ex: 'db_hammer', sets: 3, note: '二头' },
      { ex: 'db_oh_ext', sets: 3, note: '三头长头' }
    ]
  },
  ulLowerB: {
    name: '下肢 B · 髋铰链主导',
    focus: '臀 + 腘绳 + 小腿 + 腹',
    est: 45,
    blocks: [
      { ex: 'db_rdl', sets: 4, note: '主项' },
      { ex: 'db_lunge', sets: 3, note: '每侧' },
      { ex: 'db_hip_thrust', sets: 3, note: '臀部集中刺激' },
      { ex: 'db_calf_1leg', sets: 3, note: '小腿' },
      { ex: 'bar_leg_raise', sets: 3, note: '腹部' }
    ]
  },

  /* ---------- 部位四分化 ---------- */
  bpChest: {
    name: '胸日',
    focus: '胸大肌',
    est: 45,
    blocks: [
      { ex: 'db_floor_press', sets: 4, note: '主项' },
      { ex: 'db_incline_press', sets: 4, note: '上胸' },
      { ex: 'db_fly', sets: 3, note: '孤立' },
      { ex: 'pushup', sets: 3, note: '到力竭前一两次' },
      { ex: 'bench_dip', sets: 3, note: '下胸 + 三头' }
    ]
  },
  bpBack: {
    name: '背日',
    focus: '背阔肌 + 中背',
    est: 50,
    blocks: [
      { ex: 'pullup', sets: 4, note: '主项' },
      { ex: 'db_row_1arm', sets: 4, note: '主项' },
      { ex: 'db_row_bent', sets: 3, note: '厚度' },
      { ex: 'db_pullover', sets: 3, note: '宽度' },
      { ex: 'db_shrug', sets: 3, note: '斜方' },
      { ex: 'bar_leg_raise', sets: 3, note: '核心' }
    ]
  },
  bpLegs: {
    name: '腿日',
    focus: '股四 / 臀 / 腘绳 / 小腿',
    est: 50,
    blocks: [
      { ex: 'db_goblet', sets: 4, note: '主项' },
      { ex: 'db_rdl', sets: 4, note: '主项' },
      { ex: 'db_bulgarian', sets: 3, note: '每侧' },
      { ex: 'db_lunge', sets: 3, note: '每侧' },
      { ex: 'db_calf', sets: 4, note: '小腿' }
    ]
  },
  bpShoulderArm: {
    name: '肩 + 手臂日',
    focus: '三角肌 / 二头 / 三头',
    est: 45,
    blocks: [
      { ex: 'db_ohp', sets: 4, note: '主项' },
      { ex: 'db_lateral', sets: 4, note: '中束' },
      { ex: 'db_rear_delt', sets: 3, note: '后束' },
      { ex: 'db_curl', sets: 3, note: '超级组' },
      { ex: 'db_oh_ext', sets: 3, note: '超级组' },
      { ex: 'db_concentration', sets: 3, note: '二头峰' }
    ]
  }
};

/* 热身流程（每个训练日通用） */
const WARMUP = [
  '3-5 分钟轻有氧：开合跳 / 原地高抬腿 / 跳绳（心率上来即可）',
  '肩部绕环 10 次 × 前后各一次，肩胛骨画圈 10 次',
  '猫咪驼背 10 次，髋关节绕环 10 次/侧，踝关节绕环 10 次/侧',
  '第一组前用 50% 重量做 10 次热身组（不计入正式组数）'
];

/* 训练后放松 */
const COOLDOWN = [
  '走路或慢跑 3 分钟让心率降下来',
  '胸大肌 / 背阔肌 / 髋屈肌 各静态拉伸 30 秒',
  '训练后 1 小时内吃一顿含蛋白 + 碳水的正餐'
];
