const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const EventSchema = require("./Event.Schema.js").schema;

let DaySchema = new Schema({
    currentDate: String,
	Events: [EventSchema],
	EventIndex: Number,
});

module.exports = mongoose.model("DaySchema", DaySchema);