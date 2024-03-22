const setLoading = (s) => {
	document.getElementById("loading").style.display = s? "block" : "";
};

const formatTime = (t) => {
	const time = new Date(t * 1000);
	return `${time.toLocaleDateString("jp-JP")}(${["日", "月", "火", "水", "木", "金", "土"][time.getDay()]}) ${time.toLocaleTimeString("jp-JP").slice(0, -3)}`;
};


const createTaskNode = (task) => {
	const li = document.createElement("li");
	li.className =
		Tasks.isSubmitted(task.id)
		? "submitted"
		: task.deadline - Math.floor(new Date().getTime() / 1000) < 0
		? "expired"
		: "";
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
	del.innerHTML = Tasks.isSubmitted(task.id)? "←" : "×";
	del.title = Tasks.isSubmitted(task.id)? "未提出に戻す" : "提出済みにする";
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
	const p = document.createElement("p");
	p.innerHTML = course.title;
	div.appendChild(p);
	const span = document.createElement("span");
	span.innerHTML = course.room;
	course.room && div.appendChild(span);

	for (let course_ of Tasks.courses) {
		if (course_.name.replace(/[【】\s]/g, "").match(course.title.replace(/[【】\s]/g, ""))) {
			div.className = "t2";
			div.onclick = () => {
				chrome.tabs.create({ url: `https://t2schola.titech.ac.jp/course/view.php?id=${course_.id}` });
			};
		}
	}
	return div;
};


const drawTasks = function() {
	document.getElementById("tasks").innerHTML = "";
	
	for (let task of Tasks.tasks) {
		if (Tasks.isSubmitted(task.id) === Tasks.showSubmitted) {
			document.getElementById("tasks").appendChild(createTaskNode(task));
		}
	}
	
	if (Tasks.lastupdate) {
		const t = Math.floor(new Date().getTime() / 1000) - Tasks.lastupdate;
		document.getElementById("tasks_lastupdate").innerHTML = `更新: ${
			t < 60
			? `${t}秒`
			: t < 3600
			? `${Math.floor(t / 60)}分`
			: t < 86400
			? `${Math.floor(t / 3600)}時間`
			: `${Math.floor(t / 86400)}日`
		}前`;
	}
	
	chrome.action.setBadgeBackgroundColor({ color: "#6C90C1" });
	chrome.action.setBadgeText({ text: String(Tasks.tasks.length - Tasks.submission.length) });
};


const drawCalender = function() {
	document.getElementById("calender").innerHTML = "";
	document.getElementById("calender_other").innerHTML = "";
	document.getElementById("calender_buttons").innerHTML = "";
	
	const courses = Calender.calender? Calender.calender[Calender.quarterIndex].courses : [];
	
	for (let i=0; i<5; i++) {
		const tr = document.createElement("tr");
		const th = document.createElement("th");
		th.innerHTML = ["8:50<br>〜<br>10:30", "10:45<br>〜<br>12:25", "13:30<br>〜<br>15:10", "15:25<br>〜<br>17:05", "17:15<br>〜<br>18:55"][i];
		tr.appendChild(th);
		
		for (let j=0; j<5; j++) {
			const td = document.createElement("td");
			loop: for (let course of courses) {
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
	
	for (let course of courses) {
		if (!course.time.length) {
			const div = document.createElement("div");
			div.appendChild(createCourseNode(course));
			document.getElementById("calender_other").appendChild(div);
		}
	}
	
	for (let i=0; i<Calender.calender?.length; i++) {
		const button = document.createElement("a");
		button.href = "#";
		button.className = i === Calender.quarterIndex && "selected";
		button.innerHTML = Calender.calender[i].name;
		button.onclick = function(){
			Calender.quarterIndex = i;
			drawCalender();
			chrome.storage.local.set({ quarterIndex: Calender.quarterIndex });
		};
		document.getElementById("calender_buttons").appendChild(button);
	}

};
