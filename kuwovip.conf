#!name= 酷我音乐-仅会员图标
#!desc= 仅显示会员身份与VIP图标，不修改音质、不去广告、不解锁下载
#!author= ChatGPT
#!category= Music
#!version= 1.0.0

[Script]

酷我会员身份 = type=http-response, pattern=^https?:\/\/vip1\.kuwo\.cn\/vip\/(enc\/user\/vip|v2\/user\/vip), script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Kuwo/kuwo.js, requires-body=true, max-size=-1, timeout=60

酷我个人信息会员显示 = type=http-response, pattern=^https?:\/\/vip1\.kuwo\.cn\/commercia\/vipTab\/myTab\/base, script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Kuwo/kuwo.js, requires-body=true, max-size=-1, timeout=60

[MITM]

hostname = %APPEND% vip1.kuwo.cn
