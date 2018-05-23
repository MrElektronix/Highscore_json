var express = require("express");
var app = express();
let mysql = require("mysql");

var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

app.set("port", process.env.PORT || 3000);

var clients = [];


io.on("connection", function(socket){
	var currentUser;
	
	socket.on("user_connect", function(data){
		const db = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "",
			database: "highscores"
		});

		db.connect((err)=>{
		if (err) throw err;
		console.log("mysql connected");
		});
		
		
		app.get("/addInformation", (req, res)=>{
			let info = data;
			let sql = "INSERT INTO main SET ?";
			let query = db.query(sql, info, (err, result)=>{
			if (err) throw err;
			console.log(result);
			res.send("Added information");
		});
		
		//console.log(data);
	});
});

server.listen(app.get("port"), function(){
	console.log("-----Server is Running !-----");
});



app.get("/createdb", (req, res)=>{
	let sql = "CREATE DATABASE highscores";
	db.query(sql, (err, result)=>{
		if (err) throw err;
		console.log(result);
		res.send("Database created");
	});
});

app.get("/createhighscorestable", (req, res)=>{
	let sql = "CREATE TABLE main(id int AUTO_INCREMENT, Event VARCHAR(255), Gamemode VARCHAR(255), PRIMARY KEY (id))";
	db.query(sql, (err, result)=>{
		if (err) throw err;
		console.log(result);
		res.send("Main table created")
	});
});
