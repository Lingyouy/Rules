export default async function(ctx){

const API="https://e.dlife.cn/user/balance.do"

const CACHE_KEY="ct_cache"
const CACHE_TTL=1800

function now(){
const d=new Date()
return d.getHours().toString().padStart(2,"0")+":"+
d.getMinutes().toString().padStart(2,"0")
}

function formatMB(mb){

if(mb>=1024){
return[(mb/1024).toFixed(2),"GB"]
}

return[Math.floor(mb),"MB"]

}

function render(data){

return{

type:"widget",

padding:12,

children:[

{
type:"text",
text:"📶 中国电信",
font:{size:"headline",weight:"bold"}
},

line("💰 话费",data.fee,"元"),

line("📡 通用流量",data.flow.balance,data.flow.unit),

data.otherFlow?
line("🎯 定向流量",data.otherFlow.balance,data.otherFlow.unit):null,

line("☎️ 剩余语音",data.voice,"分钟"),

{
type:"text",
text:"更新 "+now(),
font:{size:"caption2"}
}

].filter(Boolean)

}

}

function line(name,val,unit){

return{

type:"hstack",

children:[

{type:"text",text:name},

{type:"spacer"},

{type:"text",text:String(val)+" "+unit}

]

}

}

function convert(raw){

const fee=raw.balance||0

const flowMB=raw.flow||0

const voice=raw.voice||0

const [balance,unit]=formatMB(flowMB)

return{

fee:fee,

flow:{balance:balance,unit:unit},

voice:voice

}

}

const cache=await ctx.storage.get(CACHE_KEY)

const nowTime=Date.now()

if(cache && nowTime-cache.time<CACHE_TTL*1000){

return render(cache.data)

}

try{

const r=await ctx.http.get(API)

const j=await r.json()

const data=convert(j)

await ctx.storage.set(CACHE_KEY,{time:nowTime,data:data})

return render(data)

}catch(e){

if(cache){

return render(cache.data)

}

return{

type:"widget",

children:[
{type:"text",text:"电信数据获取失败"}
]

}

}

}
