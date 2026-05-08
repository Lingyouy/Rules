export default async function(ctx) {

  // =========================
  // 环境变量
  // =========================
  // 名称：POLICY
  // 值：你的策略组名字
  // 例如：
  // POLICY = 日本时延优选

  const policy = ctx.env.POLICY || "";

  const widgetFamily = ctx.widgetFamily || 'systemMedium';

  const BG_COLOR = { light: '#FFFFFF', dark: '#2C2C2E' };
  const C_TITLE = { light: '#1A1A1A', dark: '#FFD700' };
  const C_SUB = { light: '#666666', dark: '#B0B0B0' };
  const C_MAIN = { light: '#1A1A1A', dark: '#FFFFFF' };
  const C_GREEN = { light: '#32D74B', dark: '#32D74B' };
  const C_YELLOW = { light: '#FFD60A', dark: '#FFD60A' };
  const C_ORANGE = { light: '#FF9500', dark: '#FF9500' };
  const C_RED = { light: '#FF3B30', dark: '#FF3B30' };
  const C_ICON = { light: '#007AFF', dark: '#0A84FF' };

  if (['systemSmall', 'accessoryCircular', 'accessoryInline', 'accessoryRectangular'].includes(widgetFamily)) {
    return {
      type: 'widget',
      padding: 16,
      backgroundColor: BG_COLOR,
      children: [{
        type: 'text',
        text: '请使用中号或大号组件',
        font: { size: 'callout' },
        textColor: C_MAIN,
        textAlign: 'center'
      }]
    };
  }

  const BASE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

  // =========================
  // 通用请求
  // =========================

  async function get(url, headers, useProxy = true) {

    const opts = {
      timeout: 6000
    };

    if (headers) opts.headers = headers;

    if (useProxy && policy && policy !== "DIRECT") {
      opts.policy = policy;
    }

    const res = await ctx.http.get(url, opts);

    return await res.text();
  }

  async function post(url, body, headers, useProxy = true) {

    const opts = {
      timeout: 6000,
      body: body
    };

    if (headers) opts.headers = headers;

    if (useProxy && policy && policy !== "DIRECT") {
      opts.policy = policy;
    }

    const res = await ctx.http.post(url, opts);

    return await res.text();
  }

  async function getRaw(url, headers, extraOpts, useProxy = true) {

    const opts = {
      timeout: 6000
    };

    if (headers) opts.headers = headers;

    if (useProxy && policy && policy !== "DIRECT") {
      opts.policy = policy;
    }

    if (extraOpts) Object.assign(opts, extraOpts);

    return await ctx.http.get(url, opts);
  }

  function jp(s) {
    try {
      return JSON.parse(s);
    } catch (e) {
      return null;
    }
  }

  function ti(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  }

  // =========================
  // ChatGPT
  // =========================

  async function checkChatGPT() {

    try {

      const headRes = await getRaw(
        "https://chatgpt.com",
        { "User-Agent": BASE_UA },
        { redirect: 'manual' },
        true
      );

      const webAccessible = !!headRes;

      const iosRes = await getRaw(
        "https://ios.chat.openai.com",
        { "User-Agent": BASE_UA },
        null,
        true
      );

      const iosBody = iosRes ? await iosRes.text() : "";

      let cfDetails = "";

      try {
        cfDetails = jp(iosBody)?.cf_details || "";
      } catch (e2) {}

      const appBlocked =
        !iosBody ||
        iosBody.includes("blocked_why_headline") ||
        iosBody.includes("unsupported_country_region_territory") ||
        cfDetails.includes("(1)") ||
        cfDetails.includes("(2)");

      const appAccessible = !!iosBody && !appBlocked;

      if (!webAccessible && !appAccessible) return "Cross";

      if (appAccessible && !webAccessible) return "APP";

      if (webAccessible && appAccessible) {

        const traceTxt = await get(
          "https://chatgpt.com/cdn-cgi/trace",
          null,
          true
        );

        const tm = traceTxt
          ? traceTxt.match(/loc=([A-Z]{2})/)
          : null;

        if (tm && tm[1]) return tm[1];

        return "OK";
      }

      return "Cross";

    } catch (e) {
      return "Cross";
    }
  }

  // =========================
  // Gemini
  // =========================

  async function checkGemini() {

    try {

      const bodyRaw =
        'f.req=[["K4WWud","[[0],[\\"en-US\\"]]",null,"generic"]]';

      const txt = await post(
        'https://gemini.google.com/_/BardChatUi/data/batchexecute',
        bodyRaw,
        {
          "User-Agent": BASE_UA,
          "Accept-Language": "en-US",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        true
      );

      if (!txt) return "Cross";

      let m = txt.match(/"countryCode"\s*:\s*"([A-Z]{2})"/i);

      if (m && m[1]) return m[1].toUpperCase();

      return "OK";

    } catch (e) {
      return "Cross";
    }
  }

  // =========================
  // YouTube
  // =========================

  async function checkYouTube() {

    try {

      const body = await get(
        'https://www.youtube.com/premium',
        {
          "User-Agent": BASE_UA,
          "Accept-Language": "en"
        },
        true
      );

      if (!body) return "Cross";

      if (body.includes('www.google.cn')) return "CN";

      const isNotAvailable =
        body.includes('Premium is not available in your country') ||
        body.includes('YouTube Premium is not available');

      const m = body.match(/"contentRegion"\s*:\s*"?([A-Z]{2})"?/);

      const region =
        m && m[1]
          ? m[1].toUpperCase()
          : null;

      const isAvailable =
        body.includes('ad-free') ||
        body.includes('Ad-free');

      if (isNotAvailable) return "Cross";

      if (isAvailable && region) return region;

      if (isAvailable && !region) return "OK";

      if (region) return region;

      return "Cross";

    } catch (e) {
      return "Cross";
    }
  }

  // =========================
  // Netflix
  // =========================

  async function checkNetflix() {

    try {

      const titles = [
        "https://www.netflix.com/title/81280792",
        "https://www.netflix.com/title/70143836"
      ];

      const fetchTitle = async (url) => {
        try {
          return await get(
            url,
            { "User-Agent": BASE_UA },
            true
          );
        } catch (e) {
          return "";
        }
      };

      const bodies = await Promise.all([
        fetchTitle(titles[0]),
        fetchTitle(titles[1])
      ]);

      const t1 = bodies[0];
      const t2 = bodies[1];

      if (!t1 && !t2) return "Cross";

      const oh1 = /oh no!/i.test(t1 || "");
      const oh2 = /oh no!/i.test(t2 || "");

      if (oh1 && oh2) return "Popcorn";

      const allBodies = [t1, t2];

      for (let b of allBodies) {

        if (!b) continue;

        const rm =
          b.match(/"countryCode"\s*:\s*"?([A-Z]{2})"?/);

        if (rm && rm[1]) return rm[1];
      }

      return "OK";

    } catch (e) {
      return "Cross";
    }
  }

  // =========================
  // TikTok
  // =========================

  async function checkTikTok() {

    try {

      let body1 = await get(
        "https://www.tiktok.com/",
        { "User-Agent": BASE_UA },
        true
      );

      let m1 =
        body1
          ? body1.match(/"region"\s*:\s*"([A-Z]{2})"/)
          : null;

      if (m1 && m1[1]) return m1[1];

      if (body1) return "OK";

      return "Cross";

    } catch (e) {
      return "Cross";
    }
  }

  // =========================
  // 本地IP（强制直连）
  // =========================

  let lIp = "获取失败";
  let lLoc = "未知位置";
  let lIsp = "未知运营商";

  try {

    const lRes = await ctx.http.get(
      'https://myip.ipip.net/json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 3000,
        policy: "DIRECT"
      }
    );

    const body = JSON.parse(await lRes.text());

    if (body?.data) {

      lIp = body.data.ip || "获取失败";

      const locArr = body.data.location || [];

      const country = locArr[0] || "";

      const getFlagEmoji = (country) => {
        if (country.includes("中国")) return "🇨🇳";
        if (country.includes("日本")) return "🇯🇵";
        if (country.includes("美国")) return "🇺🇸";
        if (country.includes("香港")) return "🇭🇰";
        if (country.includes("台湾")) return "🇹🇼";
        if (country.includes("澳门")) return "🇲🇴";
        if (country.includes("新加坡")) return "🇸🇬";
        if (country.includes("韩国")) return "🇰🇷";
        return "📍";
      };

      lLoc =
        `${getFlagEmoji(country)} ${locArr[1] || ""} ${locArr[2] || ""}`.trim();

      lIsp = locArr[4] || locArr[3] || "未知";
    }

  } catch (e) {}

  // =========================
  // 落地IP（走策略组）
  // =========================

  let nIp = "获取失败";
  let nLoc = "未知位置";
  let nativeText = "未知";

  try {

    const res = await ctx.http.get(
      'https://my.ippure.com/v1/info',
      {
        timeout: 4000,
        policy: policy
      }
    );

    const d = JSON.parse(await res.text());

    nIp = d.ip || "获取失败";

    let code = d.countryCode || "";

    const flag =
      code
        ? String.fromCodePoint(
            ...code.toUpperCase()
              .split('')
              .map(c => 127397 + c.charCodeAt())
          )
        : "🌍";

    nLoc =
      `${flag} ${d.country || ""} ${d.city || ""}`.trim();

    nativeText =
      d.isResidential === true
        ? "🏠 原生住宅"
        : "🏢 商业机房";

  } catch (e) {}

  // =========================
  // 解锁
  // =========================

  const [
    gptStatus,
    geminiStatus,
    youtubeStatus,
    netflixStatus,
    tiktokStatus
  ] = await Promise.all([
    checkChatGPT(),
    checkGemini(),
    checkYouTube(),
    checkNetflix(),
    checkTikTok()
  ]);

  // =========================
  // UI
  // =========================

  function UnlockRow(name, status) {

    const ok =
      status !== "Cross" &&
      status !== "CN";

    return {
      type: 'stack',
      direction: 'row',
      children: [
        {
          type: 'text',
          text: name,
          font: { size: 12, weight: 'bold' },
          textColor: C_MAIN
        },
        { type: 'spacer' },
        {
          type: 'text',
          text: status,
          font: { size: 12, weight: 'bold' },
          textColor: ok ? C_GREEN : C_RED
        }
      ]
    };
  }

  const now = new Date();

  const timeStr =
    `${String(now.getHours()).padStart(2,'0')}:` +
    `${String(now.getMinutes()).padStart(2,'0')}`;

  return {

    type: 'widget',

    padding: 12,

    backgroundColor: BG_COLOR,

    children: [

      // 标题
      {
        type: 'stack',
        direction: 'row',
        children: [

          {
            type: 'text',
            text: `数据中心 (${policy || "DIRECT"})`,
            font: {
              size: 16,
              weight: 'heavy'
            },
            textColor: C_TITLE
          },

          { type: 'spacer' },

          {
            type: 'text',
            text: timeStr,
            font: { size: 12 },
            textColor: C_SUB
          }
        ]
      },

      // 本地信息
      {
        type: 'text',
        text: `本地IP：${lIp}`,
        font: { size: 13 },
        textColor: C_MAIN
      },

      {
        type: 'text',
        text: `本地位置：${lLoc}`,
        font: { size: 13 },
        textColor: C_MAIN
      },

      {
        type: 'text',
        text: `本地运营商：${lIsp}`,
        font: { size: 13 },
        textColor: C_MAIN
      },

      // 落地信息
      {
        type: 'text',
        text: `落地IP：${nIp}`,
        font: {
          size: 13,
          weight: 'bold'
        },
        textColor: C_GREEN
      },

      {
        type: 'text',
        text: `落地位置：${nLoc}`,
        font: { size: 13 },
        textColor: C_MAIN
      },

      {
        type: 'text',
        text: `原生属性：${nativeText}`,
        font: { size: 13 },
        textColor: C_MAIN
      },

      {
        type: 'stack',
        height: 8
      },

      UnlockRow("GPT", gptStatus),
      UnlockRow("Gemini", geminiStatus),
      UnlockRow("YouTube", youtubeStatus),
      UnlockRow("Netflix", netflixStatus),
      UnlockRow("TikTok", tiktokStatus)

    ]
  };
}
