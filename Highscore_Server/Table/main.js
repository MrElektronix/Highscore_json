let table;
let dictionary;


let Start = ()=>{
    table = new HighscoreTable();
    /*
    table.CreateTable();
    table.AddHeader("Team Name");
    table.AddHeader("Score");
    

    dictionary = new Dictionary();
    dictionary.Add("jam", 3500);
    dictionary.Add("banaan", 2000);
    dictionary.Add("appel", 600);
    dictionary.Add("mango", 1000);
    dictionary.Add("peer", 2356);
    dictionary.Add("oker", 20);

    //dictionary.CheckDictionary();
    AddScores();
    */
    MakeERTable(5);
}


let MakeERTable = (size)=>{
    table.CreateTable();
    table.AddHeader("Team Name");
    table.AddHeader("Scores");

    for (let i = 0; i < size; i++){
        table.AddCell(i + 1, "hello");
    }
}

let AddScores = ()=>{
    let Scores = [];
    let key = (Object.keys(dictionary.dict));
    for (key in dictionary.dict){
        let value = dictionary.dict[key];
        Scores.push(value);
    }

    SortScores(Scores, 5);
}

let SortScores = (arrayName, maxSort)=>{
    arrayName.sort(function(a,b){
        return b-a;
    });
    
    let cuttOff = arrayName.length - maxSort; 
    for (let i = 0; i < arrayName.length - cuttOff; i++){
        table.AddCell(0, arrayName[i]);
    }
}


Start();