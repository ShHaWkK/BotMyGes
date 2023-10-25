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

    // Sort the dict from the "lowest" date to the "uppest" date and by time
    // Idk how it works btw
	const sortedData = Object.entries(dict).sort((a, b) => {
		const dateA = new Date(a[0].split('/').reverse().join('-'));
		const dateB = new Date(b[0].split('/').reverse().join('-'));
		return dateA - dateB;
	  }).map(([date, cours]) => {
		const sortedCours = Object.entries(cours).sort(([heureA], [heureB]) => {
		  const timeA = new Date(`1970-01-01T${heureA}`);
		  const timeB = new Date(`1970-01-01T${heureB}`);
		  return timeA - timeB;
		}).reduce((acc, [heure, cours]) => {
		  acc[heure] = cours;
		  return acc;
		}, {});
		return [date, sortedCours];
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

// Get the current agenda and parse it into a sentence to print it in discord
// Usefull when the old agenda don't exit, and each saturday...
export async function rappelWeeklyAgenda(currentAgenda){

	try{
		let sentence = `# Your weekly schedule :\n`
		for (var date in currentAgenda){
			let cours = currentAgenda[date].cours;
			sentence = sentence+`## ${date}\n`
			for (let i = 0; i < cours.length; i++) {
				let name = currentAgenda[date].cours[i].content.name
				let time = currentAgenda[date].cours[i].content.time
				let type = currentAgenda[date].cours[i].content.type
				let modality = currentAgenda[date].cours[i].content.modality
				let teacher = currentAgenda[date].cours[i].content.teacher
				var miniSentence = `> - **	${time}**\n>  - ${type} : __${name}__\n>  - Modality : ${modality}\n>  - Teacher : ${teacher}\n\n`
				sentence = sentence+miniSentence
			}
			
		}
		return sentence
	}
	catch{
		return 'No weekly schedule'
	}
}

// ---------------------------------------------------------------------

export async function rappelDailyAgenda(currentAgenda){

	try{
		var date = new Date();
		date = date.toLocaleDateString()

		let sentence = `# Your daily schedule for ${date} :\n`
		let cours = currentAgenda[date].cours;
		sentence = sentence+`## ${date}\n`
		for (let i = 0; i < cours.length; i++) {
			let name = currentAgenda[date].cours[i].content.name
			let time = currentAgenda[date].cours[i].content.time
			let type = currentAgenda[date].cours[i].content.type
			let modality = currentAgenda[date].cours[i].content.modality
			let teacher = currentAgenda[date].cours[i].content.teacher
			var miniSentence = `> - **	${time}**\n>  - ${type} : __${name}__\n>  - Modality : ${modality}\n>  - Teacher : ${teacher}\n\n`
			sentence = sentence+miniSentence
		}

		return sentence
	}
	catch{
		return 'No daily schedule'
	}
}

// ---------------------------------------------------------------------

export async function printAgenda(client, currentAgenda, file){
	
	let scheduleChannel = client.channels.cache.get(config.scheduleChannelId)
	let errorChannel = client.channels.cache.get(config.errorChannel)

	// Try to read the json file
	let previousAgenda = await readJsonFile(`./users/agenda/${file.userId}_agenda.json`)

	if (previousAgenda != 'Error' && currentAgenda !='Error'){

		// try{

			log(`Comparing new to old agenda for ${file.userId}, ${file.username}`)

			//Checking date
			
			//Boucle qui permet de parcourir les datas
			// Reach each content in each dates
			for (let date in currentAgenda) {
				// Checking dates in each agenda

				// If a day exist in the previousAgenda and in the currentAgenda
				log(`Checking new lessons for ${date}`)
				// If a date existed in the previous agenda and in the current agenda | and if the lenght of courses has increase or stay still.
				if (date in previousAgenda && previousAgenda[date] && currentAgenda[date].cours.length >= previousAgenda[date].cours.length){
					var sentence_ok = 'False'
					var sentence_ok_2 = 'False'

					let cours = currentAgenda[date].cours;

					for (let i = 0; i < cours.length; i++) {

						// console.log(cours[i])
						//If a course has been modified
						// console.log(previousAgenda[date])
						if(date in previousAgenda ){

							try{
								// If a lesson has been added, try to acces it into previous agenda and crash => see the catch function
								// If a course has been updated
								var sentence
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
									console.log(currentAgenda[date].cours[i].content.time)
									console.log(previousAgenda[date].cours[i].content.time)
									console.log('----------')
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
									sentence = `# Lesson updated on ${date}\n<@${file.userId}>\n> - ${time}\n> - ${name}\n> - ${type}\n> - ${modality}\n> - ${teacher}`
									scheduleChannel.send(sentence)
									sentence_ok = 'False'
									sentence_ok_2 = 'True'
								}
							}
							catch{
								if ( JSON.stringify(currentAgenda[date].cours[i]) !== JSON.stringify(previousAgenda[date].cours[i]) ){

									let name = currentAgenda[date].cours[i].content.name
									let time = currentAgenda[date].cours[i].content.time
									log(`Creating message for ${name} on ${date} at ${time}`)
									let type = currentAgenda[date].cours[i].content.type
									let modality = currentAgenda[date].cours[i].content.modality
									let teacher = currentAgenda[date].cours[i].content.teacher

									scheduleChannel.send(`# Shedule changed ! New lesson added on **${date}**\nYou have a new lesson on **${date}** at **${time}**\n> - Day : ${date}\n> - Time : ${time}\n> - ${type} : ${name}\n> - Modality : ${modality}\n> - Teacher : ${teacher}`)
								}
							}
						}
					}
				}
				// If a course don't exist in currentAgenda but still exist in previousAgenda
				else if(date in previousAgenda && previousAgenda[date] && currentAgenda[date].cours.length < previousAgenda[date].cours.length){

					sentence_ok_2 = "True"
					for (let i = 0; i < previousAgenda[date].cours.length; i++) {
						// console.log(previousAgenda[date].cours[i])

						if (JSON.stringify(currentAgenda[date].cours[i]) !== JSON.stringify(previousAgenda[date].cours[i])){
							console.log('WARNING '+previousAgenda[date].cours[i].content.name+' a été supprimé')
							let name = previousAgenda[date].cours[i].content.name
							let time = previousAgenda[date].cours[i].content.time
							let type = previousAgenda[date].cours[i].content.type
							let modality = previousAgenda[date].cours[i].content.modality
							let teacher = previousAgenda[date].cours[i].content.teacher
							scheduleChannel.send(`# Shedule changed ! Lesson deleted **${date}**\nThe lesson **${name}** have been deleted on **${date}** at **${time}**\n> - Day : ${date}\n> - Time : ${time}\n> - ${type} : ${name}\n> - Modality : ${modality}\n> - Teacher : ${teacher}`)
						}

					}
				}
				else{
					
				}

				sentence_ok_2 == "False" ? '' : log(`New schedule for ${file.username} on ${date}`)
				sentence_ok_2 = "False"
			}

			// If the new or old schedule is bigger than the other
			// It means that they add (or delete) one day of lesson(s)
			let lengthOld = Object.entries(previousAgenda).length
			let lengthNew = Object.entries(currentAgenda).length
			if (lengthOld != lengthNew){

				let agendaToWorkWith = lengthOld > lengthNew ? previousAgenda : currentAgenda
				let agendaToWorkWithout = lengthOld > lengthNew ? currentAgenda : previousAgenda
				var additionalInfos = lengthOld > lengthNew ? "have been delete" : "have been added"
				var sentence = ''
				// If a lesson has been added or deleted in another date
				// Take all the date in the bigger schedule
				for (var date in agendaToWorkWith){

					//Check if it exist and define
					if (!(date in agendaToWorkWithout) || !agendaToWorkWithout[date]){

						log(`Creating message for new lesson in a new date ${date}`)
						let cours = agendaToWorkWith[date].cours;
						sentence_ok_2 = 'True'
						var realDate = date
						for (let i = 0; i < cours.length; i++) {
							let name = agendaToWorkWith[date].cours[i].content.name
							let time = agendaToWorkWith[date].cours[i].content.time
							let type = agendaToWorkWith[date].cours[i].content.type
							let modality = agendaToWorkWith[date].cours[i].content.modality
							let teacher = agendaToWorkWith[date].cours[i].content.teacher

							sentence += `> - Time : ${time}\n> - ${type} : ${name}\n> - Modality : ${modality}\n> - Teacher : ${teacher}\n\n`
						}
					}
				}

				scheduleChannel.send(`# A day with lesson(s) ${additionalInfos} on **${realDate}**\n${sentence}`)

			}
			else{
				
			}
			// else if (Object.entries(previousAgenda).length < Object.entries(currentAgenda).length){
			// 	console.log('Vous avez cours une journée en plus')
			// }
		// }
		// catch (error){
			// log(`ERRO	R : Impossible to compare new and old schedule for ${file.username}, ${error}`)
			// errorChannel.send(`Impossible to compare new and old schedule for ${file.username}`)
		// }
	}
	// If the old file don't exist, it's like it's a weelklyAgenda
	else if(previousAgenda == 'Error' && currentAgenda != 'Error'){
		log('Parse and print the agenda for the week')
		let resultats = await rappelWeeklyAgenda(currentAgenda)
		scheduleChannel.send(resultats)
	}
	else{
		log(`Impossible to read ${file.userId}_agenda.json file, or retrieve currentAgenda...`)
		errorChannel.send(`Impossible to read ${file.userId}_agenda.json file, or retrieve currentAgenda...`)
		
	}

	if (currentAgenda != 'Error'){
		// Overwrite the file with the new schedule
		await gFunct.writeJsonFile('./users/agenda', `${file.userId}_agenda`, currentAgenda)
	}
	else{
		log('ERROR currentAgenda = error')
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
		let hoursMissed = 0
		let sentence = `You have `
		let concat = ''

		for (let date in absences){
			for (let cours in absences[date]){
				if (date in old_absences && cours in old_absences[date]){
					hoursMissed = hoursMissed
				}			
				else{
					hoursMissed ++
					concat += `> - You missed **__${absences[date][cours].course_name}__** on ${date} at ${cours}\n`

				}
			}
		}
		sentence +=`${hoursMissed} new hours missed :\n${concat}`

		if (hoursMissed > 0){
			log('Send private message 1')
			// scheduleChannel.send(sentence)
			userMessageChannel.send(sentence)
		}
		
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
		// scheduleChannel.send(`I detected **${nbHour}** absences\n${sentence}`)
		userMessageChannel.send(`I detected **${nbHour}** absences\n${sentence}`)
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

