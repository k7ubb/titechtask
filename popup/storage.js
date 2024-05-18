const Storage = {

	keys: ["token", "courses", "tasks", "submission", "lastupdate", "calender", "quarterIndex", "username"],
	
	token: "",
	courses: [],
	tasks: [],
	submission: [],
	lastupdate: undefined,
	calender: [],
	quarterIndex: 0,
	username: "",
	
	init: async function() {
		const storage = await chrome.storage.sync.get(this.keys);
		console.log(storage)
		for (let key of this.keys) {
			this[key] = storage[key] || this[key];
		}
	},
	
	get: function(key) {
		return this[key];
	},
	
	set: function(key, value) {
		console.log(key + ":" + JSON.stringify(value));
		this[key] = value;
		const data = {};
		for (let key of this.keys) {
			data[key] = this[key];
		}
		chrome.storage.sync.set(data);
	}
};
