const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let HighscoreSchema = new Schema({
    Scores: Array,
    TeamNames: Array,
    Rooms: Array,
    scoreCount: Number,
    maxScores: Number,
    Room8_Count: Number,
    Qurantiane_Count: Number,
    TheBunker_Count: Number,
    VietnamVictim_Count: Number
});

module.exports = mongoose.model("HighscoreSchema", HighscoreSchema);