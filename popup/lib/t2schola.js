const T2Schola = {
	token: undefined,
	
	updateToken: async function() {
		console.log("T2Schola: updateToken");
		const response = await fetch("https://t2schola.titech.ac.jp/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=14029&urlscheme=mmt2schola");
		if (response.url.match("portal.nap.gsic.titech.ac.jp")) {
			throw new Error("東工大ポータルにログインしてから、再度ボタンを押してください。");
		}
		const launchapp = new DOMParser().parseFromString(await response.text(), "text/html").getElementById("launchapp");
		const token_unformat = launchapp.href.match(/^mmt2schola\:\/\/token=(.*)$/)[1];
		const token = atob(token_unformat).split(":::")[1];
		this.token = token;
		chrome.storage.sync.set({ token });
	},
	
	wsfunction: async function(wsfunction, query) {
		console.log(`T2Schola: ${wsfunction}`);
		try {
			const response = await fetch(`https://t2schola.titech.ac.jp/webservice/rest/server.php?${
				new URLSearchParams({
					moodlewsrestformat: "json",
					wstoken: this.token,
					wsfunction,
					...query
				})
			}`, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			});
			const result = await response.json();
			if (result.errorcode === "invalidtoken") {
				throw new Error(result.errorcode);
			}
			return result;
		} catch(e) {
			try {
				await this.updateToken();
				return this.wsfunction(wsfunction, query);
			} catch (e) {
				throw e;
			}
		}
	},
};
