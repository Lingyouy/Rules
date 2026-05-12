// ========================================
// 浙江今日油价通知 Pro（稳定版）
// 适用于 Egern / Surge
// 每天 9 点自动通知
// ========================================

const url = "https://api.tianapi.com/oilprice/index?key=83d3b1578beaca97c32d0a1e7c4159e5&prov=浙江";

$httpClient.get(url, function (error, response, data) {

    if (error) {
        $notification.post(
            "⛽ 浙江油价通知",
            "网络请求失败",
            "请检查网络状态"
        );
        return;
    }

    try {

        const res = JSON.parse(data);

        if (!res.newslist || !res.newslist[0]) {
            throw new Error("油价数据为空");
        }

        const oil = res.newslist[0];

        const p92 = oil.p92 || "--";
        const p95 = oil.p95 || "--";
        const p98 = oil.p98 || "--";
        const p0  = oil.p0 || "--";

        const time = oil.time || "今日";

        const text =
`⛽ 浙江今日油价
━━━━━━━━━━

92号汽油：${p92}
95号汽油：${p95}
98号汽油：${p98}
0号柴油：${p0}

📅 更新时间
${time}

━━━━━━━━━━
🚗 安全驾驶 一路平安`;

        $notification.post(
            "⛽ 浙江油价日报",
            "每日 09:00 自动推送",
            text
        );

    } catch (e) {

        $notification.post(
            "⛽ 浙江油价通知",
            "解析失败",
            e.toString()
        );

    }

});
