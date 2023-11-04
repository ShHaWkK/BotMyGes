import * as userFunct from './userFunct.js'
import * as gFunct from './globalFunct.js'
import { log } from './globalFunct.js'
import config from '../config.json' assert {type: 'json'}
import { DefaultUserAgent } from 'discord.js';

export async function retrieveMyGesData(client){

	log('Begin to connect users and retrieve myges data..')
	const discordClient = client
	const errorChannel = discordClient.channels.cache.get(config.errorChannel)
	const scheduleChannel = discordClient.channels.cache.get(config.scheduleChannelId)

	// update the number of users if another user has been registered
	let listJsonFile = await gFunct.listJsonFile('./users/infos/');

	if (listJsonFile != 'Error'){

		// Use a for to fetch all the users in the users folder
		for (var k = 0; k < listJsonFile.length; k++) {

			const file = await gFunct.readJsonFile('./users/infos/'+listJsonFile[k])

			// Variable to connect the bot to the myGes user account
			const userId = file.userId;
			// const username = file.username
			const login = file.login;
			const password = file.password;		

			// Login the user using userFunct.js
			const user = await userFunct.login(login, password)

			if (user != 'Error'){
				// try{

					// Create the current date
					var today = new Date();
					let monday = new Date(gFunct.getWeekMonday())
					let saturday = new Date(gFunct.getWeekSaturday())

					// If I set 0 to hours, saturday it set to saturday 22h :/
					saturday.setUTCHours(0, 0, 0, 0);

					// Compare date to request the weekly scheldule or the next weekly schedule
					if (today >= saturday){
						log(`It's the weekend today, requesting next week schedule (print it, if it's sunday)`)

						monday.setUTCHours(0,0,0,0)
						monday.setDate(monday.getDate() + 7);
						monday.setUTCHours(0,0,0,0)
			
						// console.log(saturday)
						saturday.setDate(saturday.getDate() + 7);
				
					}
					console.log(monday, saturday)
					// Request the agenda
					const agenda = await userFunct.Agenda(user, monday, saturday, userId)

					// Write in [groupClasseName]_agenda.json and print agenda on discord if changed...
					await userFunct.printAgenda(client, agenda, file, user)
				// }
				// catch{
				// 	log(`Error when trying to fetch the schedule for ${login}`)
				// 	errorChannel.send(`Error when trying to fetch the schedule for ${login}`)
				// }

				try{
					// Retrieve grades
					const grades = await userFunct.Grades(user, userId, today)
					// Print grades
					userFunct.printGrades(client, grades, file)
				}
				catch (error){
					log(`Error when trying to retrieve grades for ${login}, ${error}`)
					errorChannel.send(`Error when trying to retrieve grades for ${login}`)
				}				

				try{
					// Retrieve absences
					const absences = await userFunct.Absences(user, userId, today)
					// Print absences
					userFunct.printAbsences(client, absences, file)
				}
				catch (error){
					log(`Error when trying to retrieve new absences for ${login}, ${error}`)
					errorChannel.send(`Error when trying to retrieve new absence for ${login}`)
				}

			}
			else{
				log(`Error when trying to connect to ${login} myges account`)
				errorChannel.send(`Error when trying to connect to ${login} myges account`)
				// let targetUser = await client.users.fetch(userId);
				// targetUser.send('Error when trying to fetch your schedule');
			}

		}

	}
	else{
		log(`No users registered, please type "/register mygesLogin mygesPassword" to begin the check`)
	}
}