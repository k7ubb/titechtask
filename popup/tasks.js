const Tasks = {
	courses: [],
	tasks: [],
	submission: [],
	lastupdate: undefined,
	
	getCourseNameById: function(id) {
		for (let course of this.courses) {
			if (course.id === id) {
				return course.name;
			}
		}
		return "";
	},
	
	isSubmitted: function(id) {
		return this.submission.indexOf(id) !== -1;
	},
	
	submit: function(id) {
		!this.isSubmitted(id) && this.submission.push(id);
		chrome.storage.local.set({ submission: this.submission });
	},
	
	unsubmit: function(id) {
		this.submission = this.submission.filter((t) => t !== id);
		chrome.storage.local.set({ submission: this.submission });
	},
	
	updateTasks: async function() {
		this.courses = [];
		this.tasks = [];
		(await T2Schola.wsfunction("mod_assign_get_assignments")).courses.forEach((course) => {
			this.courses.push({
				name: course.fullname.split(/ \/ /)[0],
				id:   course.id,
			});
			course.assignments.forEach((assignment) => {
				this.tasks.push({
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
			this.tasks.push({
				type:     "quiz",
				subject:  this.getCourseNameById(quiz.course),
				id:       quiz.id,
				url:      `https://t2schola.titech.ac.jp/mod/quiz/view.php?id=${quiz.coursemodule}`,
				name:     quiz.name,
				deadline: quiz.timeclose,
			});
		});
		(await T2Schola.wsfunction("mod_workshop_get_workshops_by_courses")).workshops.forEach((workshop) => {
			this.tasks.push({
				type:     "workshop",
				subject:  this.getCourseNameById(workshop.course),
				id:       workshop.id,
				url:      `https://t2schola.titech.ac.jp/mod/workshop/view.php?id=${workshop.coursemodule}`,
				name:     workshop.name,
				deadline: workshop.submissionend,
			});
		});
		chrome.storage.local.set({
			courses: this.courses,
			tasks: this.tasks.sort((a, b) => a.deadline - b.deadline),
			lastupdate: Math.floor(new Date().getTime()/1000),
		});
	},
	
	updateSubmission: async function() {
		const userid = (await T2Schola.wsfunction("core_webservice_get_site_info")).userid;
		for (let task of this.tasks) {
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
		chrome.storage.local.set({ submission: this.submission });
	},
};
