const Data = {
	courses: [],
	tasks: [],
	submission: [],
	
	getCourseNameById: function(id) {
		for (let course of this.courses) {
			if (course.id === id) {
				return course.name;
			}
		}
		return "";
	},
	
	t2ScholaUpdate: async function() {
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
			tasks: this.tasks,
		});
	},
	
	updateSubmission: async function() {
		const userid = (await T2Schola.wsfunction("core_webservice_get_site_info")).userid;
		let i = 0;
		for (let task of this.tasks) {
			if (task.type === "assignment" && this.submission.indexOf(task.id) === -1 && ++i < 10){
				const result = await T2Schola.wsfunction("mod_assign_get_submission_status", {
					userid,
					assignid: task.id,
				});
				if (result.lastattempt?.submission.status === "submitted") {
					this.submission.push(task.id);
				}
			}
		}
		chrome.storage.local.set({ submission: this.submission });
/*
		for(let task of tasks){
			if(task.type == "assignment" && submitted.indexOf(task.id) == -1){
				(function(assignmentid){
					console.log("mod_assign_get_submission_status");
					updateAssignmentSubmissionStatus(token, userid, assignmentid, function(assignmentid){
						if(submitted.indexOf(assignmentid) == -1){
							drawTasks();
						}
					});
				})(task.id);
			}
		}
*/
	},
};
