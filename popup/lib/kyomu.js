const Kyomu = {
	fetch: async function(url) {
		console.log(`Kyomu: fetch ${url}`);
		const response = await fetch(url);
		if (response.url.match("portal.nap.gsic.titech.ac.jp")) {
			throw new Error("一度教務Webシステムを開いてから、再度ボタンを押してください。");
		}
		if (response.url === "https://kyomu0.gakumu.titech.ac.jp/Titech/Maintenance.aspx") {
			throw new Error("教務webシステムのメンテナンス中です。")
		}
		if (response.url === "https://kyomu0.gakumu.titech.ac.jp/Titech/Student/%e5%ad%a6%e7%94%9f%e6%83%85%e5%a0%b1/PID4_1.aspx") {
			throw new Error("学生基本情報の更新が必要です。")
		}
		return new DOMParser().parseFromString(await response.text(), "text/html");
	},
};
