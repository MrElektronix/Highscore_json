let mongoose = require("mongoose");
let Schema = mongoose.Schema;


let PlayerSchema = new Schema({
	Name: String,
	Email: String,
	Subscribed: Boolean
});

module.exports = mongoose.model("Player", PlayerSchema);