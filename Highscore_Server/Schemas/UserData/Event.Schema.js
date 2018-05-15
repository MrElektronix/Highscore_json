let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Team = require("./Team.Schema.js").schema;

let EventSchema = new Schema({
	Name: String,
	Gamemode: String,
	Teams: [Team]
});

module.exports = mongoose.model("Event", EventSchema);