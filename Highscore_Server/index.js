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
//const ImageLibrarySchema = require("./schemas/userdata/ImageLibrarySchema.Schema");
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
			
			for (let i = 0; i < results.Data.length; i++){
				if (results.Data[i].roomname === roomNames.room_8){
					roomScores.room_8.push({name: results.Data[i].teamNames, score: results.Data[i].time});
				} else if (results.Data[i].roomname === roomNames.qurantaine){
					roomScores.qurantaine.push({name: results.Data[i].teamNames, score: results.Data[i].time});
				} else if (results.Data[i].roomname === roomNames.the_bunker){
					roomScores.the_bunker.push({name: results.Data[i].teamNames, score: results.Data[i].time});
				} else if (results.Data[i].roomname === roomNames.vietnam_victim){
					roomScores.vietnam_victim.push({name: results.Data[i].teamNames, score: results.Data[i].time})
				} else{
					console.log("no score a man");
				}
			}

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
		//RemoveSchemaData(HighscoreSchema);
		//RemoveSchemaData(DaySchema);
		//RemoveSchemaData(ImageSchema);
		//DeleteLocalImage("escape0.jpg");
		//DeleteLocalImage("escape1.jpg");
		//DeleteLocalImage("escape2.jpg");
		//LibrarySetup();
		CheckDay(CheckDate());
		CheckImageSchema();
	})
	
	socket.on("newEvent", (data)=>{
		CheckImageSchema();
		if (data.EventName == "Laser Gamen"){
			MakeEvent(data.EventName, "Team Deathmatch", CheckDate());
		} else{
			MakeEvent(data.EventName, data.GameMode, CheckDate());
		}
	});

	socket.on("newERTeam", (data)=>{
		CountUp();
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
		CheckImageSchema();
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

			SaveData(newImage)
		}
	});
}

let CountUp = ()=>{
	ImageSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		if (results){
			results.Count += 1;
			console.log("opgeteld");
			results.FullString = results.Name + results.Count + "." + results.Format;
			SaveData(results);
		}
	});
}

let SaveImage = (image)=>{

	ImageSchema.findOne({}, (err, results)=>{
		if (err) throw err;
		if (results){
			console.log("hiero: "+ results.FullString);
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
/* ADD IMAGE TO LIBRARY */
let LibrarySetup = ()=>{
	ClearConsole();
	ImageLibrarySchema.findOne({}, (err, results)=>{
		if (err) throw err;
		if (!results){
			let newLibrary = new ImageLibrarySchema();
			newLibrary.PhotoNames = [];
			newLibrary.TotalDays = [];
			newLibrary.MaximumDays = 25;
			SaveData(newLibrary);
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


			high.Data.push({roomname: room, teamname: team, time: score});
			high.Room8_Count = 0;
			high.Qurantiane_Count = 0;
			high.TheBunker_Count = 0;
			high.VietnamVictim_Count = 0;
			high.maxScores = 2;

			if (room == roomNames.room_8){high.Room8_Count += 1;}
			if (room == roomNames.qurantaine){high.Qurantiane_Count += 1;}
			if (room == roomNames.the_bunker){high.TheBunker_Count += 1;}
			if (room == roomNames.vietnam_victim){high.VietnamVictim_Count += 1;}

			SaveData(high);
		} else{
			if (room == roomNames.room_8 && results.Room8_Count < results.maxScores){
				results.Room8_Count += 1;
				results.Data.push({roomname: room, teamname: team, time: score});
				results.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(results);	
			} else if (room == roomNames.qurantaine && results.Qurantiane_Count < results.maxScores){
				results.Qurantiane_Count += 1;
				results.Data.push({roomname: room, teamname: team, time: score});
				results.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(results);	
			} else if (room == roomNames.the_bunker && results.TheBunker_Count < results.maxScores){
				results.TheBunker_Count += 1;
				results.Data.push({roomname: room, teamname: team, time: score});
				results.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(results);	
			} else if (room == roomNames.vietnam_victim && results.VietnamVictim_Count < results.maxScores){
				results.VietnamVictim_Count += 1
				results.Data.push({roomname: room, teamname: team, time: score});
				results.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(results);
			} else{ // if scoreboard is full and a new time comes along
				
				if (room == roomNames.room_8 && results.Room8_Count == results.maxScores){
					console.log("room 8");
					for (let i = 0; i < results.Data.length; i++){
						console.log(results.Data[i].time);
					}	
				} else if (room == roomNames.qurantaine && results.Qurantiane_Count == results.maxScores){
					for (let i = 0; i < results.Scores.length;){
						if (score > results.Scores[i]){
							results.Scores.splice(i, 1, score);
							results.TeamNames.splice(i, 1, team);

							results.Scores.splice(i, 0, score);
							results.TeamNames.splice(i, 0, team);

							results.Scores.push(score);
							results.TeamNames.push(team);
							SaveData(results);
							break;
						} else{
							i++;
						}
					}	
				} else if (room == roomNames.the_bunker && results.TheBunker_Count == results.maxScores){
					for (let i = 0; i > results.Scores.length;){
						if (score > results.Scores[i]){
							results.Scores.splice(i, 1, score);
							results.TeamNames.splice(i, 1, team);

							results.Scores.splice(i, 0, score);
							results.TeamNames.splice(i, 0, team);

							results.Scores.push(score);
							results.TeamNames.push(team);
							SaveData(results);
							break;
						} else{
							i++;
						}
					}
				} else if (room == roomNames.vietnam_victim && results.VietnamVictim_Count == results.maxScores){
					for (let i = 0; i < results.Scores.length;){
						if (score > results.Scores[i]){
							results.Scores.splice(i, 1, score);
							results.TeamNames.splice(i, 1, team);

							results.Scores.splice(i, 0, score);
							results.TeamNames.splice(i, 0, team);

							results.Scores.push(score);
							results.TeamNames.push(team);
							SaveData(results);
							break;
						} else{
							i++;
						}

					}
				}
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
	console.log(imageName);
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
		} else{
			console.log("No Image");
		}
	});

	GoHighscore();
}

let GoHighscore = ()=>{
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
				if (day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerName == "" 
				&& day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerEmail != ""){
					ERUsers[0].name = "";
					ERUsers[0].email = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerEmail;
					SendER_Email(ERUsers);
				} else if (day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerEmail == ""){
					console.log("no email");
				} else{
					ERUsers[0].name = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerName;
					ERUsers[0].email = day.Events[day.EventIndex].eventTeams[day.Events[day.EventIndex].TeamIndex].Players[p].playerEmail;
					SendER_Email(ERUsers);
				}
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
	});
}
