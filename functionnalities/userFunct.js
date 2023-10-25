/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


File which discuss with the ges-api.js
Simplify the index.js






***********************************************************************/

// ---------------------------------------------------------------------

import { GesAPI } from '../node_modules/myges/dist/ges-api.js';
import { log, readJsonFile } from './globalFunct.js'
import config from '../config.json' assert { type: 'json' }
import * as gFunct from './globalFunct.js'
import myGes from 'myges';
import fs from 'fs'
import { assert } from 'console';

import test from '../coucou_absences.json' assert { type: 'json' }


// ---------------------------------------------------------------------

// Return a class with functions => go to see ges-api.js to see functions
export async function login(username, password){
	try{
		log(`Try to login into ${username} myGes`)
		const tmp = await GesAPI.login(username, password)
		log('Login myGes ok')
		return tmp
	}
	catch (error){
		log(`ERROR : Login myGes error for ${username}, ${error}`)
		return 'Error'
	}
}

// -------------------------AGENDA-------------------------------

// Get the agenda from the api then sort it by date and by time
// param user is mandatory to call the gesapi functions
export async function Agenda(user, startD, endD, userId){
	log('Request myGes Agenda')

	// Agenda have a lot unsorted objects inside
	let agenda = await user.getAgenda(startD, endD)

	log('Creating Agenda array')
	// Create an array to store objects by date, then by time
	let dict = []
	let addData = 0
	for (let i = 0; i < agenda.length; i++) {
		// Create readable date and time
		let date = new Date(agenda[i].start_date).toLocaleDateString();
		let time = new Date(agenda[i].start_date).toLocaleTimeString();

		if (!dict.hasOwnProperty(date)) {
			dict[date] = [];
		}
		if (!dict[date].hasOwnProperty(time)) {
			dict[date][time] = agenda[i];
		}
		else{
			dict[date][time][`anormal_additional_data_${addData}`] = agenda[i];
			addData++
		}
    }

    // Sort the dict from the "lowest" date to the "uppest" date
    // Idk how it works btw
    const sortedData = Object.entries(dict).sort((a, b) => {
	  const dateA = new Date(a[0].split('/').reverse().join('-'));
	  const dateB = new Date(b[0].split('/').reverse().join('-'));
	  return dateA - dateB;
	});

	agenda = sortedData

	// Recover things (in object in an array of array)
	// Never change the "1"	
	// agenda[i][0] is always the date
	// agenda[i][1] is always an object named with the time
	log(`Preparing ${userId}_agenda.json`)
	let agendaToWrite = {}
	for (var i = 0; i < agenda.length; i++) {
		
		let cours = []

		// Retrieve infos and store it in variable
		for (const obj in agenda[i][1]){
			let type = agenda[i][1][obj].type
			let modality = agenda[i][1][obj].modality
			let nameCours = agenda[i][1][obj].name
			let teacher = agenda[i][1][obj].teacher

			let tmp = {
				"time":obj,
				"content":{
					"time":obj,
					"type": type,
					"modality": modality,
					"name": nameCours,
					"teacher": teacher
				}
			}
			cours.push(tmp)
		}
		agendaToWrite[agenda[i][0]] = {cours}
	}

	agenda = agendaToWrite

	return agenda

}

// ---------------------------------------------------------------------

export async function printAgenda(client, currentAgenda, file){
	
	let scheduleChannel = client.channels.cache.get(config.scheduleChannelId)
	let errorChannel = client.channels.cache.get(config.errorChannel)

	// Try to read the json file
	let previousAgenda = await readJsonFile(`./users/agenda/${file.userId}_agenda.json`)

	previousAgenda = 'Error'

	if (previousAgenda != 'Error' && currentAgenda !='Error'){

		try{

			log(`Comparing new to old agenda for ${file.userId}, ${file.username}`)

			//Checking date
			
			//Boucle qui permet de parcourir les datas
			// Reach each content in each dates
			for (let date in currentAgenda) {
				// Checking dates in each agenda

				// If a day exist in the previousAgenda and in the currentAgenda
				if (previousAgenda[date]){

					let cours = currentAgenda[date].cours;
					for (let i = 0; i < cours.length; i++) {
						// console.log(date, currentAgenda[date].cours[i].time)
						let sentence_ok = 'False'
						let sentence
						let name = previousAgenda[date].cours[i].content.name
						let time = previousAgenda[date].cours[i].content.time
						let type = previousAgenda[date].cours[i].content.type
						let modality = previousAgenda[date].cours[i].content.modality
						let teacher = previousAgenda[date].cours[i].content.teacher

						if (currentAgenda[date].cours[i].content.name != previousAgenda[date].cours[i].content.name){
							sentence = `# /!\\ Un cours a changé le ${date} !\n> - ${currentAgenda[date].cours[i].time}\n> - ~~${name}~~ => ${currentAgenda[date].cours[i].content.name}\n> - ${currentAgenda[date].cours[i].content.type}\n> - ${currentAgenda[date].cours[i].content.modality}\n> - ${currentAgenda[date].cours[i].content.teacher}`
							scheduleChannel.send(sentence)
							break
						}

						if (currentAgenda[date].cours[i].content.time != previousAgenda[date].cours[i].content.time){
							time = `~~${time}~~ => ${currentAgenda[date].cours[i].content.time}`
							sentence_ok = 'True'
						}

						if (currentAgenda[date].cours[i].content.type != previousAgenda[date].cours[i].content.type){
							type = `~~${type}~~ => ${currentAgenda[date].cours[i].content.type}`
							sentence_ok = 'True'
						}
			
						if (currentAgenda[date].cours[i].content.modality != previousAgenda[date].cours[i].content.modality){
							modality = `~~${modality}~~ => ${currentAgenda[date].cours[i].content.modality}`
							sentence_ok = 'True'
						}
			
						if (currentAgenda[date].cours[i].content.teacher != previousAgenda[date].cours[i].content.teacher){
							teacher = `~~${teacher}~~ => ${currentAgenda[date].cours[i].content.teacher}`
							sentence_ok = 'True'
						}

						if (sentence_ok == 'True'){
							sentence = `# Modification d'un cours le ${date} pour <@${file.userId}> !\n> - ${time}\n> - ${name}\n> - ${type}\n> - ${modality}\n> - ${teacher}`
							scheduleChannel.send(sentence)
						}		

					}
				}
				else{
					// If a lesson has been added
					// Need to complete this section (more than one lesson can be added...)
					scheduleChannel.send(`Un cours a été rajouté le **${date}**`)
				}
			}
			
			// await gFunct.writeJsonFile('./users/agenda', `${file.userId}_agenda`, currentAgenda)
		}
		catch (error){
			log(`ERROR : Impossible to compare new and old schedule for ${file.username}, ${error}`)
			errorChannel.send(`Impossible to compare new and old schedule for ${file.username}`)
		}
	}
	// If the old file don't exist
	else if(previousAgenda == 'Error' && currentAgenda != 'Error'){
		console.log(currentAgenda)
		let sentence = ''
		for (let date in currentAgenda){
			let cours = currentAgenda[date].cours;
			for (let i = 0; i < cours.length; i++) {
				
			}
		}
	}
	else{
		log(`Impossible to read ${file.userId}_agenda.json file, or retrieve currentAgenda...`)
		errorChannel.send(`Impossible to read ${file.userId}_agenda.json file, or retrieve currentAgenda...`)
		
	}

	if (currentAgenda != 'Error'){
		// Overwrite the file with the new schedule
		await gFunct.writeJsonFile('./users/agenda', `${file.userId}_agenda`, currentAgenda)
	}
}

// ---------------------------GRADES------------------------------------

export async function Grades(user, userId, date){
	
	log('Checking grades')

	const year = date.getFullYear();

	let grades = await user.getGrades(year)
	return grades
}

// ---------------------------------------------------------------------

export async function printGrades(client, grades, file){
	log('No grades right now')
}

// ---------------------------ABSENCES----------------------------------

export async function Absences(user, userId, date){
	
	log('Checking absences')

	const year = date.getFullYear();

	let absences = await user.getAbsences(year)

	log('Creating absences array')
	
	if (absences){
		// Store usefull datas in an array
		let cours = []
		// Only take few information from the promise
		for (let i = 0; i < absences.length; i++) {
			var dateAbsence = new Date(absences[i].date).toLocaleDateString();
			var timeAbsence = new Date(absences[i].date).toLocaleTimeString();

			var tmp = {
				"date": dateAbsence,
				"hour": timeAbsence,
				"course_name": absences[i].course_name,
				"justified": absences[i].justified,
				"semester": absences[i].trimester_name
			}		
			cours.push(tmp)
		}

		// Sort the array by date then by hours (not me lol)
		const result = cours.reduce((acc, cur) => {
			const { date, hour, ...rest } = cur;
			if (!acc[date]) {
			  acc[date] = {};
			}
			acc[date][hour] = rest;
			return acc;
		  }, {});
		
		// Sorts hours in ascending order for each day (not me too lol)
		for (const date in result) {
			const sorted = Object.entries(result[date]).sort((a, b) => a[0].localeCompare(b[0]));
			result[date] = Object.fromEntries(sorted);
		}

		absences = result

	}
	else{
		absences = 'Error'
	}
	return absences

}

// ---------------------------------------------------------------------

export async function printAbsences(client, absences, file){

	log('Compare old absences with current absences')

	let scheduleChannel = client.channels.cache.get(config.scheduleChannelId)
	let errorChannel = client.channels.cache.get(config.errorChannel)
	let userMessageChannel = await client.users.fetch(file.userId)

	// ReadFile
	const old_absences = await readJsonFile(`./users/absences/${file.userId}_absences.json`)

	// Compare current datas with already stored datas
	if (old_absences != 'Error' && absences != 'Error') {
		for (let date in absences){
			console.log(absences[date])
		}

		log('Send private message 1')
		scheduleChannel.send(`You have...`)
		// userMessageChannel.send('PV message')
		
	}
	// If the file don't exist
	else if(old_absences == 'Error' && absences !='Error')
	{
		// Inform the user the number of absence if have one or more
		console.log(absences)

		let sentence = ''
		let nbHour = 0
		for (var date in absences) {
			const hours = Object.keys(absences[date]);
			console.log(absences[date])
			nbHour += hours.length

			for (var nbHours in absences[date]){
				console.log(absences[date][nbHours])
				sentence += `> - You missed **__${absences[date][nbHours].course_name}__** on ${date} at ${nbHours}\n`
			}
		}

		log('Send private message 2')
		scheduleChannel.send(`You have **${nbHour}** new absences\n${sentence}`)
		userMessageChannel.send(`You have **${nbHour}** new absences\n${sentence}`)
	}
	else{
		log(`ERROR : Error when retrieve absences for ${file.username}`)
		errorChannel.send(`Error when retrieve absences for ${file.username}`)
		// userMessageChannel.send('Error when retrieve your absences')
	}

	if (absences != 'Error'){
		// Then create a file with absences
		log('Writing absences file')
		await gFunct.writeJsonFile('./users/absences', `${file.userId}_absences`, absences)
	}
	else{
		log(`No absences datas for ${file.username}`)
	}


	

}

// ---------------------------------------------------------------------

// async function getRappel(login, password, userId) {
//     const user = await login(login, password); 
//     const today = new Date();
//     const agendaData = await Agenda(user, today, today, userId);
    
//     if (agendaData && agendaData.length) {
//         let messages = [];

//         for (let i = 0; i < agendaData.length; i++) {
//             let entry = agendaData[i];
//             let timeKeys = Object.keys(entry[1]); // Récupère toutes les heures disponibles pour cette date
//             let firstTime = timeKeys[0]; // Prend la première heure
//             let eventName = entry[1][firstTime].name; // Récupère le nom de l'événement pour cette heure
//             messages.push(`- ${firstTime}: ${eventName}`);
//         }

//         return messages.join("\n");
//     } else {
//         return "Aucun rappel pour aujourd'hui!";
//     }
// }

// ---------------------------------------------------------------------

