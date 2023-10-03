function posCalender(course, calender){
	for(let i=0; i<5; i++){
	for(let j=0; j<5; j++){
		if(calender[i][j] && calender[i][j].id == course.id){ return [i, j]; }
	}
	}
	return [-1, -1];
}


function mousePosCalender(event){
	let x = event.pageX;
	let y = event.pageY;
	if(45 < x && x < 490 && 33 < y && y < 340){
		return [Math.floor((x - 45) / 90), Math.floor((y - 33) / 62)];
	}
	else if(5 < x && x < 500 && 350 < y && y < 400){
		return [-1, -1];
	}
}


function createCalenderNode(course, calender){
	let div = document.createElement("div");
	div.innerHTML = course.name[0];
	div.className = "course";
	div.setAttribute("id", course.id);
	div.draggable = true;
	div.ondrag = function(){
		if(mousePosCalender(event)){
			let [x, y] = mousePosCalender(event);
			let e = (x == -1)? document.getElementById("calender_courses") : document.getElementsByTagName("td")[x + y*5].firstChild;
			if(e && document.getElementsByClassName("dragging")[0] && e && e != document.getElementsByClassName("dragging")[0]){
				document.getElementsByClassName("dragging")[0].className = "dragtarget";
			}
			if(e.className == "dragtarget"){
				e.className = "dragging";
			}
		}
	};
	div.ondragend = function(){
		let [i, j] = posCalender(course, calender);
		if(mousePosCalender(event)){
			let [x, y] = mousePosCalender(event);
			if(x == -1 && y == -1){
				if(i != -1 && j != -1){
					calender[i][j] = null;
					chrome.storage.local.set({"calender": JSON.stringify(calender)}, drawCalender);
				}
			}
			else{
				if(!calender[x][y]){
					if(i != -1 && j != -1){
						calender[i][j] = null;
					}
					calender[x][y] = course;
					chrome.storage.local.set({"calender": JSON.stringify(calender)}, drawCalender);
					drawCalender();
				}
				div.display = "none";
			}
		}
		if(document.getElementsByClassName("dragging")[0]){
			document.getElementsByClassName("dragging")[0].className = "dragtarget";
		}
	};
	div.onclick = function(){
		chrome.tabs.create({"url": "https://t2schola.titech.ac.jp/course/view.php?id=" + course.id});
	};
	
	return div;
}


function createCalenderEmptyNode(i, j){
	let div = document.createElement("div");
	div.className = "dragtarget";
	div.setAttribute("x", i);
	div.setAttribute("y", j);
	return div;
}


function drawCalender(){
	chrome.storage.local.get(["courses", "calender"], function(s){
		courses    = JSON.parse(s.courses || "[]");
		calender   = JSON.parse(s.calender || "[[],[],[],[],[]]");
		
		document.getElementById("calender_table").innerHTML = "";
		document.getElementById("calender_courses").firstChild.innerHTML = "";
		
		for(let i=0; i<5; i++){
			let tr = document.createElement("tr");
			let th = document.createElement("th");
			th.innerHTML = ["8:50 〜 10:30", "10:45<br>〜<br>12:25", "13:30 〜 15:10", "15:25 〜 17:05", "17:15 〜 18:55"][i];
			tr.appendChild(th);
			for(let j=0; j<5; j++){
				let td = document.createElement("td");
				if(calender[j][i]){
					let node = createCalenderNode(calender[j][i], calender);
					td.appendChild(node);
				}
				else{
					let div = createCalenderEmptyNode(i, j);
					td.appendChild(div);
				}
				tr.appendChild(td);
			}
			document.getElementById("calender_table").appendChild(tr);
		}
		
		let count = 0;
		for(let course of courses){
			if(posCalender(course, calender)[0] != -1){ continue; }
			count++;
			let node = createCalenderNode(course, calender);
			document.getElementById("calender_courses").firstChild.appendChild(node);
		}
		document.getElementById("calender_courses").firstChild.style.width = (104 * count) + "px";
	});
}
