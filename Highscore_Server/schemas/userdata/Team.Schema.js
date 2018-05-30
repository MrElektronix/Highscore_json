let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let PlayerSchema = require("./Player.Schema.js").schema;

let TeamSchema = new Schema({
	TeamName: String,
	Players: [PlayerSchema],
	PlayerIndex: Number,
	Score: Number
});

module.exports = mongoose.model("TeamSchema", TeamSchema);