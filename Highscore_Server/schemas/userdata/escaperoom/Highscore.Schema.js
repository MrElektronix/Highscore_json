const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let HighscoreSchema = new Schema({
    Scores: Array,
    TeamNames: Array,
    scoreCount: Number,
    maxScores: Number,
    Rooms: Array
});

module.exports = mongoose.model("HighscoreSchema", HighscoreSchema);