class DaySchemaClass {
    constructor(path){
        this.path = path;

        this.DaySchema = require(this.path);
        this.start(this.DaySchema);
    }

    start(schemaname){
        console.log(schemaname);
    }
}