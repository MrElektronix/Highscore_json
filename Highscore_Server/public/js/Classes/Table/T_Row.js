class T_Row extends Element{
    constructor(){
        super();
        this.row;
        this._id;
        this._idNumber;
        this._rows = [];
        this.Start();
    }

    Start(){
        this._idNumber = -1;
    }

    Create(){
        this.row = this._createElement("tr");
        this._idNumber += 1;
        this.id = "myTr" + this._idNumber;
        this.row.setAttribute("id", this.id);
        this._rows.push(this.row);
    }
}