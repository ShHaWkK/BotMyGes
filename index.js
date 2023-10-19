/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


main file for the moment






***********************************************************************/

import config from './users/556461959042564098.json' assert { type: 'json' };
import * as userFunct from './functionnalities/userFunct.js'
import * as gFunct from './functionnalities/globalFunct.js'
import myGes from 'myges';
import fs from 'fs'


const startD = new Date('2023-10-16');
const endD = new Date('2023-10-21');


const listJsonFile = await gFunct.listJsonFile('./users/')

if (listJsonFile != ['Error']){
	
	let agendaToWrite = {}

	for (var k = 0; k < listJsonFile.length; k++) {

		const file = await gFunct.readJsonFile('./users/'+listJsonFile[k])

		// Variable to connect the bot to the myGes user account
		const userId = file.userId;
		// const username = file.username
		const login = file.login;
		const password = file.password;

		console.log('--------New user--------')
		console.log(userId, login)
		

		// Login the user using userFunct.js
		const user = await userFunct.login(login, password)

		const agenda = await userFunct.Agenda(user, startD, endD)

		// Recover things (in object in an array of array)
		// Never change the "1"	
		// agenda[i][0] is always the date
		// agenda[i][1] is always an object named with the time
		for (var i = 0; i < agenda.length; i++) {
			console.log('----------------------------------------------------------------------------')
			// agendaToWrite[agenda[i][0]] = Object.keys(agenda[i][1])
			
			let tmp

			for (const obj in agenda[i][1]){
				let type = agenda[i][1][obj].type
				let modality = agenda[i][1][obj].modality
				let nameCours = agenda[i][1][obj].name
				let teacher = agenda[i][1][obj].teacher
				// console.log(obj, type, name, modality, teacher)

				let tmp2 = {
					"time":obj,
					"content":{
						"time":obj,
						"type": type,
						"modality": modality,
						"name": nameCours,
						"teacher": teacher
					}
				}

				console.log(tmp)
			}

			agendaToWrite[agenda[i][0]] = {tmp}
			
		}

		// writeJsonFile('./users', 'agenda', agenda)
	}

	// console.log(agendaToWrite)
	// console.log(Object.keys(agendaToWrite))

	// const json = JSON.stringify(agendaToWrite, null, 2);
	// console.log(json)

	// fs.writeFile(`./agenda_output.json`, json, (err) => {
	//   if (err) {
	//     console.error(err);
	//     return;
	//   }
	//   console.log('Data written to file');
	// });


}