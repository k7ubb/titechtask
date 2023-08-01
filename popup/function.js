function loadTasklist(token){
	let assignments = getAssignments(token);
	let quizzes = getQuizzes(token);
	let workshops = getWorkshops(token);
	let [courses, tasks] = formatAssignments(assignments, quizzes, workshops);
	tasks.sort(function(a,b){ return a.deadline - b.deadline; });
	chrome.storage.local.set({
		courses: JSON.stringify(courses),
		tasks: JSON.stringify(tasks),
 		lastupdate: JSON.stringify(Math.floor(new Date().getTime()/1000))
 	}, function(){});
	return [courses, tasks];
}


// 配列から指定したIDのcourseを探し、名前を返す
function courseName(courses, id){
	for(let course of courses){
		if(course.id == id){
			return course.name;
		}
	}
}


// 取得したデータを整形して[Courses, Tasks]の形式で返す
function formatAssignments(assignments, quizzes, workshops){
	let courses = [], tasks = [];
	assignments.courses.forEach(function(course){
		courses.push({
			name: course.fullname.split(/ \/ /),
			id: course.id
		});
		course.assignments.forEach(function(assignment){
			tasks.push({
				type:     "assignment",
				subject:  course.fullname.split(/ \/ /),
				id:       assignment.id,
				url:      "https://t2schola.titech.ac.jp/mod/assign/view.php?id=" + assignment.cmid,
				name:     assignment.name,
				deadline: assignment.duedate
			});
		});
	});
	quizzes.quizzes.forEach(function(quiz){
		tasks.push({
			type:     "quiz",
			subject:  courseName(courses, quiz.course),
			id:       quiz.id,
			url:      "https://t2schola.titech.ac.jp/mod/quiz/view.php?id=" + quiz.coursemodule,
			name:     quiz.name,
			deadline: quiz.timeclose
		});
	});
	workshops.workshops.forEach(function(workshop){
		tasks.push({
			type:     "workshop",
			subject:  courseName(courses, workshop.course),
			id:       workshop.id,
			url:      "https://t2schola.titech.ac.jp/mod/workshop/view.php?id=" + workshop.coursemodule,
			name:     workshop.name,
			deadline: workshop.submissionend
		});
	});
	return [courses, tasks];
}


// 課題の提出状況を確認し、提出済みであればonloadfunctionを実行
function updateAssignmentSubmissionStatus(token, userid, assignmentid, onloadfunction){
	getAssignmentSubmissionStatus(token, userid, assignmentid, function(json){
		if(json.lastattempt && json.lastattempt.submission.status == "submitted"){
			onloadfunction(assignmentid);
		}
	});
}


// UNIX時間をyyyy/m/d(曜) hh:mm形式文字列に変換
function unix2date(t){
	let time = new Date(t * 1000);
	return time.toLocaleDateString("jp-JP") + "(" + [ "日", "月", "火", "水", "木", "金", "土" ][time.getDay()] + ") " + time.toLocaleTimeString("jp-JP").substr(0, time.toLocaleTimeString("jp-JP").length - 3);
}


// unix時刻tの、現在時刻からの経過時間を返す
function sec2elapsed(t){
	t = Math.floor(new Date().getTime() / 1000) - t;
	if(t < 60){ return t + "秒前"; }
	if(t < 60*60){ return Math.floor(t / 60) + "分前"; }
	if(t < 60*60*48){ return Math.floor(t / 3600) + "時間前"; }
	else{ return Math.floor(t / 86400) + "日前"; }
}


// アイコンの数字を更新
function updateIcon(tasks, submitted){
	chrome.action.setBadgeBackgroundColor({ "color": "#6C90C1" });
	chrome.action.setBadgeText({ "text": String(tasks.length - submitted.length) });
}
