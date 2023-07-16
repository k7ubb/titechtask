// t2scholaのtoken文字列を返す
// portalへのログインが必要な場合、空文字列を返す
function getToken(){
	let xhr = new XMLHttpRequest();
	xhr.open("get", "https://t2schola.titech.ac.jp/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=14029&urlscheme=mmt2schola", false);
	xhr.send();
	if(xhr.responseURL.indexOf("portal.nap.gsic.titech.ac.jp") == -1){
		let token_unformat = xhr.responseText.match(/"mmt2schola\:\/\/token=(.*)"/)[1];
		let token = atob(token_unformat).split(":::")[1];
		chrome.storage.local.set({token: token}, function(){});
		return token;
	}
	else{
		return "";
	}
}


// t2scholaのuserID文字列を返す
// token読み直しが必要な場合、空文字列を返す
function getUserID(token){
	let xhr = new XMLHttpRequest();
	xhr.open("post", "https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json", false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("wsfunction=core_webservice_get_site_info&wstoken=" + token);
	let result_json = JSON.parse(xhr.responseText);
	if(result_json.errorcode == "invalidtoken"){
		return "";
	}
	else{
		return String(result_json.userid);
	}
}


// mod_assign_get_assignmentsの結果のJSONを返す
function getAssignments(token){
	let xhr = new XMLHttpRequest();
	xhr.open("post", "https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json", false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("wsfunction=mod_assign_get_assignments&wstoken=" + token);
	return JSON.parse(xhr.responseText);
}


// mod_quiz_get_quizzes_by_coursesの結果のJSONを返す
function getQuizzes(token){
	let xhr = new XMLHttpRequest();
	xhr.open("post", "https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json", false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("wsfunction=mod_quiz_get_quizzes_by_courses&wstoken=" + token);
	return JSON.parse(xhr.responseText);
}


// mod_workshop_get_workshops_by_coursesの結果のJSONを返す
function getWorkshops(token){
	let xhr = new XMLHttpRequest();
	xhr.open("post", "https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json", false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("wsfunction=mod_workshop_get_workshops_by_courses&wstoken=" + token);
	return JSON.parse(xhr.responseText);
}


// t2scholaの課題の提出状況を返す (非同期通信, 読み込み後にonloadfunctionを実行)
function getAssignmentSubmissionStatus(token, userid, assignmentid, onloadfunction){
	let xhr = new XMLHttpRequest();
	xhr.open("post", "https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("wsfunction=mod_assign_get_submission_status&userid=" + userid + "&assignid=" + assignmentid + "&wstoken=" + token);
	xhr.onloadend = function(){
		onloadfunction(JSON.parse(xhr.responseText));
	};
}
