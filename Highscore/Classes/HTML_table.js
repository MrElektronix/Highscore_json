class HTML_table {
	constructor(){
		
		this.table;
		this.tRow;
		this.tHeader;
		this.tCell;
		
		
		this.headerTextNode;
		this.cellTextNode;
	}
	
	CreateTable(){
		this.table = document.createElement("table");
		this.table.setAttribute("id", "myTable");
		document.body.appendChild(this.table);
	}
	
	AddToTable(header, data){
		this.tRow = document.createElement("tr");
		this.tRow.setAttribute("id", "myTr");
		document.getElementById("myTable").appendChild(this.tRow);

		this.tHeader = document.createElement("th");
		this.tHeader.setAttribute("id", "myTh");
		this.headerTextNode = document.createTextNode(header);
		this.tHeader.appendChild(this.headerTextNode);
		document.getElementById("myTable").rows[0].appendChild(this.tHeader);

		this.tCell = document.createElement("td");
		this.tCell.setAttribute("id", "myTr");
		this.cellTextNode = document.createTextNode(data);

		this.tCell.appendChild(this.cellTextNode);
		document.getElementById("myTr").appendChild(this.tCell);
	}
}