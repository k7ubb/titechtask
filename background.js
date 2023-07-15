// 起動時に課題数を表示する
updateIcon();

// 外部からの通信で実行される
chrome.runtime.onMessage.addListener(function(mes, sender, cb){
	if(mes == "load"){
		console.log("更新: " + new Date().toString());
		// 0: 未完了 1:成功 2:失敗
		var flag_t2  = 0;
		var flag_ocw = 0;
		
		// T2SCHOLAのトップページから履修科目一覧を取得
		var req_t2 = new XMLHttpRequest();
		req_t2.open("get", "https://t2schola.titech.ac.jp/");
		req_t2.responseType = "document";
		req_t2.send();
		req_t2.onload = function(){
			// 認証に失敗していないか
			if(req_t2.responseURL.indexOf("portal.nap.gsic.titech.ac.jp") == -1){
				flag_t2 = 1;
			}
			else{
				console.log("t2scholaへのアクセスに失敗");
				flag_t2 = 2;
			}
			// OCW-iのほうも読み込み終わっていたら次の処理へ
			if(flag_ocw){ ready(cb, flag_ocw, flag_t2, req_t2.responseXML); }
		};
		
		// OCW-iの課題一覧にアクセス
		var req_ocw = new XMLHttpRequest();
		req_ocw.open("get", "https://secure.ocw.titech.ac.jp/ocwi/index.php?module=Ocwi&action=Subject");
		req_ocw.responseType = "document";
		req_ocw.send();
		req_ocw.onload = function(){
			// 認証に失敗していないか
			if(req_ocw.responseXML.body.innerText.indexOf("TokyoTechPortalからログインしてください。") == -1 && 
			req_ocw.responseURL != "https://secure.ocw.titech.ac.jp/ocwi/timeout.html"){
				flag_ocw = 1;
				// 呼び出し1回で済むのでここでocw_tasksは更新
				chrome.storage.local.get("ocw_tasks", function(s){
					update_ocw(req_ocw.responseXML, parseJSON(s.ocw_tasks) || []);
				});
			}
			else{
				console.log("OCW-iへのアクセスに失敗");
				flag_ocw = 2;
			}
			// T2SCHOLAのほうも読み込み終わっていたら次の処理へ
			if(flag_t2){ ready(cb, flag_ocw, flag_t2, req_t2.responseXML); }
		};
		
		return true;
	}
	if(mes == "icon"){
		updateIcon();
	}
});

// T2SCHOLAにアクセスできてれば課題読込、そうでなければコールバックを返す
function ready(cb, flag_ocw, flag_t2, xml){
	if(flag_t2 == 1){
		chrome.storage.local.get("t2_tasks", function(s){
			update_t2(xml, parseJSON(s.t2_tasks) || [], flag_ocw, cb);
		});
	}
	else{
		cb({t2: flag_t2, ocw: flag_ocw});
	}
}
