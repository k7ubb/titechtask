(async () => {
	T2Schola.token = (await chrome.storage.local.get("token")).token;
	Tasks.courses = (await chrome.storage.local.get("courses")).courses || [];
	Tasks.tasks = (await chrome.storage.local.get("tasks")).tasks || [];
	Tasks.submission = (await chrome.storage.local.get("submission")).submission || [];
	Tasks.lastupdate = (await chrome.storage.local.get("lastupdate")).lastupdate;
	Calender.calender = (await chrome.storage.local.get("calender")).calender;
	drawLastupdate();
	drawTasks();
	drawCalender();
})();

document.getElementById("tasks_reflesh").onclick = async () => {
	try {
		await Tasks.updateTasks();
		await Tasks.updateSubmission();
		drawLastupdate();
		drawTasks();
	} catch(e) {
		alert("Tokyo Tech Portalにログインしてください");
		console.error(e);
//		drawT2ScholaError();
	}
};
document.getElementById("calender_reflesh").onclick = async () => {
	try {
		await Calender.update();
		drawCalender();
	} catch(e) {
		alert("一度教務webを開いてください");
//		drawKyomuError();
	}
};

let tasks_switch_submitted = false;

document.getElementById("tasks_switch").onclick = function(){
	tasks_switch_submitted = !tasks_switch_submitted;
	document.getElementById("tasks_switch").innerHTML = tasks_switch_submitted? "未提出の課題を表示" : "提出済みの課題を表示";
	document.getElementById("tasks").style.display = tasks_switch_submitted? "none" : "block";
	document.getElementById("tasks_submitted").style.display = tasks_switch_submitted? "block" : "none";
};
