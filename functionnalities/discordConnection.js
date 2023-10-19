import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import { recupLatestVideo } from './functionnalities/requestLatestYtbVideo.js'
import { addReactions } from './functionnalities/reactions.js'

let crashCount = 0
const maxCrashCount = 5

function main(){
	//Créer un "client"
	const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessageReactions,
		],
	});

	//console.log(config);

	console.log('Trying to connect to Discord Servers')
	// Met le bot "En ligne"
	client.login(config.token);

	// Evènement qui attent deux chose (nom évènements, fonction associée)
	client.on('ready', () => {
		console.log(`${client.user.username} has logged in, waiting...`)
		client.user.setActivity({
			name:"Seems I'm in developpement..."
		})

		client.user.setStatus('dnd');

		try{
			recupLatestVideo(client)
			setInterval(function(){recupLatestVideo(client);}, 900000)
		}
		catch(error){
			console.log(error)
		}