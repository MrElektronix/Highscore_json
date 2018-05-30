let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Player = require("./Player.Schema.js").schema;

let TeamSchema = new Schema({
	TeamName: String,
	Players: [Player],
	PlayerIndex: Number,
	Score: Number
});

module.exports = mongoose.model("Team", TeamSchema);