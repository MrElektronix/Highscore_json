const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let HighscoreSchema = new Schema({
    Scores: Array,
    TeamNames: Array,
    Rooms: Array,
    scoreCount: Number,
    maxScores: Number
});

module.exports = mongoose.model("HighscoreSchema", HighscoreSchema);