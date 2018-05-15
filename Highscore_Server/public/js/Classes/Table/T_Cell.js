class T_Cell extends Element{
    constructor(){
        super();
        this.cell = undefined;
        this.cells = [];
        this.cellText = undefined;
    }

    Create(text){
        this.cell = this._createElement("td");
        this.cellText = text;
        this.cell.appendChild(document.createTextNode(this.cellText));
        this.cells.push(this.cell);
    }
}