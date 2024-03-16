const formatTime = (t) => {
	const time = new Date(t * 1000);
	return `${time.toLocaleDateString("jp-JP")}(${["日", "月", "火", "水", "木", "金", "土"][time.getDay()]}) ${time.toLocaleTimeString("jp-JP").slice(0, -3)}`;
};


const createTaskNode = (task, isSubmitted) => {
	const li = document.createElement("li");
	li.className = (!isSubmitted && task.deadline - Math.floor(new Date().getTime() / 1000) < 0) && "expired";
	li.onclick = () => {
		chrome.tabs.create({url: task.url});
	};
	
	
	const p = document.createElement("p");
	p.innerHTML = task.name;
	li.appendChild(p);
	
	const span = document.createElement("span");
	span.innerHTML = task.subject;
	li.appendChild(span);
	
	const span2 = document.createElement("span");
	span2.innerHTML = formatTime(task.deadline);
	li.appendChild(span2);
	
	const del = document.createElement("a");
	del.href = "#";
	del.innerHTML = isSubmitted? "←" : "×";
	del.title = isSubmitted? "未提出に戻す" : "提出済みにする";
	li.appendChild(del);
	del.onclick = () => {
		event.stopPropagation();
		Tasks.isSubmitted(task.id)? Tasks.unsubmit(task.id) : Tasks.submit(task.id);
		drawTasks();
	};
	
	const div = document.createElement("div");
	div.innerHTML = task.type;
	task.type !== "assignment" && li.appendChild(div);

	return li;
};


const drawLastupdate = function() {
	if (Tasks.lastupdate) {
		const t = Math.floor(new Date().getTime() / 1000) - Tasks.lastupdate;
		document.getElementById("message").innerHTML = `更新: ${
			t < 60
			? `${t}秒`
			: t < 3600
			? `${Math.floor(t / 60)}分`
			: t < 86400
			? `${Math.floor(t / 3600)}時間`
			: `${Math.floor(t / 86400)}日`
		}前`;
	}
	else {
		document.getElementById("message").innerHTML = "更新ボタンを押してください";
	}
};


const drawLoginError = function() {
	document.getElementById("message").innerHTML = "";
	
	const a = document.createElement("a");
	a.innerHTML = "Tokyo Tech Portal";
	a.href = "#";
	a.onclick = () => {
		event.preventDefault();
		chrome.tabs.create({url: "https://portal.titech.ac.jp/"});
	};
	document.getElementById("message").appendChild(a);
	document.getElementById("message").appendChild(document.createTextNode(" にログインしてください"));
};


const drawTasks = function() {
	document.getElementById("tasks").innerHTML = "";
	document.getElementById("tasks_submitted").innerHTML = "";
	
	for (let task of Tasks.tasks) {
		document.getElementById(Tasks.isSubmitted(task.id)? "tasks_submitted" : "tasks").appendChild(createTaskNode(task, Tasks.isSubmitted(task.id)));
	}
	
	chrome.action.setBadgeBackgroundColor({ color: "#6C90C1" });
	chrome.action.setBadgeText({ text: String(Tasks.tasks.length - Tasks.submission.length) });
};
