const path = require("path");
const express = require('express');
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const port = 2000;
const ipadress = "5.157.85.78";

let fs = require("fs");
let teamNameUsed;

/* SCHEMA'S   */

const DaySchema = require("./schemas/userdata/Day.Schema");
const EventSchema = require("./schemas/userdata/Event.Schema");
const TeamSchema = require("./schemas/userdata/Team.Schema");
const PlayerSchema = require("./schemas/userdata/Player.Schema");
//const ImageSchema = require("./schemas/userdata/Image.Schema");
const ImageLibrarySchema = require("./schemas/userdata/ImageLibrary.Schema");
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
	
    HighscoreSchema.findOne({}, (err, result)=>{
		if (err) throw err;
		
		if (result) {

			roomScores.room_8 = [];
			roomScores.qurantaine = [];
			roomScores.the_bunker = [];
			roomScores.vietnam_victim = [];
			
			for (let i = 0; i < result.Data.length; i++){
				if (result.Data[i].roomname === roomNames.room_8){
					roomScores.room_8.push({name: result.Data[i].teamname, score: result.Data[i].time});
				} else if (result.Data[i].roomname === roomNames.qurantaine){
					roomScores.qurantaine.push({name: result.Data[i].teamname, score: result.Data[i].time});
				} else if (result.Data[i].roomname === roomNames.the_bunker){
					roomScores.the_bunker.push({name: result.Data[i].teamname, score: result.Data[i].time});
				} else if (result.Data[i].roomname === roomNames.vietnam_victim){
					roomScores.vietnam_victim.push({name: result.Data[i].teamname, score: result.Data[i].time})
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
		//RemoveSchemaData(ImageLibrarySchema)
		//DeleteLocalImage("escape0.jpg");
		//DeleteLocalImage("escape1.jpg");
		//DeleteLocalImage("escape2.jpg");
		CheckLibrary();
		CheckDay(CheckDate());
		//CheckImageSchema();
	})
	
	socket.on("newEvent", (data)=>{
		CheckLibrary();
		if (data.EventName == "Laser Gamen"){
			MakeEvent(data.EventName, "Team Deathmatch", CheckDate());
		} else{
			MakeEvent(data.EventName, data.GameMode, CheckDate());
		}
	});

	socket.on("newERTeam", (data)=>{
		//CountUp();
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
		SaveInLibrary(data.Photo.toString());
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

let CountUp = ()=>{
	ImageSchema.findOne({}, (err, result)=>{
		if (err) throw err;
		if (result){
			result.Count += 1;
			console.log("opgeteld");
			result.FullString = result.Name + result.Count + "." + result.Format;
			SaveData(result);
		}
	});
}


let SaveInLibrary = (image)=>{
	ImageLibrarySchema.findOne({}, (err, result)=>{
		if (err) throw err;
		if (result){
			result.Count += 1;
			result.FullString = result.Name + result.Count + "." + result.Format;
			result.PhotoNames.push(result.FullString);
			result.TotalDays.push(25);
			result.markModified("PhotoNames");
			result.markModified("TotalDays");

			console.log("hiero: "+ result.FullString);
			SaveLocalImage(result.FullString, image);
			console.log("photo taken");
			GetLocalImage(result.FullString);
			SaveData(result);
		}
	});

	CheckImageRemove();
	/*
	ImageSchema.findOne({}, (err, result)=>{
		if (err) throw err;
		if (result){
			console.log("hiero: "+ result.FullString);
			SaveLocalImage(result.FullString, image);
			console.log("photo taken");
			GetLocalImage(result.FullString);
		}
	});
	*/	
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

let CheckLibrary = ()=>{
	ClearConsole();
	ImageLibrarySchema.findOne({}, (err, result)=>{
		if (err) throw err;

		if (!result){
			let newImage = new ImageLibrarySchema();
			newImage.Name = "escape"
			newImage.Count = -1;
			newImage.Format = "jpg";
			newImage.FullString = "";
			newImage.PhotoNames = [];
			newImage.TotalDays = [];
			newImage.MaximumDays = 1;
			SaveData(newImage)
		}
	});
}

let CheckImageRemove = ()=>{
	//ClearConsole();
	console.log("rewmove");
	ImageLibrarySchema.findOne({}, (err, result)=>{
		if (err) throw err;

		if (result){
			console.log("yuhhh");
			for (let i = 0; i < result.TotalDays[i].length; i++){
				if (result.TotalDays[i] <= result.MaximumDays){
					result.TotalDays[i] -= 1;
					SaveData(result);
					console.log(result.TotalDays[i]);
				}
				/*
				if (result.MaximumDays <= 0){
					DeleteLocalImage(result.PhotoNames[i]);
					result.TotalDays.splice(i, 1);
					//result.markModified("TotalDays");
					SaveData(result);
				}
				*/
			}
		}
	});
}

/*-------------------------------------------------------------------------------------*/
/* SAVE HIGHSCORES */
// Here are the highscores checked and or saved when they are filled in.
let CheckHighscore = (room, team, minutes, seconds)=>{
	HighscoreSchema.findOne({}, (err, result)=>{ 
		if (err) throw err;
		let score = minutes + " min " + "& " + seconds + " sec";

		if (!result){ // If HighscoreSchema is empty
			let high = new HighscoreSchema();
			high.Data.push({roomname: room, teamname: team, time: score});
			high.Room8_Count = 0;
			high.Qurantiane_Count = 0;
			high.TheBunker_Count = 0;
			high.VietnamVictim_Count = 0;
			high.maxScore = 2;

			if (room == roomNames.room_8){high.Room8_Count += 1;}
			if (room == roomNames.qurantaine){high.Qurantiane_Count += 1;}
			if (room == roomNames.the_bunker){high.TheBunker_Count += 1;}
			if (room == roomNames.vietnam_victim){high.VietnamVictim_Count += 1;}
			ERUsers[0].time = score;
			SaveData(high);
		} else{ // If the HighscoreSchema is not empty
			if (room == roomNames.room_8 && result.Room8_Count < result.maxScore){
				ERUsers[0].time = score;
				result.Room8_Count += 1;
				result.Data.push({roomname: room, teamname: team, time: score});
				result.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(result);
			} else if (room == roomNames.qurantaine && result.Qurantiane_Count < result.maxScore){
				ERUsers[0].time = score;
				result.Qurantiane_Count += 1;
				result.Data.push({roomname: room, teamname: team, time: score});
				result.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(result);	
			} else if (room == roomNames.the_bunker && result.TheBunker_Count < result.maxScore){
				ERUsers[0].time = score;
				result.TheBunker_Count += 1;
				result.Data.push({roomname: room, teamname: team, time: score});
				result.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(result);	
			} else if (room == roomNames.vietnam_victim && result.VietnamVictim_Count < result.maxScore){
				ERUsers[0].time = score;
				result.VietnamVictim_Count += 1
				result.Data.push({roomname: room, teamname: team, time: score});
				result.Data.sort((a, b)=>{
					return ('' + b.time).localeCompare(a.time);
				});
				SaveData(result);
			} else { // if scoreboard is full and a new time comes along
				if (room == roomNames.room_8 && result.Room8_Count == result.maxScore){
					ERUsers[0].time = score;
					console.log("room 8");
					for (let i in result.Data){
						if (score > result.Data[i].time){
							result.Data[i].time = score;
							result.Data[i].teamname = team;
							result.markModified("Data");
							SaveData(result);
							break;
						}
					}
				}
			}
		}	
	});
}

/*
let ReplaceStuff = (score, team, room)=>{
	HighscoreSchema.findOne({}, (err, result)=>{
		if (room == roomNames.room_8 && result.Room8_Count == result.maxScore){
			console.log("room 8");
			for (let i in result.Data){
				if (score > result.Data[i].time){
					result.Data[i].time = score;
					result.Data[i].teamname = team;
					result.markModified("Data");
					SaveData(result);
					//result.Data[i].time = score;
					//result.Data[i].teamname = team;
					
					result.save((err)=>{
						if (err) throw err;
						console.log("Saved !" + result);
					});
					
				}
			}
		}
	});
}
*/


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
	ImageLibrarySchema.findOne({}, (err, result)=>{
		if (err) throw err;
		if (result){
			for (let i in result.PhotoNames){
				ERUsers[0].fotoLink = "http://5.157.85.78:2000/images/" + result.PhotoNames[result.Count];
			}
		} else{
			console.log("No Image");
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
	loadTemplate('mail-escape-room', obj).then((result) => {
		return Promise.all(result.map((result) => {
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
