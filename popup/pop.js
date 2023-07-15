// JSON.parseの例外処理
function parseJSON(json){
	try{
		return JSON.parse(json);
	}
	catch(e){
		return null;
	}
}

// UNIX時間をyyyy/m/d(曜) hh:mm形式文字列に変換
function unix2date(t){
	var time = new Date(t*1000);
	return time.toLocaleDateString() + "(" + [ "日", "月", "火", "水", "木", "金", "土" ][time.getDay()] + ") " + time.toLocaleTimeString().substr(0, time.toLocaleTimeString().length - 3);
}

// 描画処理
chrome.storage.local.get(["t2_date", "t2_tasks", "ocw_date", "ocw_tasks"], function(s){
	// 更新日時の表示
	var t2_date = (s.t2_date? unix2date(s.t2_date) : "未") + "取得";
	var ocw_date = (s.ocw_date? unix2date(s.ocw_date) : "未") + "取得";
	document.getElementById("t2_date").innerHTML = t2_date;
	document.getElementById("ocw_date").innerHTML = ocw_date;
	
	// ステータスメッセージの処理(location.searchを使用)
	if(location.search){
		document.getElementById("status").innerHTML = decodeURI(location.search.slice(1));
	}
	
	// 更新ボタンを押した時の処理
	document.getElementById("update_button").onclick = function(){
		document.getElementById("status").innerHTML = "更新中…";
		chrome.runtime.sendMessage("load" ,function(r){
			var i=0;
			var lt = s.t2_date;
			if(r){
				if(r.t2 == 1 && r.ocw == 1){
					location.search = encodeURI("更新しました");
				}
				else if(r.t2 == 1 && r.ocw == 2){
					location.search = encodeURI("OCW-iを開いてください");
				}
				else{
					location.search = encodeURI("Portalにログインしてください");
				}
			}
		});
	};
	
	// 復元ボタンを押した時の処理
	document.getElementById("reset_button").onclick = function(){
		for(var i=0; i<t2_tasks.length; i++){
			t2_tasks[i].submitted_manual = false;
		}
		for(var i=0; i<ocw_tasks.length; i++){
			ocw_tasks[i].submitted_manual = false;
		}
		chrome.storage.local.set({"t2_tasks": JSON.stringify(t2_tasks)}, function(){});
		chrome.storage.local.set({"ocw_tasks": JSON.stringify(ocw_tasks)}, function(){});
		chrome.runtime.sendMessage("icon");
		location.search = "";
	};
	
	// T2とOCWの課題を合わせたリストを作成
	// 提出済み課題も取り除く
	var t2_tasks = parseJSON(s.t2_tasks) || [];
	var ocw_tasks = parseJSON(s.ocw_tasks) || [];
	var tasks = [];
	for(var i=0; i<t2_tasks.length; i++){
		if(!t2_tasks[i].submitted && !t2_tasks[i].submitted_manual){
			tasks[tasks.length] = t2_tasks[i];
			tasks[tasks.length-1].source = "T2";
		}
	}
	for(var i=0; i<ocw_tasks.length; i++){
		if(!ocw_tasks[i].submitted && !ocw_tasks[i].submitted_manual){
			tasks[tasks.length] = ocw_tasks[i];
			tasks[tasks.length-1].source = "OCW";
		}
	}
	tasks.sort(function(a,b){ return a.deadline-b.deadline; });
	
	// ここから課題描画
	for(var i=0; i<tasks.length; i++){
		var li = document.createElement("li");
		var div = document.createElement("div");
		div.className = tasks[i].source;
		div.innerHTML = tasks[i].source;
		li.appendChild(div);
		div = document.createElement("div");
		var span = document.createElement("span");
		span.innerHTML = tasks[i].title
		div.appendChild(span);
		span = document.createElement("span");
		span.innerHTML = tasks[i].subject + "<br>" + unix2date(tasks[i].deadline);
		div.appendChild(span);
		li.appendChild(div);
		var del = document.createElement("input");
		del.type = "button";
		del.value = "削除";
		li.appendChild(del);
		var time = Math.floor(new Date().getTime()/1000);
		if(tasks[i].deadline - time < 0){
			li.className = "expired";
		}
		(function(i){
			del.onclick = function(){
				event.stopPropagation();
				if(tasks[i].source == "T2"){
					for(var j=0; j<t2_tasks.length; j++){
						if(t2_tasks[j].url == tasks[i].url){
							t2_tasks[j].submitted_manual = true;
							chrome.storage.local.set({"t2_tasks": JSON.stringify(t2_tasks)}, function(){});
							break;
						}
					}
				}
				if(tasks[i].source == "OCW"){
					for(var j=0; j<ocw_tasks.length; j++){
						if(ocw_tasks[j].url == tasks[i].url){
							ocw_tasks[j].submitted_manual = true;
							chrome.storage.local.set({"ocw_tasks": JSON.stringify(ocw_tasks)}, function(){});
							break;
						}
					}
				}
				chrome.runtime.sendMessage("icon");
				location.reload();
			};
			li.onclick = function(){
				chrome.tabs.create({url: tasks[i].url});
			};
		})(i);
		document.getElementById("tasks").appendChild(li);
	}
	if(tasks.length == 0){
		var li = document.createElement("li");
		li.className = "notask";
		li.innerText = "未提出課題はありません。";
		document.getElementById("tasks").appendChild(li);
	}
});

