export default async function(ctx) {

  const API = "https://api.vvhan.com/api/oil";
  const CACHE = "oil_cache";

  let cache = await ctx.storage.get(CACHE);

  try {

    const resp = await ctx.http.get(API);
    const json = await resp.json();

    const data = {
      province: "中国",
      oil92: json.oil92,
      oil95: json.oil95,
      oil98: json.oil98,
      oil0: json.oil0
    };

    await ctx.storage.set(CACHE, data);

    return render(data);

  } catch(e) {

    if(cache){
      return render(cache);
    }

  }

  function render(d){

    return {

      type:"widget",
      padding:12,

      children:[

        {
          type:"text",
          text:"⛽ 今日油价",
          font:{size:"headline",weight:"bold"}
        },

        line("92#",d.oil92),
        line("95#",d.oil95),
        line("98#",d.oil98),
        line("0#",d.oil0)

      ]

    }

  }

  function line(name,price){

    return {

      type:"hstack",

      children:[

        {type:"text",text:name},

        {type:"spacer"},

        {type:"text",text:price}

      ]

    }

  }

}
