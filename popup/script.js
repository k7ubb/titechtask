(async () => {
	T2Schola.token = (await chrome.storage.local.get("token")).token;
	Data.courses = (await chrome.storage.local.get("courses")).courses || [];
	Data.tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	draw();
/*
	console.log(await T2Schola.wsfunction("mod_assign_get_submission_status", {
		userid: 15637,
		assignid: 24775,
	}));
	*/
})();

const draw = () => {
	document.getElementById("message").innerHTML = "";
	Data.tasks.map((task) => {
		const p = document.createElement("p");
		p.innerHTML = task.name;
		p.title = JSON.stringify(task).replace(/,/g, "\n");
		document.getElementById("message").appendChild(p);
	});
};

document.getElementById("upload").onclick = async () => {
	await Data.t2ScholaUpdate();
	draw();
};

