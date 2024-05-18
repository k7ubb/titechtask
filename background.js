chrome.runtime.onStartup.addListener(async () => {
	const storage = await chrome.storage.sync.get(["tasks", "submission"]);
	const tasks = storage.tasks || [];
	const submission = storage.submission || [];
	chrome.action.setBadgeBackgroundColor({ color: "#6C90C1" });
	chrome.action.setBadgeText({ text: String(tasks.length - submission.length) });
});