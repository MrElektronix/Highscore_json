const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PlayerSchema = new Schema({
    playerName: String,
    playerEmail: String,
    playerSubscribed: Boolean
});

module.exports = mongoose.model("PlayerSchema", PlayerSchema);