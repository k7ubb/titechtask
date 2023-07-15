if(document.referrer.indexOf("action=editsubmission") != -1 &&
   document.getElementsByClassName("submissionstatussubmitted").length){
	chrome.runtime.sendMessage("load");
}
