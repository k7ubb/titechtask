let token, courses, tasks, submitted, lastupdate;
let tasks_switch_submitted = false;


function createTaskNode(task, isSubmitted){
	let time_now = Math.floor(new Date().getTime() / 1000);
	
	let li = document.createElement("li");
	if(!isSubmitted && task.deadline - time_now < 0){ li.className = "expired"; }
	
	let p = document.createElement("p");
		p.innerHTML = task.name;
		li.appendChild(p);
	let span = document.createElement("span");
		span.innerHTML = task.subject[0];
		li.appendChild(span);
	let span2 = document.createElement("span");
		span2.innerHTML = unix2date(task.deadline);
		li.appendChild(span2);
	let del = document.createElement("a");
		del.href = "#";
		del.innerHTML = isSubmitted? "←" : "×";
		del.title = isSubmitted? "未提出に戻す" : "提出済みにする";
		li.appendChild(del);
	if(task.type == "quiz"){
		let div = document.createElement("div");
		div.innerHTML = "quiz";
		li.appendChild(div);
	}
	if(task.type == "workshop"){
		let div = document.createElement("div");
		div.innerHTML = "turnitin";
		li.appendChild(div);
	}
	
	del.onclick = function(){
		event.stopPropagation();
		if(submitted.indexOf(task.id) == -1){ submitted.push(task.id); }
		else{ submitted = submitted.filter(function(t_){ return t_ != task.id; }); }
		chrome.storage.local.set({"submitted": JSON.stringify(submitted)}, function(){});
		updateIcon(tasks, submitted);
		drawTasks();
	};
	li.onclick = function(){
		chrome.tabs.create({"url": task.url});
	};
	
	return li;
}


function drawMessage(message){
	document.getElementById("date").innerHTML = message;
}


function drawTasks(){
	document.getElementById("tasks").innerHTML = "";
	document.getElementById("tasks_submitted").innerHTML = "";
	
	for(let task of tasks){
		let isSubmitted = submitted.indexOf(task.id) != -1;
		let node = createTaskNode(task, isSubmitted);
		document.getElementById(isSubmitted? "tasks_submitted" : "tasks").appendChild(node);
	}
	updateIcon(tasks, submitted);
}


function load(){
	if(token == ""){
		console.log("get_wstoken");
		token = getToken();
	}
	if(token == ""){
		drawMessage("Portalにログインしてください");
		return;
	}
	else{
		console.log("core_webservice_get_site_info");
		let userid = getUserID(token);
		if(userid == ""){
			token = "";
			load();
			return;
		}
		console.log("mod_assign_get_assignments");
		console.log("mod_quiz_get_quizzes_by_courses");
		console.log("mod_workshop_get_workshops_by_courses");
		[courses, tasks] = loadTasklist(token);
		drawMessage("更新しました");
		drawCalender();
		drawTasks();
		for(let task of tasks){
			if(task.type == "assignment" && submitted.indexOf(task.id) == -1){
				(function(assignmentid){
					console.log("mod_assign_get_submission_status");
					updateAssignmentSubmissionStatus(token, userid, assignmentid, function(assignmentid){
						if(submitted.indexOf(assignmentid) == -1){
							submitted.push(assignmentid);
							chrome.storage.local.set({"submitted": JSON.stringify(submitted)}, function(){});
							drawTasks();
						}
					});
				})(task.id);
			}
		}
	}
}


chrome.storage.local.get(["token", "courses", "tasks", "submitted", "lastupdate"], function(s){
	token      = s.token || "";
	courses    = JSON.parse(s.courses || "[]");
	tasks      = JSON.parse(s.tasks || "[]");
	submitted  = JSON.parse(s.submitted || "[]");
	lastupdate = Number(s.lastupdate || "0");
	
	drawMessage(lastupdate? "更新: " + sec2elapsed(lastupdate) : "更新ボタンを押してください");
	drawCalender();
	drawTasks();
	
	document.getElementById("reflesh").onclick = load;
	
	document.getElementById("help").onclick = function(){
		chrome.tabs.create({url: "https://komekui.xrea.jp/titechtask/"});
	};
	
	document.getElementById("tasks_switch").onclick = function(){
		tasks_switch_submitted = !tasks_switch_submitted;
		document.getElementById("tasks_switch").innerHTML = tasks_switch_submitted? "未提出の課題を表示" : "提出済みの課題を表示";
		document.getElementById("tasks").style.display = tasks_switch_submitted? "none" : "block";
		document.getElementById("tasks_submitted").style.display = tasks_switch_submitted? "block" : "none";
	};
	
});


