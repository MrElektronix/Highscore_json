let mongoose = require("mongoose");
let Schema = mongoose.Schema;


let LasergameSchema = new Schema({
	Kills: Number,
	Deaths: Number,
	KD: Number
});