class HighscoreTable extends Table{
    constructor(){
        super();
        this.headerElement;
        this.rowElement;
        this.cellElement;

        this.Start();
    }

    Start(){
        this.headerElement = new T_Header();
        this.rowElement = new T_Row();
        this.cellElement = new T_Cell();

    }

    AddHeader(text){
        this.headerElement.Create(text);

        if (this.rowElement._rows.length == 0){
            this.AddRow();
        }
        this._appendToElement(this.rowElement._rows[0], this.headerElement.header);
    }

    AddRow(){
        this.rowElement.Create();
        this._appendToElementByID(this.rowElement.row, this._tableID);
    }

    AddCell(position, text){
        for (let i = 0; i < this.rowElement._rows.length; i++){
            if(this.rowElement._rows[i].cells.length == 2){
                this.AddRow();
            }
        }

        
        for (let i = position; i < this.rowElement._rows.length; i++){
            this.cellElement.Create(text);
            this._appendToElement(this.rowElement._rows[i], this.cellElement.cell);
        }
        
    }

    /*
    AddRow(amount){
        let CreateRows = (amount)=>{
            for (let i = 0; i < amount; i++){
                CreateRow();
                this._rowArray.push(this.row);
            }
        }

        if (amount == undefined){
            CreateRows(1);
        } else{
            CreateRows(amount);
        }
    }

    

    AddCell(startFromIndex){
        let CreateCell = ()=>{
            for (let i = startFromIndex || 0; i < this._rowArray.length; i++){
                this.cell = this._createElement("td");
                this._cellIDNumber += 1;
                this._cellID = "myTd" + this._cellIDNumber;
                this.cell.setAttribute("id", this._cellID);
                this._appendToElementByID(this.cell, this._rowArray[i].id);
            }
        }
        CreateCell();
    }

    AddHeader(headername){
        this.headerElement = new T_Header();
        this.headerElement.Create(headername);

        if (this._rowArray.length == 0){this.AddRow();}

        this._appendToElementByID(this.headerElement.header, this._rowArray[0].id);
        

        /*
        let CreateHeader = ()=>{
            this.header = this._createElement("th");
            this._headerIDNumber += 1;
            this._headerID = "myTh" + this._headerIDNumber;
            this.header.setAttribute("id", this._headerID);
            this._headerArray.push(this.header);
            
            if (this._rowArray.length == 0){
                this.AddRow();
            }
            this._appendToElementByID(this.header, this._rowArray[0].id);
        }

        CreateHeader();
       


    }
    */
}