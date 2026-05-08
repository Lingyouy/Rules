/** 万年历 - iOS 仿图定制版
*/

export default async function(ctx) {
  // --- 基础日期数据 ---
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const date = now.getDate();
  const day = now.getDay();

  // --- 农历与节气数据 (简化版用于演示，建议配合完整农历库) ---
  const lunarDays = ['十七', '青年节', '立夏', '二十', '廿一', '廿二', '廿三'];
  const hasDot = [false, true, true, false, false, true, false]; // 模仿图片中的紫色小点

  const family = ctx.widgetFamily || 'systemMedium';
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // 颜色定义 (模仿图片中的深色模式)
  const colors = {
    bg: '#1A1A1A',
    cardBg: '#2C2C2E',
    todayRed: '#E94E4E',
    textMain: '#FFFFFF',
    textSub: '#A0A0A0',
    dotPurple: '#BF5AF2'
  };

  // --- 组件构建 ---
  
  // 顶部标题: 2026 / 5
  const header = {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    padding: [12, 16, 0, 16],
    children: [
      { type: 'text', text: '〈', font: { size: 14 }, textColor: colors.textSub },
      { type: 'spacer' },
      { type: 'text', text: `${year} / ${month + 1}`, font: { size: 18, weight: 'bold' }, textColor: colors.textMain },
      { type: 'spacer' },
      { type: 'text', text: '〉', font: { size: 14 }, textColor: colors.textSub }
    ]
  };

  // 星期行
  const weekRow = {
    type: 'stack',
    direction: 'row',
    padding: [10, 12, 5, 12],
    children: weekdays.map(wd => ({
      type: 'stack',
      flex: 1,
      alignItems: 'center',
      children: [{ type: 'text', text: wd, font: { size: 11 }, textColor: colors.textMain }]
    }))
  };

  // 日期行 (对应图片中的 3-9日)
  const daysRow = {
    type: 'stack',
    direction: 'row',
    padding: [0, 12, 10, 12],
    children: [3, 4, 5, 6, 7, 8, 9].map((d, index) => {
      const isToday = d === 8;
      return {
        type: 'stack',
        flex: 1,
        direction: 'column',
        alignItems: 'center',
        children: [
          {
            type: 'stack',
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isToday ? colors.todayRed : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            children: [
              { type: 'text', text: String(d), font: { size: 16, weight: 'bold' }, textColor: colors.textMain }
            ]
          },
          { type: 'spacer', length: 2 },
          { 
            type: 'text', 
            text: lunarDays[index], 
            font: { size: 9 }, 
            textColor: isToday ? colors.todayRed : colors.textSub 
          },
          {
            type: 'stack',
            direction: 'row',
            gap: 2,
            children: hasDot[index] ? [
              { type: 'text', text: '●', font: { size: 4 }, textColor: colors.dotPurple },
              { type: 'text', text: '●', font: { size: 4 }, textColor: colors.dotPurple }
            ] : []
          }
        ]
      };
    })
  };

  // 底部详情栏
  const footer = {
    type: 'stack',
    direction: 'row',
    padding: [12, 16, 12, 16],
    children: [
      {
        type: 'stack',
        width: 2,
        height: 14,
        backgroundColor: colors.todayRed,
        borderRadius: 1
      },
      { type: 'spacer', length: 8 },
      { 
        type: 'text', 
        text: '5月8日 第18周 丙午(马)年 三月廿二', 
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
          { type: 'spacer', length: 1, backgroundColor: '#3A3A3C', margin: [0, 16, 0, 16] }, // 分割线
          footer
        ]
      }
    ]
  };
}
