importScripts("popup/lib/t2schola.js");
importScripts("popup/tasks.js");

const updateIcon = async () => {
	Tasks.tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	Tasks.submission = (await chrome.storage.local.get("submission")).submission || [];
	chrome.action.setBadgeBackgroundColor({ color: "#6C90C1" });
	chrome.action.setBadgeText({ text: String(Tasks.tasks.length - Tasks.submission.length) });
};


chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.create({ url: "https://bb.xrea.jp/titech/#manual" });
});

chrome.runtime.onStartup.addListener(async () => {
	if ((await chrome.storage.local.get("lastupdate")).lastupdate < 1711092600) {
		await chrome.storage.local.clear();
	}
	
	await updateIcon();
	
	let count = 0;
	const interval = setInterval(() => {
		chrome.action.setIcon({ path: `icons/${(++count % 8) + 1}.png` });
	}, 100);
	try {
		T2Schola.token = (await chrome.storage.local.get("token")).token;
		chrome.storage.local.set({ username: (await T2Schola.wsfunction("core_webservice_get_site_info")).username });
		await Tasks.updateTasks();
		await Tasks.updateSubmission();
		await updateIcon();
	} catch(e) {
		console.log(e);
	} finally {
		clearInterval(interval);
		chrome.action.setIcon({ path: "icons/default.png" });
	}
});