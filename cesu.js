// NetSpeed 小组件（环境变量指定策略组）
// Egern 专用

export default async function(ctx) {

  // =========================
  // 环境变量读取
  // =========================

  // 在小组件环境变量中添加：
  // 名称：policy
  // 值：你的策略组名字

  const POLICY = ctx.env.policy || 'DIRECT';

  // =========================
  // 基础配置
  // =========================

  const MB = 3;

  const BYTES = MB * 1024 * 1024;

  const SPEED_TEST_URL =
    `https://speed.cloudflare.com/__down?bytes=${BYTES}`;

  const CACHE_KEY = `netspeed_cache_${POLICY}`;

  let speedData = {
    mbps: 0,
    mBs: 0,
    duration: 0,
    timestamp: 0
  };

  // =========================
  // 读取缓存
  // =========================

  try {

    const cached = ctx.storage.getJSON(CACHE_KEY);

    if (cached) {
      speedData = cached;
    }

  } catch(e) {}

  // =========================
  // 开始测速
  // =========================

  try {

    const startTime = Date.now();

    await ctx.http.get(SPEED_TEST_URL, {

      headers: {
        'Cache-Control': 'no-cache'
      },

      timeout: 30000,

      // 指定策略组
      policy: POLICY
    });

    const duration =
      (Date.now() - startTime) / 1000;

    const speedMBs = MB / duration;

    const speedMbps = speedMBs * 8;

    speedData = {

      mbps: parseFloat(speedMbps.toFixed(1)),

      mBs: parseFloat(speedMBs.toFixed(2)),

      duration: duration.toFixed(2),

      timestamp: Date.now()
    };

    ctx.storage.setJSON(
      CACHE_KEY,
      speedData
    );

  } catch(e) {

    console.log(
      '测速失败：',
      POLICY,
      e
    );

  }

  // =========================
  // 图标与颜色
  // =========================

  let icon = 'tortoise';

  let color = '#FF9500';

  if (speedData.mbps >= 50) {

    icon = 'bolt.fill';

    color = '#34C759';

  } else if (speedData.mbps >= 10) {

    icon = 'hare.fill';

    color = '#007AFF';

  }

  // =========================
  // 速度条长度
  // =========================

  let barWidth = 30;

  if (speedData.mbps >= 80) {

    barWidth = 140;

  } else if (speedData.mbps >= 50) {

    barWidth = 110;

  } else if (speedData.mbps >= 20) {

    barWidth = 80;

  } else if (speedData.mbps >= 10) {

    barWidth = 55;

  }

  // =========================
  // 时间
  // =========================

  const now = new Date();

  const timeStr =
    `${String(now.getHours()).padStart(2,'0')}:` +
    `${String(now.getMinutes()).padStart(2,'0')}`;

  const isSmall =
    ctx.widgetFamily === 'systemSmall';

  // =========================
  // UI
  // =========================

  return {

    type: 'widget',

    padding: isSmall ? 12 : 16,

    gap: isSmall ? 8 : 12,

    backgroundColor: {
      light: '#FFFFFF',
      dark: '#2C2C2E'
    },

    children: [

      // 顶部
      {
        type: 'stack',

        direction: 'row',

        alignItems: 'center',

        children: [

          {
            type: 'image',

            src: `sf-symbol:${icon}`,

            width: isSmall ? 14 : 16,

            height: isSmall ? 14 : 16,

            color: color
          },

          {
            type: 'text',

            text: ` ${POLICY}`,

            font: {
              size: isSmall
                ? 'caption2'
                : 'caption1',

              weight: 'semibold'
            },

            textColor: color
          },

          { type: 'spacer' },

          {
            type: 'text',

            text: `↻ ${timeStr}`,

            font: {
              size: 'caption2'
            },

            textColor: {
              light: '#8E8E93',
              dark: '#8E8E93'
            }
          }
        ]
      },

      // 主速度
      {
        type: 'stack',

        direction: 'row',

        alignItems: 'center',

        children: [

          { type: 'spacer' },

          {
            type: 'text',

            text:
              `${speedData.mbps} Mbps`,

            font: {
              size: isSmall ? 32 : 44,
              weight: 'bold'
            },

            textColor: color
          },

          { type: 'spacer' }
        ]
      },

      // 速度条
      {
        type: 'stack',

        direction: 'row',

        children: [

          { type: 'spacer' },

          {
            type: 'stack',

            width: barWidth,

            height: 4,

            backgroundColor: color,

            cornerRadius: 2
          },

          { type: 'spacer' }
        ]
      },

      // 底部
      {
        type: 'stack',

        direction: 'row',

        children: [

          {
            type: 'text',

            text:
              `${speedData.mBs} MB/s`,

            font: {
              size: isSmall
                ? 'caption2'
                : 'caption1'
            },

            textColor: {
              light: '#6B6B6B',
              dark: '#A1A1A6'
            }
          },

          { type: 'spacer' },

          {
            type: 'text',

            text:
              `${speedData.duration}s`,

            font: {
              size: isSmall
                ? 'caption2'
                : 'caption1'
            },

            textColor: {
              light: '#6B6B6B',
              dark: '#A1A1A6'
            }
          }
        ]
      }
    ]
  };
}
