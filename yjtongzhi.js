// ========================================
// 浙江今日油价通知 Pro
// 适用于 Egern / Surge 兼容环境
// 每天 9 点运行即可
// ========================================

const API = "https://api.qqsuu.cn/api/dm-oilprice?prov=浙江";

const ICON_UP = "📈";
const ICON_DOWN = "📉";
const ICON_OIL = "⛽";

$httpClient.get(API, function (error, response, data) {

    if (error) {
        $notification.post(
            "⛽ 浙江油价通知",
            "获取失败",
            "请检查网络或接口状态"
        );
        return;
    }

    try {

        const res = JSON.parse(data);

        if (!res || !res.data) {
            throw new Error("接口数据异常");
        }

        const oil = res.data;

        // 当前油价
        const p92 = oil.p92 || "--";
        const p95 = oil.p95 || "--";
        const p98 = oil.p98 || "--";
        const p0 = oil.p0 || "--";

        // 时间
        const time = oil.time || "今日";

        // 涨跌
        let trend = "";
        let trendIcon = "";

        if (oil.change) {

            const change = oil.change.toString();

            if (change.includes("-")) {
                trendIcon = ICON_DOWN;
                trend = `${trendIcon} 今日下调 ${change} 元`;
            } else if (
                change !== "0" &&
                change !== "0.00"
            ) {
                trendIcon = ICON_UP;
                trend = `${trendIcon} 今日上涨 ${change} 元`;
            } else {
                trend = "⏸ 今日无调整";
            }

        } else {
            trend = "📊 实时油价";
        }

        // 通知正文
        const message =
`${ICON_OIL} 浙江今日油价

92号汽油：${p92}
95号汽油：${p95}
98号汽油：${p98}
0号柴油：${p0}

${trend}`;

        $notification.post(
            "⛽ 浙江油价提醒",
            `🕘 更新时间：${time}`,
            message
        );

    } catch (e) {

        $notification.post(
            "⛽ 浙江油价通知",
            "解析失败",
            e.toString()
        );

    }

});
