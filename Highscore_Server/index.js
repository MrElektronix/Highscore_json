const path = require("path");
const express = require('express');
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const port = 2000;
const ipadress = "5.157.85.78";
const teamNames = ["Apple", "Banana", "Blueberry", 
"Cherry", "Coconut", "Cranberry", "Fig", "Grape", 
"Kiwi", "Lemon", "Mango", "Orange", "Peach", "Pear", 
"Pineapple", "Raspberry", "Strawberry", "Watermelon"];
let fs = require("fs");
let teamNameUsed;

/* SCHEMA'S   */

const DaySchema = require("./schemas/userdata/Day.Schema");
const EventSchema = require("./schemas/userdata/Event.Schema");
const TeamSchema = require("./schemas/userdata/Team.Schema");
const PlayerSchema = require("./schemas/userdata/Player.Schema");
const ImageSchema = require("./schemas/userdata/Image.Schema");

const HighscoreSchema = require("./schemas/userdata/escaperoom/Highscore.Schema");


let roomScores = {
	room_8: [],
	qurantaine: [],
	the_bunker: [],
	vietnam_victim: [],
}

const roomNames = {
	room_8: "Room 8",
	qurantaine: "Quarantaine",
	the_bunker: "The Bunker",
	vietnam_victim: "Vietnam v"
}



/*-------------------------------------------------------------------------------------*/
/* CONNECTIONS  */
mongoose.connect("mongodb://localhost/database");

app.use(express.static("public"));

app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res)=>{
    res.send("Hello World !");
});

// Page where the highscoreTable is displayed
app.get("/Highscore_Table", (req, res)=>{
	
    HighscoreSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		
		if (results) {
			
			roomScores.room_8 = [];
			roomScores.qurantaine = [];
			roomScores.the_bunker = [];
			roomScores.vietnam_victim = [];

			for (let i = 0; i < results.Rooms.length; i++){
				if (results.Rooms[i] === roomNames.room_8){
					roomScores.room_8.push({name: results.TeamNames[i], score: results.Scores[i]});
				} else if (results.Rooms[i] === roomNames.qurantaine){
					roomScores.qurantaine.push({name: results.TeamNames[i], score: results.Scores[i]});
				} else if (results.Rooms[i] === roomNames.the_bunker){
					roomScores.the_bunker.push({name: results.TeamNames[i], score: results.Scores[i]});
				} else if (results.Rooms[i] === roomNames.vietnam_victim){
					roomScores.vietnam_victim.push({name: results.TeamNames[i], score: results.Scores[i]})
				} else{
					console.log("no score a man");
				}
			}

			roomScores.room_8.sort((a, b)=>{
				return ('' + b.score).localeCompare(a.score);
			});

			roomScores.qurantaine.sort((a, b)=>{
				return ('' + b.score).localeCompare(a.score);
			});

			roomScores.the_bunker.sort((a, b)=>{
				return ('' + b.score).localeCompare(a.score);
			});

			roomScores.vietnam_victim.sort((a, b)=>{
				return ('' + b.score).localeCompare(a.score);
			});

			res.render('highscore.ejs', {
				room8_Info: roomScores.room_8, 
				qurantaine_Info: roomScores.qurantaine,
				thebunker_Info: roomScores.the_bunker,
				vietnamvictim_Info: roomScores.vietnam_victim,
			});
		} else{
			res.render('highscore.ejs', {
				room8_Info: roomScores.room_8,
				qurantaine_Info: roomScores.qurantaine,
				thebunker_Info: roomScores.the_bunker,
				vietnamvictim_Info: roomScores.vietnam_victim,
			});
		}
		
	});
	
	/*
	DaySchema.findOne({}, (err, results) =>{
		if (err) throw err;

		if (results){
			res.render("highscore.ejs", {Event: results.Events})
		} else{s
			res.render("highscore.ejs", {Event: "not found"})
		}
	});
	*/
});

app.get("/public", (req, res)=>{ 
    
});


http.listen(port, ipadress, (err)=>{
    if (err){return console.log("Error Occured: ", err)}

    console.log(`server is listening on ${port}`);
});


// Connection with SOCKET.IO//
io.on("connection", (socket)=>{
    console.log("user connected");

    socket.on("newDay", ()=>{
		RemoveSchemaData(HighscoreSchema);
		RemoveSchemaData(DaySchema);
		//CheckDay(CheckDate());
		//CheckImageSchema();
	})
	
	socket.on("newEvent", (data)=>{
		if (data.EventName == "Laser Gamen"){
			MakeEvent(data.EventName, "Team Deathmatch", CheckDate());
		} else{
			MakeEvent(data.EventName, data.GameMode, CheckDate());
		}
	});

	socket.on("newERTeam", (data)=>{
		MakeTeam(data.TeamName, CheckDate());
	});
	
	/*
	socket.on("newLGTeam", (data)=>{
		MakeTeam(data.TeamNameOne, CheckDate());
		MakeTeam(data.TeamNameTwo, CheckDate());
	})
	*/
	
	socket.on("newERPlayers", (data)=>{
		AddPlayers(data.PlayerInfo_names, data.PlayerInfo_email, CheckDate());
	});
	
	socket.on("sendMail", ()=>{ 
		ER_EmailData(CheckDate());
	});

	socket.on("newTime", (data)=>{
		//CheckTeamName(data.TeamName);
		CheckHighscore(data.GameMode, data.TeamName, data.Minutes, data.Seconds);
		//console.log(teamNameUsed);
		/*
		if (!teamNameUsed) {
			//CheckHighscore(data.TeamName, data.Minutes, data.Seconds);
		}
		*/
	});
	
	socket.on("newPhoto", (data)=>{
		SaveImage(data.Photo.toString());
	});

	/*
	let CheckTeamName = (teamname)=> { // check if teamname exist in the database
		HighscoreSchema.findOne({TeamNames: teamname}, (err, result)=>{
			if (err) throw err;
			if (result) {
				socket.emit("usedteamname", {alert: "used"});
				teamNameUsed = true;
				
			} else{
				socket.emit("usedteamname", {alert: "name NOT taken"});
				teamNameUsed = false;
			}
		});
	}
	*/
})

/*-------------------------------------------------------------------------------------*/
/* MAKE DAY */

let CheckDay = (date)=>{ // Check if the day exists with the date of today
    DaySchema.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (!day){
			MakeDay(date);
		} else{
			console.log("Day exists");
		}
	})
}

let MakeDay = (date)=>{
	let newDay = new DaySchema();
	newDay.currentDate = date;
	newDay.EventIndex = -1;
	SaveData(newDay);
}
/*-------------------------------------------------------------------------------------*/
/* MAKE PHOTO Schema */

let CheckImageSchema = ()=>{
	ImageSchema.findOne({}, (err, results)=>{
		if (err) throw err;

		if (!results){
			let newImage = new ImageSchema();
			newImage.Name = "escape"
			newImage.Count = -1;
			newImage.Format = "jpg";
			newImage.FullString = "";

			SaveData(newImage);
		}
	});
}

let SaveImage = (image)=>{
	ImageSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		if (results){
			results.Count += 1;
			results.FullString = results.Name + results.Count + "." + results.Format;
			SaveData(results);

			SaveLocalImage(results.FullString, image);
			console.log("photo taken");
			GetLocalImage(results.FullString);
		}
	});
}

/*-------------------------------------------------------------------------------------*/
/* MAKE EVENT */

let MakeEvent = (eventname, gamemode, date)=>{
	DaySchema.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day) {
			let newEvent = new EventSchema();
			newEvent.eventName = eventname;
			newEvent.eventGamemode = gamemode;
			newEvent.TeamIndex = -1;
			day.EventIndex += 1;
			day.Events.push(newEvent);

			SaveData(day);
		}
	});
}

/*-------------------------------------------------------------------------------------*/
/* MAKE TEAM */

let MakeTeam = (teamname, date)=>{
	DaySchema.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day){
			let newTeam = new TeamSchema();
			newTeam.TeamName = teamname;

			day.Events[day.EventIndex].TeamIndex += 1;
			day.Events[day.EventIndex].eventTeams.push(newTeam);
			SaveData(day);
		}
	});
}

/*-------------------------------------------------------------------------------------*/
/* ADD PLAYERS */
let AddPlayers = (name, email, date)=>{
	ClearConsole();
	DaySchema.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		if (day){
			let newPlayer = new PlayerSchema();
			newPlayer.playerName = name;
			newPlayer.playerEmail = email;
			newPlayer.playerSubscribed = true;
			
			day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players.push(newPlayer);
			SaveData(day);
		}
	});
};

/*-------------------------------------------------------------------------------------*/
/* SAVE HIGHSCORES */
let CheckHighscore = (room, team, minutes, seconds)=>{
	HighscoreSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		let score = minutes + " min " + "& " + seconds + " sec";
		if (!results) {
			
			let high = new HighscoreSchema();

			high.Scores.push(score);
			high.TeamNames.push(team);
			high.Rooms.push(room);
			high.Room8_Count = 0;
			high.Qurantiane_Count = 0;
			high.TheBunker_Count = 0;
			high.VietnamVictim_Count = 0;
			high.TotalNumberCount = 0;
			high.maxScores = 10;

			if (room == roomNames.room_8){high.Room8_Count += 1;  high.TotalNumberCount += 1}
			if (room == roomNames.qurantaine){high.Qurantiane_Count += 1; high.TotalNumberCount += 1}
			if (room == roomNames.the_bunker){high.TheBunker_Count += 1; high.TotalNumberCount += 1}
			if (room == roomNames.vietnam_victim){high.VietnamVictim_Count += 1; high.TotalNumberCount += 1}
			SaveData(high);

		} else{
			if (room == roomNames.room_8 && results.Room8_Count < results.maxScores){
				results.Room8_Count += 1

				results.Scores.push(score);
				results.TeamNames.push(team);
				results.Rooms.push(room);
				results.TotalNumberCount += 1;
				SaveData(results);	
			} else if (room == roomNames.qurantaine && results.Qurantiane_Count < results.maxScores){
				results.Qurantiane_Count += 1

				results.Scores.push(score);
				results.TeamNames.push(team);
				results.Rooms.push(room);
				results.TotalNumberCount += 1;
				SaveData(results);	
			} else if (room == roomNames.the_bunker && results.TheBunker_Count < results.maxScores){
				results.TheBunker_Count += 1

				results.Scores.push(score);
				results.TeamNames.push(team);
				results.Rooms.push(room);
				results.TotalNumberCount += 1;
				SaveData(results);	
			} else if (room == roomNames.vietnam_victim && results.VietnamVictim_Count < results.maxScores){
				results.VietnamVictim_Count += 1

				results.Scores.push(score);
				results.TeamNames.push(team);
				results.Rooms.push(room);
				results.TotalNumberCount += 1;
				SaveData(results);
			} else{
				results.maxScores = 10;
			}
		}
	});
}

/*-------------------------------------------------------------------------------------*/
/* SCHEMA FUNCTIONS */
let SaveData = (data) =>{
	data.save((err)=>{
		if (err) throw err;
		console.log("Saved !");
	});
}

let RemoveSchemaData = (schemaName)=>{
	schemaName.remove({}, (err, data)=>{
		if (err) throw err;
		console.log("Removed: ");
	});
}

/*-------------------------------------------------------------------------------------*/
/* MISC */

let CheckDate = () =>{ // Get the date of today
	let today = new Date();
	let dd = today.getDate();
	let mm = today.getMonth();
	let yyyy = today.getFullYear();
	if (mm < 10 ){mm = "0" + mm;}
	if (dd < 10){dd = "0" + dd;}
	
	today = (dd + "/" + mm + "/" + yyyy);
	 
	return today.toString();
}

let SortArray = (arrayName, sortingWay)=>{ // Sort an array from small to big or big to small
    arrayName.sort(function(a,b){
		if (sortingWay == "small"){
			return a - b;
		} else if (sortingWay == "big"){
			return b-a;
		} 
    });
}

let ClearConsole = ()=>{
	process.stdout.write('\033c');
}


let SaveLocalImage = (imageName, base64Data)=>{
	fs.writeFile("./public/images/" + imageName, new Buffer(base64Data, "base64"), (err)=>{
		if (err) throw err;
	});
}

let GetLocalImage = (imageName)=>{
	fs.readFile("./public/images/" + imageName, (err)=>{
		if (err) throw err;
	});
}

let DeleteLocalImage = (imageName)=>{
	fs.unlinkSync("./public/images/" + imageName, (err, data)=>{
		if (err) throw err;
		console.log("Deleted: " + data);
	});
}
/* ----------------------Email -------------------------------------------------------------------------*/
/* -----------------------------------------------------------------------------------------------------*/

const nodemailer = require('nodemailer'),
creds = require('./creds'),
transporter = nodemailer.createTransport({
	service: "gmail", 
	auth: {
		user: creds.user,
		pass: creds.pass,
	},
}),
EmailTemplate = require('email-templates').EmailTemplate,
Promise = require('bluebird');

let ERUsers = [
	{
		name: "",
		email: "",
		fotoLink: "",
		time: ""
	}
];

let ER_EmailData = ()=>{
	//ClearConsole();

	ImageSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		if (results){
			ERUsers[0].fotoLink = "http://5.157.85.78:2000/images/" + results.FullString;
		}
	});

	HighscoreSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		if (results){
			ERUsers[0].time = results.Scores[results.Scores.length - 1];
		}
	});

	GoNext(CheckDate());
}

let GoNext = (date)=>{
	DaySchema.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day){

			for (let p = 0; p < day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players.length; p++){
				ERUsers[0].name = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerName;
				ERUsers[0].email = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerEmail;
				SendER_Email(ERUsers);
			}
		}
		
	});
}
	
function sendEmail (obj) {
	return transporter.sendMail(obj);
}

function loadTemplate (templateName, contexts) {
	let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
	return Promise.all(contexts.map((context) => {
		return new Promise((resolve, reject) => {
			template.render(context, (err, result) => {
				if (err) reject(err);
				else resolve({
					email: result,
					context,
				});
			});
		});
	}));
}


let SendER_Email = (obj)=>{
	loadTemplate('mail-escape-room', obj).then((results) => {
		return Promise.all(results.map((result) => {
			sendEmail({
				to: result.context.email,
				from: "UpEvents",
				subject: result.email.subject,
				html: result.email.html,
				text: result.email.text,
			});
		}));
	}).then(() => {
		console.log('send ER mail!');
		//DeleteLocalImage("escape.jpg");
	});
}
