/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


main file for the moment






***********************************************************************/
import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import Discord from 'discord.js'
import config from './config.json' assert { type: 'json' };
import { deployCommand } from './commands/deployCommand.js';
import { executeSlashCommand } from './commands/executeCommand.js';
// import * as userFunct from './functionnalities/userFunct.js'
import { retrieveMyGesData } from './functionnalities/retrieveDatas.js'
import * as gFunct from './functionnalities/globalFunct.js'
import { log } from './functionnalities/globalFunct.js'


function main(){
	//Creating a client
	log('----------------------------------------------------')
	log('Starting program')
	log(`Using discord.js version: ${Discord.version}`);
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

	client.on('ready', async () => {
		log(`${client.user.username} has logged in, waiting...`)
		client.user.setActivity({
			// name:"Seems like I'm in developpement..."
			name:"Just testing the bot in real condition"
		})

		client.user.setStatus('dnd');

		log('Deploying slashes commands')
		await deployCommand(client)
		// process.exit()

		// try{
			retrieveMyGesData(client)
			setInterval(function(){retrieveMyGesData(client);}, 3600000)
			// setInterval(function(){recupLatestVideo(client);}, 900000)
			
		// }
		// catch(error){
		// 	log(error)
		// }
    })

	client.on('interactionCreate', async (interaction) => {

		executeSlashCommand(interaction)
	  });
}






main()