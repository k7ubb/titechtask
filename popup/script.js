(async () => {
	T2Schola.token = (await chrome.storage.local.get("token")).token;
	Tasks.courses = (await chrome.storage.local.get("courses")).courses || [];
	Tasks.tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	Tasks.submission = (await chrome.storage.local.get("submission")).submission || [];
	Tasks.lastupdate = (await chrome.storage.local.get("lastupdate")).lastupdate;
	Calender.calender = (await chrome.storage.local.get("calender")).calender;
	Calender.quarterIndex = (await chrome.storage.local.get("quarterIndex")).quarterIndex || 0;
	drawTasks();
	drawCalender();
})();

document.getElementById("tasks_reflesh").onclick = async () => {
	try {
		await Tasks.updateTasks();
		drawTasks();
		await Tasks.updateSubmission();
		drawTasks();
	} catch(e) {
		console.error(e);
		alert("課題の取得に失敗しました。\nTokyo Tech Portalにログインしてから、再度実行してください。");
	}
};

document.getElementById("calender_reflesh").onclick = async () => {
	try {
		await Calender.update();
		drawCalender();
	} catch(e) {
		console.error(e);
		alert("時間割の取得に失敗しました。\n一度教務Webシステムを開いてから、再度実行してください。");
	}
};

document.getElementById("tasks_switch").onclick = function(){
	Tasks.showSubmitted = !Tasks.showSubmitted;
	drawTasks();
	document.getElementById("tasks_switch").innerHTML = tasks_switch_submitted? "未提出の課題を表示" : "提出済みの課題を表示";
};

document.getElementById("iframe").src = `http://bb.xrea.jp/titech/embed/?ver=${chrome.runtime.getManifest().version}${chrome.runtime.id !== "odfihbhakcfillnjihnjhilbpjmhnhml"? "&test=true" : ""}`;
