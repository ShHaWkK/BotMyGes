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
		console.log(`--------Try to login into ${login}--------`)
		const user = await userFunct.login(login, password)
		if (user == 'Error'){
			console.log(`--------Login error for ${login}--------`)
		}
		console.log('--------Login ok--------')

		// Request the agenda and write it in userId_agenda.json
		console.log('--------Request Agenda--------')
		const agenda = await userFunct.Agenda(user, startD, endD, userId)
	}

	

	// fs.writeFile(`./agenda_output.json`, json, (err) => {
	//   if (err) {
	//     console.error(err);
	//     return;
	//   }
	//   console.log('Data written to file');
	// });


}