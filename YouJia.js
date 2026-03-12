export default async function(ctx) {

  const API = "https://api.qqsuu.cn/api/dm-oilprice";
  const CACHE_KEY = "oil_price_cache";
  const CACHE_TIME = 3600;

  const now = Date.now();
  let cache = await ctx.storage.get(CACHE_KEY);

  if (cache && now - cache.time < CACHE_TIME * 1000) {
    return render(cache.data);
  }

  try {

    const resp = await ctx.http.get(API, { timeout: 5000 });
    const json = await resp.json();

    if (json && json.data) {

      const data = {
        province: json.data.province || "中国",
        oil92: json.data.oil92,
        oil95: json.data.oil95,
        oil98: json.data.oil98,
        oil0: json.data.oil0
      };

      await ctx.storage.set(CACHE_KEY, {
        time: now,
        data
      });

      return render(data);

    }

  } catch (e) {}

  if (cache) {
    return render(cache.data);
  }

  return render({
    province: "中国",
    oil92: "--",
    oil95: "--",
    oil98: "--",
    oil0: "--"
  });

  function render(d) {

    return {
      type: "widget",
      padding: 12,
      backgroundColor: "#1c1c1e",
      children: [

        {
          type: "text",
          text: "⛽ 今日油价",
          font: { size: "headline", weight: "bold" },
          textColor: "#ffffff"
        },

        {
          type: "text",
          text: d.province,
          font: { size: "caption1" },
          textColor: "#aaaaaa"
        },

        line("92#", d.oil92),
        line("95#", d.oil95),
        line("98#", d.oil98),
        line("0#", d.oil0)

      ]
    };

  }

  function line(name, price) {

    return {
      type: "hstack",
      children: [

        {
          type: "text",
          text: name,
          font: { size: "body" },
          textColor: "#0A84FF"
        },

        { type: "spacer" },

        {
          type: "text",
          text: price,
          font: { size: "body", weight: "bold" },
          textColor: "#ffffff"
        }

      ]
    };

  }

}
