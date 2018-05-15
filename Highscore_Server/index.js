const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http").Server(app);
const path = require("path");
const io = require("socket.io")(http);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));

/* Schemas */
const Day = require("./Schemas/UserData/Day.Schema");
const Event = require("./Schemas/UserData/Event.Schema");
const Team = require("./Schemas/UserData/Team.Schema");
const Player = require("./Schemas/UserData/Player.Schema");
const Score = require("./Schemas/UserData/Highscore.Schema");
const teamNames = ["Apple", "Banana", "Blueberry", "Cherry", "Coconut", "Cranberry", "Fig", "Grape", "Kiwi", "Lemon", "Mango", "Orange", "Peach", "Pear", "Pineapple", "Raspberry", "Strawberry", "Watermelon"];
const Dictionary = require("./js/Classes/Dictionary");

let highDict = new Dictionary();
mongoose.connect("mongodb://localhost/database");

/*
app.get("/", (req, res)=>{
	res.sendFile(__dirname + "/views/" + "home.html");
});
*/

app.get('/table', (req, res)=>{
	Score.findOne({}, (err, results)=>{
		if (err) throw err;
		if (results) {
			for (let i = 0; i < results.Scores.length; i++){
				highDict.Add(results.TeamNames[i], results.Scores[i]);
			}
			
			SortScores(results.Scores);

			res.render('home.ejs', {scoreArray: results.Scores, teamNameArray: highDict.CheckDictionary(results.Scores)});
			
		} else{
			res.render('home.ejs', {scoreArray: "Nope", teamNameArray: "Nope"});
		}
	});
});

let SortScores = (arrayName)=>{
    arrayName.sort(function(a,b){
        return b-a;
    });
}

io.on("connection", (socket)=>{
	console.log("a user connected");
	
	socket.on("newDay", ()=>{
		RemoveSchemaData(Day);
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
		RemoveSchemaData(Score);
		//CheckHighscore(teamNames[Math.floor(Math.random() * teamNames.length)], data.Minutes, data.Seconds);
		socket.emit("catchdata", {hello: "hello"});
	});
});

let CheckDay = (date)=>{
	Day.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (!day){
			console.log("no day");
			MakeDay(date);
		} else{
			console.log("Day exists");
		}
	})
}

let CheckHighscore = (team, minutes, seconds)=>{
	console.log("checking...");
	Score.findOne({}, (err, results)=>{
		if (err) throw err;
		let score = minutes + " min " + seconds + " sec";
		if (!results) {
			
			let high = new Score();

			high.Scores.push(score);
			high.TeamNames.push(team);
			SaveData(high);
			
		} else{
			results.Scores.push(score);
			results.TeamNames.push(team);
			SaveData(results);
		}
	});

}

/*
let MakeERTable = (size)=>{
    table.CreateTable();
    table.AddHeader("Team Name");
    table.AddHeader("Scores");

    for (let i = 0; i < size; i++){
        table.AddCell(i + 1, "hello");
    }
}
*/

let MakeDay = (date)=>{
	let newDay = new Day();
	newDay.currentDate = date;
	newDay.EventIndex = -1;
	newDay.TeamIndex = -1;
	SaveData(newDay);
}

let MakeEvent = (eventname, gamemode, date)=>{
	Day.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day) {
			let newEvent = new Event();
			console.log(eventname);
			newEvent.Name = eventname;
			newEvent.Gamemode = gamemode;
			
			day.EventIndex += 1;
			day.Events.push(newEvent);
			SaveData(day);
		}
	});
}

let MakeTeam = (teamname, date)=>{
	Day.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day){
			let newTeam = new Team();
			newTeam.TeamName = teamname;
			newTeam.PlayerIndex = -1;
			
			day.TeamIndex += 1;
			day.Events[day.EventIndex].Teams.push(newTeam);
			
			SaveData(day);
		}
	});
}


let AddPlayers = (name, email, date)=>{
	Day.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;

		if (day){
			let newPlayer = new Player();
			newPlayer.Name = name;
			newPlayer.Email = email;

			day.Events[day.EventIndex].Teams[day.TeamIndex].PlayerIndex += 1;
			day.Events[day.EventIndex].Teams[day.TeamIndex].Players.push(newPlayer);

			SaveData(day);
		}
	});
};


let SaveData = (data) =>{
	data.save((err)=>{
		if (err) throw err;
		console.log("Saved !" + data);
	});
}

let RemoveSchemaData = (schemaName)=>{
	schemaName.remove({}, (err, data)=>{
		if (err) throw err;
		console.log("Removed: " + data);
	});
}

let CheckDate = () =>{
	let today = new Date();
	let dd = today.getDate();
	let mm = today.getMonth();
	let yyyy = today.getYear();
	
	if (mm < 10 ){mm = "0" + mm;}
	if (dd < 10){dd = "0" + dd;}
	
	today = (dd + "/" + mm + "/" + yyyy);
	 
	return today.toString();
}


http.listen(3000, ()=>{
	console.log("listening on *:3000");
});

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
		fotoLink: "http://milovanpelt.nl/Casper/img-01.jpg",
		score: '159',
		min: '45',
		sec: '8',
	}
];
   
let ER_EmailData = (date)=>{
	Day.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;
		
		if (day){
			


			ERUsers[0].name = day.Events[day.EventIndex].Teams[day.TeamIndex].Players[0].Name;
			ERUsers[0].email = day.Events[day.EventIndex].Teams[day.TeamIndex].Players[0].Email;
			
			loadTemplate('mail-escape-room', ERUsers).then((results) => {
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
	});
}


let LTUsers = [
	/*
    {
        name: 'casper',
        email: 'casper-heringa@hotmail.com',
        fotoLink: "http://milovanpelt.nl/Casper/img-01.jpg",
        score: '125',
        kills: 45,
        deaths: 8,
        kd: 1.73,
    },
	*/
    // {
        // name: 'noag',
        // email: '19668@ma-web.nl',
        // fotoLink: "https://s3.amazonaws.com/gs-geo-images/10ccde09-8e2b-44fc-baa1-6c8673a6717e_l.jpg",
        // score: '120',
        // kills: 45,
        // deaths: 8,
    //     kd: 1.73,
    // },
    {
        name: 'milo',
        email: 'milovanpelt@gmail.com',
        fotoLink: "http://milovanpelt.nl/Casper/img-01.jpg",
        score: '159',
        kills: 45,
        deaths: 8,
        kd: 1.73,
    },
    // {
    //     name: 'Nabil',
    //     email: 'cheriqui.nabil@gmail.com',
    //     fotoLink: "http://milovanpelt.nl/Casper/img-01.jpg",
    //     score: '159',
    //     kills: 45,
    //     deaths: 8,
    //     kd: 1.73,
    // }
];
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

let SendLT_Email = (users)=>{
	loadTemplate('mail-laser-tag', users).then((results) => {
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
		console.log('send LT mail!');
	});
}

let SendER_Email = ()=>{
	loadTemplate('mail-escape-room', ERUsers).then((results) => {
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

