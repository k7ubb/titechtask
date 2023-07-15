// JSON.parseの例外処理
function parseJSON(json){
	try{
		return JSON.parse(json);
	}
	catch(e){
		return null;
	}
}

// OCW-i/T2SCHOLA記載の日付をUNIX時間に変換
function date_conv(source, txt){
	var exp;
	if(source == "ocw"){
		exp = txt.match(/^(\d{4})\/(\d+)\/(\d+)<br>(\d+):(\d+)/);
	}
	else if(source == "t2"){
		exp = txt.match(/^(\d{4})年 (\d+)月 (\d+)日\(.+\) (\d+):(\d+)/);
	}
	return Math.floor(new Date(exp[1], exp[2]-1, exp[3], exp[4], exp[5], 0).getTime()/1000);
}

// 課題数をバッジに表示
function updateIcon(){
	chrome.storage.local.get(["t2_tasks", "ocw_tasks"], function(s){
		var t2_tasks = parseJSON(s.t2_tasks) || [];
		var ocw_tasks = parseJSON(s.ocw_tasks) || [];
		
		var n = 0;
		for(var i=0; i<t2_tasks.length; i++){
			if(!t2_tasks[i].submitted && !t2_tasks[i].submitted_manual){ n++; }
		}
		for(var i=0; i<ocw_tasks.length; i++){
			if(!ocw_tasks[i].submitted && !ocw_tasks[i].submitted_manual){ n++; }
		}
		chrome.browserAction.setBadgeBackgroundColor({ color: "#6C90C1" });
		chrome.browserAction.setBadgeText({ text: String(n) });
	});
}

// OCW-iの課題一覧を更新
function update_ocw(xml, tasks){
	var celm = xml.getElementsByTagName("tr");
	
	for(var i=1; i<celm.length; i++){
		var skip = false;
		for(var j=0; j<tasks.length; j++){
			if(celm[i].children[4].firstChild.href == tasks[j].url){
				// 手動で提出済みにしてあればスキップする
				if(tasks[j].submitted_manual){
					skip = true;
				}
				// そうでなければ削除して読み直す
				else{
					tasks.splice(j, 1);
					j--;
				}
				break;
			}
		}
		if(!skip){
			tasks[tasks.length] = {
				"subject": celm[i].children[3].innerText,
				"subj_url": celm[i].children[3].firstChild.href,
				"title": celm[i].children[4].innerText,
				"url": celm[i].children[4].firstChild.href,
				"submitted": celm[i].children[0].innerHTML.indexOf("提出済") != -1,
				"deadline": date_conv("ocw", celm[i].children[1].innerHTML)
			};
		}
	}
	
	console.log("OCW-iの課題リストを更新");
	console.log(tasks);
	chrome.storage.local.set({"ocw_tasks": JSON.stringify(tasks)}, function(){});
	chrome.storage.local.set({"ocw_date": JSON.stringify(Math.floor(new Date().getTime()/1000))}, function(){});
	updateIcon();
}

// T2SCHOLAの課題一覧を更新し、コールバックを返す
function update_t2(xml, tasks, flag_ocw, cb){
	var celm = xml.getElementsByClassName("coursename");
	var cource = [];
	
	for(var i=0; i<celm.length; i++){
		cource[i] = {
			title: celm[i].firstChild.innerHTML.match(/^[^\/]*/)[0],
			url: celm[i].firstChild.href
		};
	}
	
	var nth_cource = 0;
	var task_count = 0;
	var loaded_count = 0;
	// 講義の個別ページから課題一覧を取得
	for(var i=0; i<cource.length; i++){
		(function(c){
			var req = new XMLHttpRequest();
			req.open("get", c.url);
			req.responseType = "document";
			req.send();
			req.onload = function(){
				nth_cource++;
				var telm = req.responseXML.getElementsByClassName("aalink");
				for(var i=0; i<telm.length; i++){
					if(telm[i].href.indexOf("assign") != -1){
						var skip = false;
						for(var j=0; j<tasks.length; j++){
							if(telm[i].href == tasks[j].url){
								// すでに提出済みならスキップする
								if(tasks[j].submitted || tasks[j].submitted_manual){
									skip = true;
								}
								// そうでなければ削除して読み直す
								else{
									tasks.splice(j, 1);
									j--;
								}
							}
						}
						if(!skip){
							task_count++;
							// 課題の個別ページから詳細を取得
							(function(c, t){
								var req = new XMLHttpRequest();
								console.log("読込: " + t.href);
								req.open("get", t.href);
								req.responseType = "document";
								req.send();
								req.onload = function(){
									loaded_count++;
									var root = req.responseXML;
									var isSubmitted = Boolean(root.getElementsByClassName("submissionstatussubmitted").length);
									var cells = root.getElementsByClassName("cell c0");
									var deadline;
									for(var k=0; k<cells.length; k++){
										if(cells[k].innerText.indexOf("終了日時") != -1){
											deadline = cells[k].nextSibling.nextSibling.innerText;
											break;
										}
									}
									tasks[tasks.length] = {
										"subject": c.title,
										"subj_url": c.url,
										"title": t.innerText,
										"url": t.href,
										"submitted": isSubmitted,
										"deadline": date_conv("t2", deadline)
									};
									if(loaded_count == task_count){
										console.log("T2SCHOLAの課題リストを更新");
										console.log(tasks);
										chrome.storage.local.set({"t2_tasks": JSON.stringify(tasks)}, function(){});
										chrome.storage.local.set({"t2_date": JSON.stringify(Math.floor(new Date().getTime()/1000))}, function(){});
										cb({t2: 1, ocw: flag_ocw});
										updateIcon();
									}
								};
							})(c, telm[i]);
						}
					}
				}
				if(nth_cource == cource.length && task_count == 0){
					console.log("T2SCHOLAの課題リストを更新(差分なし)");
					console.log(tasks);
					chrome.storage.local.set({"t2_tasks": JSON.stringify(tasks)}, function(){});
					chrome.storage.local.set({"t2_date": JSON.stringify(Math.floor(new Date().getTime()/1000))}, function(){});
					cb({t2: 1, ocw: flag_ocw});
					updateIcon();
				}
			};
		})(cource[i]);
	}
}

