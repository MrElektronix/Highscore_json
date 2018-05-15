class Dictionary {
    constructor(){
        this.dict = undefined;
        //this.Start();
    }

    Start(){
        console.log("doct");
        //this.dict = {};
    }

    Add(key, value){
        this.dict[key] = value;
    }

    CheckDictionary(){
        for (let key in this.dict) {
            let value = this.dict[key];
            return value;
        }
    }
}

module.exports = Dictionary;