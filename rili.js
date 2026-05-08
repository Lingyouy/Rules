/** * 万年历 - iOS 仿图定制自动更新版
 */

export default async function(ctx) {
  // --- 1. 核心农历算法数据 ---
  const lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
  ];

  // --- 2. 辅助计算函数 ---
  function getLunarDate(dObj) {
    let baseDate = new Date(Date.UTC(1900, 0, 31));
    let objDate = new Date(Date.UTC(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()));
    let offset = Math.floor((objDate - baseDate) / 86400000);
    let y, m, i, days = 0;
    const lYearDays = (y) => {
      let sum = 348;
      for (let i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y-1900] & i) ? 1 : 0;
      let leap = (lunarInfo[y-1900] & 0xf) ? ((lunarInfo[y-1900] & 0x10000) ? 30 : 29) : 0;
      return sum + leap;
    };
    const leapMonth = (y) => lunarInfo[y-1900] & 0xf;
    const monthDays = (y, m) => (lunarInfo[y-1900] & (0x10000 >> m)) ? 30 : 29;

    for (y = 1900; y < 2050 && offset > 0; y++) { days = lYearDays(y); offset -= days; }
    if (offset < 0) { offset += days; y--; }
    let leap = leapMonth(y), isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === (leap + 1) && !isLeap) { --i; isLeap = true; days = (lunarInfo[y-1900] & 0x10000) ? 30 : 29; }
      else { days = monthDays(y, i); }
      if (isLeap && i === (leap + 1)) isLeap = false;
      offset -= days;
    }
    if (offset === 0 && leap > 0 && i === leap + 1) { if (isLeap) isLeap = false; else { isLeap = true; --i; } }
    if (offset < 0) { offset += days; --i; }
    return { year: y, month: i, day: offset + 1, isLeap };
  }

  const lunarMonths = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
  const lunarDaysStr = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
  const Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const Shu = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

  function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }

  // --- 3. 初始化当前日期与本周数据 ---
  const now = new Date();
  const todayDate = now.getDate();
  const todayDay = now.getDay(); // 0是周日

  // 计算本周的起始日期（周日）
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - todayDay);

  const colors = {
    bg: '#000000',
    cardBg: '#1C1C1E',
    todayRed: '#E94E4E',
    textMain: '#FFFFFF',
    textSub: '#8E8E93',
    dotPurple: '#BF5AF2'
  };

  // --- 4. 构建 UI 组件 ---
  
  // 顶部标题
  const header = {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    padding: [12, 16, 0, 16],
    children: [
      { type: 'text', text: '〈', font: { size: 14 }, textColor: colors.textSub },
      { type: 'spacer' },
      { type: 'text', text: `${now.getFullYear()} / ${now.getMonth() + 1}`, font: { size: 18, weight: 'bold' }, textColor: colors.textMain },
      { type: 'spacer' },
      { type: 'text', text: '〉', font: { size: 14 }, textColor: colors.textSub }
    ]
  };

  // 星期表头
  const weekRow = {
    type: 'stack',
    direction: 'row',
    padding: [10, 12, 5, 12],
    children: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(wd => ({
      type: 'stack', flex: 1, alignItems: 'center',
      children: [{ type: 'text', text: wd, font: { size: 11 }, textColor: colors.textMain }]
    }))
  };

  // 动态生成本周 7 天
  const daysRow = {
    type: 'stack',
    direction: 'row',
    padding: [0, 12, 10, 12],
    children: Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const l = getLunarDate(d);
      
      return {
        type: 'stack',
        flex: 1,
        direction: 'column',
        alignItems: 'center',
        children: [
          {
            type: 'stack',
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: isToday ? colors.todayRed : 'transparent',
            alignItems: 'center', justifyContent: 'center',
            children: [{ type: 'text', text: String(d.getDate()), font: { size: 15, weight: 'bold' }, textColor: colors.textMain }]
          },
          { type: 'spacer', length: 2 },
          { 
            type: 'text', 
            text: l.day === 1 ? lunarMonths[l.month-1] : lunarDaysStr[l.day-1], 
            font: { size: 9 }, 
            textColor: isToday ? colors.todayRed : colors.textSub 
          },
          // 模拟图片中的紫色点（如果是初一或者特定日子显示）
          {
            type: 'stack', direction: 'row', gap: 2,
            children: (l.day % 7 === 0) ? [
              { type: 'text', text: '●', font: { size: 4 }, textColor: colors.dotPurple },
              { type: 'text', text: '●', font: { size: 4 }, textColor: colors.dotPurple }
            ] : []
          }
        ]
      };
    })
  };

  // 底部详情
  const lToday = getLunarDate(now);
  const gzYear = Gan[(lToday.year - 4) % 10] + Zhi[(lToday.year - 4) % 12];
  const sx = Shu[(lToday.year - 4) % 12];
  
  const footer = {
    type: 'stack',
    direction: 'row',
    padding: [12, 16, 12, 16],
    children: [
      { type: 'stack', width: 2, height: 14, backgroundColor: colors.todayRed, borderRadius: 1 },
      { type: 'spacer', length: 8 },
      { 
        type: 'text', 
        text: `${now.getMonth()+1}月${now.getDate()}日 第${getWeekNumber(now)}周 ${gzYear}(${sx})年 ${lunarMonths[lToday.month-1]}${lunarDaysStr[lToday.day-1]}`, 
        font: { size: 12 }, 
        textColor: colors.textMain 
      }
    ]
  };

  return {
    type: 'widget',
    backgroundColor: colors.bg,
    children: [
      {
        type: 'stack',
        direction: 'column',
        backgroundColor: colors.cardBg,
        margin: 12,
        borderRadius: 22,
        children: [
          header,
          weekRow,
          daysRow,
          { type: 'spacer', length: 1, backgroundColor: '#3A3A3C', margin: [0, 16, 0, 16] },
          footer
        ]
      }
    ]
  };
}
