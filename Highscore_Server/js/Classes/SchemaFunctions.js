class SchemaFunctions {
    constructor(){

    }

    SearchInSchema(schemaName){
        schemaName.findOne({}, (err, results)=>{
            if (err) {throw err}
            if (results){
                return results;
            }
        });
    }

    SearchInSchemaPlus(schemaName, name, thing){
        schemaName.findOne({name: thing}, (err, results)=>{
            if (err) {throw err}
            if (results){
                return results;
            }
        });
    }

    SaveData(data){
        data.save((err)=>{
            if (err) throw err;
            console.log("Saved !" + data);
        });
    }

    RemoveSchemaData(schemaName){
        schemaName.remove({}, (err, data)=>{
            if (err) throw err;
            console.log("Removed: " + data);
        });
    }
}

module.exports = SchemaFunctions;