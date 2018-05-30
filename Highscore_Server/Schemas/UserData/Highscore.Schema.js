let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let HighscoreSchema = new Schema({
    Scores: Array,
    TeamNames: Array
});

module.exports = mongoose.model("Score", HighscoreSchema);