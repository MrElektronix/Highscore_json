const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TeamSchema = require("./Team.Schema.js").schema;

let EventSchema = new Schema({
    eventGamemode: String,
    eventTeams: [TeamSchema],
    TeamIndex: Number
});

module.exports = mongoose.model("EventSchema", EventSchema);