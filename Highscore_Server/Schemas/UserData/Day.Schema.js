let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Event = require("./Event.Schema.js").schema;

let DaySchema = new Schema({
	currentDate: String,
	Events: [Event],
	EventIndex: Number,
	TeamIndex: Number
});


module.exports = mongoose.model("Day", DaySchema);