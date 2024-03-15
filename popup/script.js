(async () => {
	T2Schola.token = (await chrome.storage.local.get("token")).token;
	Data.courses = (await chrome.storage.local.get("courses")).courses || [];
	Data.tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	Data.submission = (await chrome.storage.local.get("submission")).submission || [];
	draw();
})();

const draw = () => {
	document.getElementById("message").innerHTML = "";
	Data.tasks.map((task) => {
		const p = document.createElement("p");
		p.innerHTML = (Data.submission.indexOf(task.id) !== -1? "済 " : "未 ") + task.name;
		p.title = JSON.stringify(task).replace(/,/g, "\n");
		document.getElementById("message").appendChild(p);
	});
};

document.getElementById("upload").onclick = async () => {
//	await Data.t2ScholaUpdate();
	await Data.updateSubmission();
	draw();
};

