const Tasks = {
	showSubmitted: false,
	
	getCourseNameById: function(id) {
		for (let course of Storage.get("courses")) {
			if (course.id === id) {
				return course.name;
			}
		}
		return "";
	},
	
	isSubmitted: function(id) {
		return Storage.get("submission").indexOf(id) !== -1;
	},
	
	submit: function(id) {
		if (this.isSubmitted(id)) {
			Storage.set("submission", [...Storage.get("submission"), id]);
		}
	},
	
	unsubmit: function(id) {
		Storage.set("submission", Storage.get("submission").filter((t) => t !== id));
	},
	
	updateTasks: async function() {
		const courses = [];
		const tasks = [];
		(await T2Schola.wsfunction("mod_assign_get_assignments")).courses.forEach((course) => {
			courses.push({
				name: course.fullname.split(/ \/ /)[0],
				id:   course.id,
			});
			course.assignments.forEach((assignment) => {
				tasks.push({
					type:     "assignment",
					subject:  course.fullname.split(/ \/ /)[0],
					id:       assignment.id,
					url:      `https://t2schola.titech.ac.jp/mod/assign/view.php?id=${assignment.cmid}`,
					name:     assignment.name,
					deadline: assignment.duedate,
				});
			});
		});
		(await T2Schola.wsfunction("mod_quiz_get_quizzes_by_courses")).quizzes.forEach((quiz) => {
			tasks.push({
				type:     "quiz",
				subject:  this.getCourseNameById(quiz.course),
				id:       quiz.id,
				url:      `https://t2schola.titech.ac.jp/mod/quiz/view.php?id=${quiz.coursemodule}`,
				name:     quiz.name,
				deadline: quiz.timeclose,
			});
		});
		(await T2Schola.wsfunction("mod_workshop_get_workshops_by_courses")).workshops.forEach((workshop) => {
			tasks.push({
				type:     "workshop",
				subject:  this.getCourseNameById(workshop.course),
				id:       workshop.id,
				url:      `https://t2schola.titech.ac.jp/mod/workshop/view.php?id=${workshop.coursemodule}`,
				name:     workshop.name,
				deadline: workshop.submissionend,
			});
		});
		Storage.set("lastupdate", Math.floor(new Date().getTime()/1000));
		Storage.set("courses", courses);
		Storage.set("tasks", tasks);
	},
	
	updateSubmission: async function() {
		const userid = (await T2Schola.wsfunction("core_webservice_get_site_info")).userid;
		for (let task of Storage.get("tasks")) {
			if (task.type === "assignment" && !this.isSubmitted(task.id)) {
				const result = await T2Schola.wsfunction("mod_assign_get_submission_status", {
					userid,
					assignid: task.id,
				});
				if (result.lastattempt?.submission.status === "submitted") {
					this.submit(task.id);
				}
			}
		}
	},
/*
	updateSubmission: async function() {
		const userid = (await T2Schola.wsfunction("core_webservice_get_site_info")).userid;
		const fetches = [];
		for (let task of this.tasks) {
			if (task.type === "assignment" && !this.isSubmitted(task.id)) {
				fetches.push(T2Schola.wsfunction("mod_assign_get_submission_status", {
					userid,
					assignid: task.id,
				}));
			}
		}
		const results = await Promise.all(fetches);
		for (result of results) {
			if (result.lastattempt?.submission.status === "submitted") {
				this.submit(result.lastattempt.submission.assignment);
			}
		}
		chrome.storage.sync.set({ submission: this.submission });
	},
*/
};
