import { GesAPI } from './node_modules/myges/dist/ges-api.js';
import { log, readJsonFile } from './functionnalities/globalFunct.js'
import config from './config.json' assert { type: 'json' }
import * as gFunct from './functionnalities/globalFunct.js'
import * as userFunct from './functionnalities/userFunct.js'
import myGes from 'myges';
import fs from 'fs'
import { assert } from 'console';


import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';



const file = await gFunct.readJsonFile('./users/infos/556461959042564098.json')

// Variable to connect the bot to the myGes user account
const userId = file.userId;
// const username = file.username
const login = file.login;
const password = file.password;		


// const user = await userFunct.login(login, password)

// // let agenda = await user.getProfile()

// const test = await userFunct.getClasses(user, '2023')

// console.log(`${test[0].promotion} - ${test[0].name}`)

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

    client.on('ready', () => {
		log(`${client.user.username} has logged in, waiting...`)
		client.user.setActivity({
			name:"Seems like I'm in developpement..."
		})

		client.user.setStatus('dnd');

        const classes = "2i2"
        const currentAgenda = 'coucou'

        const coucou = userFunct.rappelWeeklyAgenda(client, currentAgenda, classes, file, "for the next week")
        console.log(coucou)
    })



/*
const saturday = new Date(gFunct.getWeekSaturday());
saturday.setDate(saturday.getDate() + 7);
console.log(saturday.toLocaleDateString()); // affiche la date du samedi suivant au format "jj/mm/aaaa"






*/