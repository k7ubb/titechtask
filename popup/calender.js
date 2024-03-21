const convertCourseElement = (timeStr, codeStr, titleStr, teacherStr) => {
	try {
		const roomMatch = timeStr.match(/\(.*\)/);
		const timeMatch = timeStr.replace(/[\n\s]{2,}/g, "").match(/[月火水木金]\d-\d/g) || [];
		let time = [];
		for (let t of timeMatch) {
			if (t.charAt(3) - t.charAt(1) > 1) {
				time.push(t[i].charAt(0) + (Number(t[i].charAt(1))+2));
			}
			else {
				time.push(t.substr(0, 2));
			}
		}
		time = time.map((t) => {
			return {
				day: t.charAt(0),
				time: (Number(t.charAt(1)) + 1) / 2
			}
		});
		return {
			time,
			code: codeStr.replace(/[\n\s]{2,}/g, ""),
			title: titleStr.replace(/[\n\s]{2,}/g, ""),
			teacher: teacherStr.replace(/[\n\s]{2,}/g, ""),
			room: roomMatch? roomMatch[0].substr(1, roomMatch[0].length-2) : ""
		};
	} catch(e) {
		console.error(e);
		return {
			time: [],
			code: "",
			title: "",
			teacher: "",
			room: ""
		};
	}
};


const Calender = {
	calender: undefined,
	
	tags: [
		[
			{ className: "tdQuarter1", quarter: 0 },
			{ className: "tdQuarter2", quarter: 1 },
			{ className: "tdQuarter7", quarter: 0 },
			{ className: "tdQuarter7", quarter: 1 }
		],
		[
			{ className: "tdQuarter3", quarter: 0 },
			{ className: "tdQuarter4", quarter: 1 },
			{ className: "tdQuarter8", quarter: 0 },
			{ className: "tdQuarter8", quarter: 1 }
		]
	],
	
	update: async function() {
		const result = await Kyomu.fetch("https://kyomu0.gakumu.titech.ac.jp/Titech/Student/%E7%A7%91%E7%9B%AE%E7%94%B3%E5%91%8A/PID1_0.aspx");
		const quarterCheck = result.getElementsByClassName("contentsTable01")[0].children[1];
		let semester;
		if (quarterCheck.innerText.match("1Q")) {
			semester = 0;
			this.calender = [
				{ name: "1Q", courses: [] },
				{ name: "2Q", courses: [] },
			];
		}
		else if (quarterCheck.innerText.match("3Q")) {
			semester = 1;
			this.calender = [
				{ name: "3Q", courses: [] },
				{ name: "4Q", courses: [] },
			];
		}
		else {
			throw new Error("現在のクオーターを正しく取得できませんでした");
		}
		for (let tag of this.tags[semester]) {
			Array.from(result.getElementsByClassName(tag.className)).forEach(element => {
				// 集中講義等以外の場合
				if (element.getAttribute("data-jwc")) {
					this.calender[tag.quarter].courses.push(convertCourseElement(
						element.children[3].innerText, // 曜日・時限
						element.children[2].innerText, // 科目コード
						element.children[0].innerText, // 授業科目名
						element.children[5].innerText, // 授業担当教員
					))
				}
				// 集中講義等の場合
				else {
					this.calender[tag.quarter].courses.push(convertCourseElement(
						element.nextSibling.innerText, // 曜日・時限
						element.nextSibling.nextSibling.nextSibling.innerText, // 科目コード
						element.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstElementChild.firstElementChild.innerText, // 授業科目名
						element.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerText, // 授業担当教員
					))
				}
			});
		}
		/*
		this.calender[0].courses.push({
			"time": [],
			"code": "ENR.Z492",
			"title": "エネルギー講究F1 ",
			"teacher": "指導教員",
			"room": ""
		});
		*/
		
		chrome.storage.local.set({
			calender: this.calender,
		});
	},
	
};
