/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


main file for the moment






***********************************************************************/
import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import config from './config.json' assert { type: 'json' };
// import * as userFunct from './functionnalities/userFunct.js'
import { retrieveMyGesData } from './functionnalities/retrieveDatas.js'
// import * as gFunct from './functionnalities/globalFunct.js'
import { log } from './functionnalities/globalFunct.js'

// Create the current date
// gonna be usefull for weekly ping
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






main()