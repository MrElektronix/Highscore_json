const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ImageSchema = new Schema({
    Name: String,
    Count: Number,
    Format: String,
    FullString: String
});

module.exports = mongoose.model("ImageSchema", ImageSchema);