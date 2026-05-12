#!name= 酷我音乐-尊享会员图标
#!desc= 深度修改会员图标、背景及尊享标识。如果图标未显示，请尝试退出账号重新登录并清理缓存。
#!author= ChatGPT
#!category= Music
#!version= 1.1.0

[Script]
# 拦截VIP状态接口，修改图标及有效期
kuwo_vip = type=http-response, pattern=^https?:\/\/vip1\.kuwo\.cn\/vip\/(enc\/user\/vip|v2\/user\/vip), script-path=https://raw.githubusercontent.com/GideonSenku/scripts/master/kuwo/kuwo.js, requires-body=true, timeout=60

# 拦截个人中心接口，修改会员背景与标识
kuwo_info = type=http-response, pattern=^https?:\/\/vip1\.kuwo\.cn\/commercia\/vipTab\/myTab\/base, script-path=https://raw.githubusercontent.com/GideonSenku/scripts/master/kuwo/kuwo.js, requires-body=true, timeout=60

[MITM]
hostname = %APPEND% vip1.kuwo.cn
