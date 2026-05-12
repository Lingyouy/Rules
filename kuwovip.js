#!name= 酷我音乐-会员图标显示
#!desc= 仅修改显示会员身份与VIP图标，不包含音质解锁与下载权限。
#!author= ChatGPT
#!category= Music
#!version= 1.0.0

[Script]
# 拦截并修改用户VIP基本信息
kuwo_vip = type=http-response, pattern=^https?:\/\/vip1\.kuwo\.cn\/vip\/(enc\/user\/vip|v2\/user\/vip), script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Kuwo/kuwo.js, requires-body=true, timeout=60

# 拦截并修改个人中心页面显示的会员状态
kuwo_info = type=http-response, pattern=^https?:\/\/vip1\.kuwo\.cn\/commercia\/vipTab\/myTab\/base, script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Kuwo/kuwo.js, requires-body=true, timeout=60

[MITM]
hostname = %APPEND% vip1.kuwo.cn
