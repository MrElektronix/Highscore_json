class Dictionary {
    constructor(){
        this.dict = undefined;
        this.Start();
    }

    Start(){
        this.dict = {};
    }

    Add(key, value){
        this.dict[key] = value;
    }

    CheckDictionary(arrayName){
        let tempArray = [];
        for (let i = 0; i < arrayName.length; i++){
            for (let key in this.dict){
                let value = this.dict[key];
                if (arrayName[i] == value){
                    tempArray.push(key);
                }
            }
        }

        if(tempArray.length == arrayName.length) {
            return tempArray;
        }
    }
}

module.exports = Dictionary;