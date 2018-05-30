class T_Header extends Element{
    constructor(){
        super();
        this.header;
        this.headers = [];
        this.headerText;

    }

    Create(text){
        this.header = this._createElement("th");
        this.headerText = text;
        this.header.appendChild(document.createTextNode(this.headerText));
        this.headers.push(this.header);
    }
}