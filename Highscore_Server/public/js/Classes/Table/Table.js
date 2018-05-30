class Table extends Element{
    constructor(){
        super();
        this.table;
        this._tableID;
    }

    CreateTable(id){
        this.table = this._createElement("table");

        if (id == undefined || ""){
            this._tableID = "myTable";
        } else{
            this._tableID = id;
        }
        
        this.table.setAttribute("id", this._tableID);
        this._appendToBody(this.table);
    }

    
}