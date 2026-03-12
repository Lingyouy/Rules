export default async function(ctx) {

  const API = "https://api.qqsuu.cn/api/dm-oilprice";
  const CACHE_KEY = "egern_oil_price_cache";
  const CACHE_TIME = 3600; // 1小时缓存

  let oil92 = "--";
  let oil95 = "--";
  let oil98 = "--";
  let oil0 = "--";
  let province = "China";

  const now = Math.floor(Date.now() / 1000);

  // 读取缓存
  const cache = await ctx.storage.get(CACHE_KEY);

  if (cache && now - cache.time < CACHE_TIME) {
    return render(cache.data);
  }

  try {

    const resp = await ctx.http.get(API, { timeout: 5000 });
    const json = await resp.json();

    if (json && json.data) {

      const data = {
        province: json.data.province || "China",
        oil92: json.data.oil92,
        oil95: json.data.oil95,
        oil98: json.data.oil98,
        oil0: json.data.oil0
      };

      await ctx.storage.set(CACHE_KEY, {
        time: now,
        data: data
      });

      return render(data);

    }

  } catch (e) {

    if (cache) {
      return render(cache.data);
    }

  }

  return render({
    province: province,
    oil92: oil92,
    oil95: oil95,
    oil98: oil98,
    oil0: oil0
  });


  function render(data) {

    return {
      type: "widget",
      padding: 14,
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
          text: data.province,
          font: { size: "caption1" },
          textColor: "#aaaaaa"
        },

        {
          type: "spacer",
          size: 6
        },

        priceLine("92#", data.oil92, "#34C759"),
        priceLine("95#", data.oil95, "#0A84FF"),
        priceLine("98#", data.oil98, "#FFD60A"),
        priceLine("0#", data.oil0, "#ffffff")

      ]
    };
  }


  function priceLine(name, price, color) {

    return {
      type: "hstack",
      children: [

        {
          type: "text",
          text: name,
          font: { size: "body", weight: "medium" },
          textColor: color
        },

        {
          type: "spacer"
        },

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
