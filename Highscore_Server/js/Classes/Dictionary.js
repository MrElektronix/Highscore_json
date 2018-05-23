class Dictionary {
    constructor(){
        this.dict = undefined;
    }

    Start(){
        this.dict = {};
    }

    Add(key, value){
        this.dict[key] = value;
    }

    CheckDictionary(arrayName){
        let times = [];
        let teams = [];
        
        for (let i = 0; i < arrayName.length; i++){
            times.push(arrayName[i]);
        }

        for (let key in this.dict){
            let value = this.dict[key];
            for (let t = 0; t < times.length; t++){
                if (times[t] == value){
                    teams.push(value);
                }
            }
        }

    }
}


module.exports = Dictionary;