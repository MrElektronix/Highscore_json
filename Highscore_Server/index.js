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
let photoImage;
/* SCHEMA'S   */

const DaySchema = require("./schemas/userdata/Day.Schema");
const EventSchema = require("./schemas/userdata/Event.Schema");
const TeamSchema = require("./schemas/userdata/Team.Schema");
const PlayerSchema = require("./schemas/userdata/Player.Schema");
const HighscoreSchema = require("./schemas/userdata/escaperoom/Highscore.Schema");

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
			let scores = [];
			
			for (let i = 0; i < results.Scores.length; i++){
				scores.push({name: results.TeamNames[i], score: results.Scores[i]});
			}

			scores.sort((a, b)=>{
				//return b.score - a.score;
				return ('' + b.score).localeCompare(a.score);
			});

			res.render('highscore.ejs', {scoreArray: scores, teamNameArray: scores, image: "data:image/png;base64," + photoImage.toString()});
		} else{
			res.render('highscore.ejs', {scoreArray: "", teamNameArray: ""});
		}
	});
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
		CheckDay(CheckDate());
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
	
	socket.on("newLGTeam", (data)=>{
		MakeTeam(data.TeamNameOne, CheckDate());
		MakeTeam(data.TeamNameTwo, CheckDate());
	})
	
	socket.on("newERPlayers", (data)=>{
		AddPlayers(data.PlayerInfo_names, data.PlayerInfo_email, CheckDate());
	});
	
	socket.on("sendMail", ()=>{ 
		ER_EmailData(CheckDate());
	});

	socket.on("newTime", (data)=>{
		let randomName = teamNames[Math.floor(Math.random() * teamNames.length)];
		
		CheckTeamName(randomName);
		CheckHighscore(randomName, data.Minutes, data.Seconds);
	});

	socket.on("newPhoto", (data)=>{
		photoImage = data.Photo;
		console.log("photo taken");
	});

	/*
	socket.on("deleteTime", ()=>{
		RemoveSchemaData(HighscoreSchema);
	});
	*/

	let CheckTeamName = (teamname)=> {
		HighscoreSchema.findOne({TeamNames: teamname}, (err, result)=>{
			if (err) throw err;
			if (result) {
				socket.emit("catchdata", {alert: teamname});
			} else{
				socket.emit("catchdata", {alert: "name NOT taken"});
			}
		});
	}
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
let CheckHighscore = (team, minutes, seconds)=>{
	HighscoreSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		let score = minutes + " min " + "& " + seconds + " sec";
		if (!results) {
			
			let high = new HighscoreSchema();

			high.Scores.push(score);
			high.TeamNames.push(team);
			high.scoreCount = 0;
			high.maxScores = 10;
			high.scoreCount += 1;
			SaveData(high);
			
		} else{
			results.scoreCount += 1;
			if (results.scoreCount < results.maxScores){

				results.Scores.push(score);
				results.TeamNames.push(team);
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
		fotoLink: "http://milovanpelt.nl/Casper/1myp3r5geyyy.jpg",
		time: ""
	}
];

let ER_EmailData = (date)=>{
	//ClearConsole();
	DaySchema.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day){

			for (let p = 0; p < day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players.length; p++){
				ERUsers[0].name = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerName;
				ERUsers[0].email = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerEmail;
			}
		}
		
	});

	GoNext();
}

let GoNext = ()=>{
	HighscoreSchema.findOne({}, (err, results)=>{
		if (err) throw err;

		if (results){
			ERUsers[0].time = results.Scores[results.scoreCount - 1];
		}

		SendER_Email(ERUsers);
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
	});
}
