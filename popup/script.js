(async () => {
	T2Schola.token = (await chrome.storage.local.get("token")).token;
	Tasks.courses = (await chrome.storage.local.get("courses")).courses || [];
	Tasks.tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	Tasks.submission = (await chrome.storage.local.get("submission")).submission || [];
	Tasks.lastupdate = (await chrome.storage.local.get("lastupdate")).lastupdate;
	Calender.calender = (await chrome.storage.local.get("calender")).calender;
	Calender.quarterIndex = (await chrome.storage.local.get("quarterIndex")).quarterIndex || 0;
	
	const username = (await chrome.storage.local.get("username")).username?.slice(0, 3);
	document.getElementById("iframe").src = `https://bb.xrea.jp/titech/embed/?ver=${chrome.runtime.getManifest().version}${chrome.runtime.id !== "odfihbhakcfillnjihnjhilbpjmhnhml"? "&test=true" : ""}${username? `&user=${username}` : ""}`;
	drawTasks();
	drawCalender();
})();

document.getElementById("tasks_reflesh").onclick = async () => {
	try {
		setLoading(true);
		chrome.storage.local.set({ username: (await T2Schola.wsfunction("core_webservice_get_site_info")).username });
		await Tasks.updateTasks();
		await Tasks.updateSubmission();
		drawTasks();
	} catch(e) {
		alert(`課題の取得に失敗しました。\n${e.message}`);
	} finally {
		setLoading(false);
	}
};

document.getElementById("calender_reflesh").onclick = async () => {
	try {
		setLoading(true);
		await Calender.update();
		drawCalender();
	} catch(e) {
		alert(`時間割の取得に失敗しました。\n${e.message}`);
	} finally {
		setLoading(false);
	}
};

document.getElementById("tasks_switch").onclick = () => {
	Tasks.showSubmitted = !Tasks.showSubmitted;
	drawTasks();
	document.getElementById("tasks_switch").innerHTML = Tasks.showSubmitted? "未提出の課題を表示" : "提出済みの課題を表示";
};

document.getElementById("footer_about").onclick = () => {
	chrome.tabs.create({ url: "https://bb.xrea.jp/titech/" });
};

document.getElementById("footer_contact").onclick = () => {
	chrome.tabs.create({ url: "https://bb.xrea.jp/titech/#contact" });
};
