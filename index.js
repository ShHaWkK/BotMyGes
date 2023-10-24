/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


main file for the moment






***********************************************************************/
import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import config from './config.json' assert { type: 'json' };
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

function main(){
	//Creating a client
	log('Creating Client')
	const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessageReactions,
		],
	});

	log('Trying to connect to Discord Servers')
	// Bot go online
	client.login(config.botToken);

	client.on('ready', () => {
		log(`${client.user.username} has logged in, waiting...`)
		client.user.setActivity({
			name:"Seems like I'm in developpement..."
		})

		client.user.setStatus('dnd');

		try{
			
			// setInterval(retrieveMyGesData(), 900000)
			retrieveMyGesData(client)
		}
		catch(error){
			log(error)
		}
    })
}


async function retrieveMyGesData(client){
	const discordClient = client

	if (listJsonFile != ['Error']){

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
				// print agenda if changed...
				await userFunct.printAgenda(client, agenda, file)

				//retrive grades
				// const agenda = await userFunct.Agenda(user, userId)
				//print grades
				// const agenda = userFunct.printAgenda(user, userId)				

				//retrieve absences
				// const agenda = await userFunct.Agenda(user, userId)
				//print absences
				// const agenda = userFunct.printAgenda(user, userId)

			}
			else{
				log(`Error when trying to fetch agenda for ${login}`)
				let targetChannel = discordClient.channels.cache.get(config.errorChannel)
				targetChannel.send(`Error when trying to fetch ${login} schedule...`)
				// let targetUser = await client.users.fetch(userId);
				// targetUser.send('Error when trying to fetch your schedule');
			}
		}

	}
}



main()