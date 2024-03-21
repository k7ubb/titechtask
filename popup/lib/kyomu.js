const Kyomu = {
	fetch: async function(url) {
		console.log(`Kyomu: fetch ${url}`);
		const response = await fetch(url);
		if (response.url.match("portal.nap.gsic.titech.ac.jp")) {
			throw new Error("一度教務webを開いてください");
		}
		return new DOMParser().parseFromString(await response.text(), "text/html");
	},
};
