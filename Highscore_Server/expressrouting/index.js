/*  Data */

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const path = require("path");

/* Schemas */
const Day = require("./Schemas/UserData/Day.Schema");
const Event = require("./Schemas/UserData/Event.Schema");
const Team = require("./Schemas/UserData/Team.Schema");
const Player = require("./Schemas/UserData/Player.Schema");

/* Table */
//const Table = require("./public/Classes/Table.js");

app.use(express.static("public"));
app.set("port", process.env.PORT || 3000);

//app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/database");

app.use(bodyParser());

app.post("/newDay", (req, res)=>{
	RemoveAllData(Day);
	CheckDay(CheckDate());
	Table.start();
});

app.post("/newEvent", (req, res)=>{
	if (req.body.EventName == "Laser Gamen"){
		MakeEvent(req.body.EventName, "Team Deathmatch", CheckDate());
	} else {
		MakeEvent(req.body.EventName, req.body.GameMode, CheckDate());
	}
});

app.post("/newERTeam", (req, res)=>{
	MakeTeam(req.body.TeamName, CheckDate());
});

app.post("/newLGTeam", (req, res)=>{
	MakeTeam(req.body.TeamNameOne, CheckDate());
	MakeTeam(req.body.TeamNameTwo, CheckDate());
});

app.post("/newERusers", (req, res)=>{
	AddPlayers(req.body.PlayerInfo_names, req.body.PlayerInfo_email, CheckDate());
});

app.post("/SendMail", (req, res)=>{
	ER_EmailData(CheckDate());
});


let CheckDay = (date)=>{
	/*
	newDay = new Day();
	newDay.teamName = "bramsteam";
	newDay.save();
	//later
	Day.findOne({teamName: "bramsteam"}, (err, day) => {
		day.teamName; //bramsteam;
	});
	*/

	Day.findOne({currentDate: date}, (err, day)=>{
		if (err) throw err;

		if (!day){
			console.log("no day");
			MakeDay(date);
		} else{
			console.log("Day exists");
		}
	});
}

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
		
		if (day){
			
			let newEvent = new Event();
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

app.get("/home.ejs", (req, res) => {
		
		Day.findOne({}, (err, day)=>{
			if (err) throw err;
			if (day){
				res.render("home", {
					teamArray: day.Events[day.EventIndex].Teams,
					//eventArray: day.Events,
					playerArray: day.Events[day.EventIndex].Teams[day.TeamIndex].Players,
				});
			}
		
		});
		//res.redirect(req.get('/home.ejs'));
});


let CheckDate = ()=>{
	let today = new Date();
	let dd = today.getDate();
	let mm = today.getMonth() + 1;
	let yyyy = today.getFullYear();

	if (mm < 10){
		mm = "0" + mm;
	}

	if (dd < 10){
		dd = "0" + dd;
	}

	today = (dd + "/" + mm + "/" + yyyy);
	
	return today.toString();
}

let CheckTime = (UnityTime)=>{
	let today = new Date();
	let seconds = today.getSeconds();
	let minutes = today.getMinutes();
	let hours = today.getHours();

	today = JSON.stringify(hours + ":"  + minutes + ":" + seconds);

	console.log("Unity Time: " + UnityTime);
	console.log("Javascript Time: " + today);
}

//io.on("connection", function(socket){

	//newData = new Data();
	//socket.on("addData", function(data){
		/*
		newData.Event = data.Event.toString();
		newData.Gamemode = data.Gamemode.toString();

		if (data.Event.toString() == "Lasergamen"){

		}
		if (data.Event.toString() == "Escaperoom"){

		}
		*/
		/*
		newData = new Data();
		newData.Event = data.Event.toString();
		newData.Gamemode = data.Gamemode.toString();

		SaveData(newData);
		*/
		//RemoveAllData(Data);
	//});
//});


let RemoveAllData = (schemaName)=>{
	schemaName.remove({}, (err, data)=>{
		if (err) throw err;
		console.log("removed!")
		/*
		for (let i = 0; i < users.length; i++){
			console.log('retrieved list of names', users[i]);
		}
		*/
	});
}


let SaveData = (data)=>{
	data.save((err)=>{
		if (err) throw err;
		console.log("saved!");
	});
}

/*
app.get("/home.html", (req, res)=>{
	mongoose.model("Data").find((err, users)=>{
		if (err) throw err;
		res.send(users);
	});
});
*/

server.listen(app.get("port"), function(){
	console.log("-----Server is Running!-----");
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
