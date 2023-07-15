if(document.getElementsByClassName("alartBox").length &&
   document.getElementsByClassName("alartBox")[0].innerText=="課題の提出が完了しました。"){
	chrome.runtime.sendMessage("load");
}
