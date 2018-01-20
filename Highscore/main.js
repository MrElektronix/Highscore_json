var highscores;
var table;

function Init(){
	table = new HTML_table();
	
	fetch("highscores.json")
	.then(response => response.json())
	.then(data => {
		highscores = data;
		table.CreateTable();
		highscores.forEach(function(element){
			table.AddToTable(element.name, element.score);
		})
	})
	
	Update();
}

function Update(){
	requestAnimationFrame(Update);
}

Init();