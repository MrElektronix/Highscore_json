const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ImageLibrarySchema = new Schema({
    PhotoNames: Array, // De namen van de fotos
    TotalDays: Array, // Een array die voor elke foto bijhoud hoeveel dagen hij nog wordt opgeslagen
    MaximumDays: Number, // Het maximaal aantal dagen dat een foto wordt bewaard
});

module.exports = mongoose.model("ImageLibrarySchema", ImageLibrarySchema);