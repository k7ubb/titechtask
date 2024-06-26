chrome.runtime.onStartup.addListener(async () => {
	const tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	const submission = (await chrome.storage.local.get("submission")).submission || [];
	chrome.action.setBadgeBackgroundColor({ color: "#6C90C1" });
	chrome.action.setBadgeText({ text: String(tasks.length - submission.length) });
});