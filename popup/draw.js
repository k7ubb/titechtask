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


const createCourseNode = function(course) {
	const div = document.createElement("div");
	for (let course_ of Tasks.courses) {
		if (course_.name.replace(/[【】\s]/g, "").match(course.title.replace(/[【】\s]/g, ""))) {
			div.innerHTML = `<a href="https://t2schola.titech.ac.jp/course/view.php?id=${course_.id}" target="_blank"><span title="${course.room}">${course.title}</span></a>`;
			return div;
		}
	}
	div.innerHTML = `<span title="${course.room}">${course.title}</span>`;
	return div;
};


const drawLastupdate = function() {
	if (Tasks.lastupdate) {
		const t = Math.floor(new Date().getTime() / 1000) - Tasks.lastupdate;
		document.getElementById("tasks_message").innerHTML = `更新: ${
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
		document.getElementById("tasks_message").innerHTML = "更新ボタンを押してください";
	}
};


const drawT2ScholaError = function() {
	document.getElementById("tasks_message").innerHTML = "";
	
	const a = document.createElement("a");
	a.innerHTML = "Tokyo Tech Portal";
	a.href = "#";
	a.onclick = () => {
		event.preventDefault();
		chrome.tabs.create({url: "https://portal.titech.ac.jp/"});
	};
	document.getElementById("tasks_message").appendChild(a);
	document.getElementById("tasks_message").appendChild(document.createTextNode(" にログインしてください"));
};


const drawKyomuError = function() {
	document.getElementById("calender_message").innerHTML = "";
	
	const a = document.createElement("a");
	a.innerHTML = "教務Webシステム";
	a.href = "#";
	a.onclick = () => {
		event.preventDefault();
		chrome.tabs.create({url: "https://kyomu0.gakumu.titech.ac.jp/Titech/Student/"});
	};
	document.getElementById("calender_message").appendChild(a);
	document.getElementById("calender_message").appendChild(document.createTextNode(" を開いてください"));
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


const drawCalender = function() {
	document.getElementById("calender").innerHTML = "";
	if (!Calender.calender) { return; }
	
	for (let i=0; i<5; i++) {
		const tr = document.createElement("tr");
		const th = document.createElement("th");
		th.innerHTML = ["8:50<br>~<br>10:30", "10:45<br>~<br>12:25", "13:30<br>~<br>15:10", "15:25<br>~<br>17:05", "17:15<br>~<br>18:55"][i];
		tr.appendChild(th);
		
		for (let j=0; j<5; j++) {
			const td = document.createElement("td");
			loop: for (let course of Calender.calender[0].courses) {
				for (let time of course.time) {
					if (time.day === ["月","火","水","木","金"][j] && time.time === i+1) {
						td.appendChild(createCourseNode(course));
						break loop;
					}
				}
			}
			tr.appendChild(td);
		}
		document.getElementById("calender").appendChild(tr);
	}
	
	const tr = document.createElement("tr");
	const th = document.createElement("th");
	th.innerHTML = "集中講義等";
	tr.appendChild(th);
	
	for (let course of Calender.calender[0].courses) {
		if (!course.time.length) {
			const td = document.createElement("td");
			td.appendChild(createCourseNode(course));
			tr.appendChild(td);
		}
	}
	document.getElementById("calender").appendChild(tr);

};
