/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


main file for the moment






***********************************************************************/
import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import config from './users/556461959042564098.json' assert { type: 'json' };
import * as userFunct from './functionnalities/userFunct.js'
import * as gFunct from './functionnalities/globalFunct.js'
import { log } from './functionnalities/globalFunct.js'
import myGes from 'myges';
import fs from 'fs'




// List all the users files
const listJsonFile = await gFunct.listJsonFile('./users/')


var today = new Date();
var weekNumber = today.getWeek();
var monday = new Date(today.getWeekMonday(weekNumber))
var saturday = new Date(today.getWeekSaturday(weekNumber))

console.log("Week number:", weekNumber);
console.log("Monday:", monday, typeof(monday));
console.log("Saturday:", saturday, typeof(saturday));

log('Creating Client')

function main(){
	//Créer un "client"
	log('Creating Client')
	const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessageReactions,
		],
	});

	console.log('Trying to connect to Discord Servers')
	// Met le bot "En ligne"
	console.log(config)
	client.login(config.botToken);

	// Evènement qui attent deux chose (nom évènements, fonction associée)
	client.on('ready', () => {
		console.log(`${client.user.username} has logged in, waiting...`)
		client.user.setActivity({
			name:"Seems like I'm in developpement..."
		})

		client.user.setStatus('dnd');

		try{
			
			// setInterval(function(), 900000)
		}
		catch(error){
			console.log(error)
		}
    })
}


async function retrieveMyGesData(){

	if (listJsonFile != ['Error']){
		
		let agendaToWrite = {}
		console.log(listJsonFile)

		// Use a for to fetch all the users in the users folder
		for (var k = 0; k < listJsonFile.length; k++) {

			const file = await gFunct.readJsonFile('./users/'+listJsonFile[k])

			// Variable to connect the bot to the myGes user account
			const userId = file.userId;
			// const username = file.username
			const login = file.login;
			const password = file.password;		

			// Login the user using userFunct.js
			const user = await userFunct.login(login, password)

			if (user != 'Error'){
				// Request the agenda and write it in userId_agenda.json
				const agenda = await userFunct.Agenda(user, monday, saturday, userId)
			}
		}

	}
}



// main()