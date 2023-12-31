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
import { start } from 'repl';


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

// ---------------------------------------------------------------------

export async function getClasses(user, year) {
	// Return the class of the user, using the api
	return await user.request('GET', `/me/${year}/classes`)
}

// -------------------------AGENDA-------------------------------

// Get the agenda from the api then sort it by date and by time
// param user is mandatory to call the gesapi functions
export async function Agenda(user, startD, endD){
	log('Request myGes Agenda')

	log('Request class')
	const now = new Date();
	const currentYear = now.getFullYear();
	let classes = await getClasses(user, currentYear)
	classes = `${classes[0].promotion} - ${classes[0].name}`
	log(`Classes : ${classes}`)

	// Agenda have a lot unsorted objects inside
	let agenda = await user.getAgenda(startD, endD)

	if (agenda.length == 0){
		let start
		let end
		try{
			start = startD.toLocaleDateString()
			end = endD.toLocaleDateString()
		}
		catch{
			start = startD
			end = endD
		}
		return `No agenda for this week : ${start}, ${end}`
	}
	

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

	log(`Preparing ${classes}_agenda.json`)
	let agendaToWrite = {}
	for (var i = 0; i < agenda.length; i++) {
		
		let cours = []

		// Retrieve infos and store it in variable
		for (const obj in agenda[i][1]){
			let type = agenda[i][1][obj].type
			let modality = agenda[i][1][obj].modality
			let nameCours = agenda[i][1][obj].name
			let teacher = agenda[i][1][obj].teacher
			let student_group_name = agenda[i][1][obj].discipline.student_group_name

			let tmp = {
				"time":obj,
				"content":{
					"time":obj,
					"type": type,
					"modality": modality,
					"name": nameCours,
					"teacher": teacher,
					"student_group_name": student_group_name
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
export async function rappelWeeklyAgenda(client, currentAgenda, classes, optionnalSentence = ''){
	try{
		try {

			var groupToPing = "Cannot find the role corresponding to the classes :("
			if (classes !== "no-role"){

				// List all the guild of the bot
				let guildsId = await client.guilds.cache;

				let guildData
				guildsId.forEach(guild => {
					if (guild.id == config.guildId){
						guildData =  guild
						return
						
					}					
					});
				
				guildData.roles.cache.forEach(role => {
					if (role.name == classes){
						groupToPing = `<@&${role.id}>\n`
						return
					}
					});
			}
			else{
				var groupToPing = ""
			}

		}
		catch (error)
		{
			console.error(error);
		}

		let sentence = `# Your weekly schedule ${optionnalSentence} :\n${groupToPing}`
		for (var date in currentAgenda){
			let cours = currentAgenda[date].cours;
			sentence = sentence+`## --------${date}--------\n`
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
		log('ERROR : Error in "rappelWeeklyAgenda()" function')
		return 'No weekly schedule'
	}
}

// ---------------------------------------------------------------------

export async function rappelTomorrowAgenda(currentAgenda, file){

	try{
		var date = new Date();
		date.setUTCHours(0,0,0,0)
		date.setDate(date.getDate() - 1);
		date = date.toLocaleDateString()

		let sentence = `# Your daily schedule for ${date} :\n`
		
		if (currentAgenda[date]?.cours){
			let cours = currentAgenda[date].cours
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
		else{
			return 'No daily schedule'
		}

		return sentence
	}
	catch (error){
		return 'ERROR when rappelTomorrowAgenda()'
	}
}

// ---------------------------------------------------------------------

export async function printAgenda(client, currentAgenda, file, user){
	
	let scheduleChannel = client.channels.cache.get(config.scheduleChannelId)
	let errorChannel = client.channels.cache.get(config.errorChannel)

	if(typeof(currentAgenda) === 'string'){
		log(`ERROR : ${currentAgenda}`)
		errorChannel.send(`ERROR : ${currentAgenda}`)
		return
	}

	// let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	let today = new Date()
	let saturday = gFunct.getWeekSaturday()
	saturday.setUTCHours(0,0,0,0)
	// Get sunday
	saturday.setDate(saturday.getDate() + 1);

	// Take the name of the classe (promotion + name)
	log('Request class')
	let classes = await getClasses(user, today.getFullYear())
	classes = `${classes[0].promotion.split('ESGI').join('')}${classes[0].name.split(' ')[1]}`

	let hour = today.getHours();
	let minute = today.getMinutes()

	//If today > sunday of the same week
	if (today >= saturday){
		log('Today is > than sunday')

		if (hour === 17 || hour === 18 && minute <= 14){
			await gFunct.writeJsonFile('./users/agenda', `${classes}_agenda`, currentAgenda, "for the next week ")
			const sentence = await rappelWeeklyAgenda(client, currentAgenda, classes, "for the next week")
			scheduleChannel.send(sentence)
			return
		}

	}
	else{
		log('We are between 17h and 18h, send tomorrowAgenda')
		if (hour === 17 || hour === 18 && minute <= 14){
			const sentence = await rappelTomorrowAgenda(currentAgenda, file)
			scheduleChannel.send(sentence)
			return
	
		}
	}
	

	// Try to read the json file
	let previousAgenda = await readJsonFile(`./users/agenda/${classes}_agenda.json`)

	if (previousAgenda == 'Error'){
		log(`Impossible to read the ${classes}_agenda.json`)
		return
	}


	log('Searching the role correspondig to the class for the ping')
	var groupToPing = "Cannot find the role corresponding to the classes :("

	try{
		let guildsId = await client.guilds.cache;

		let guildData
		guildsId.forEach(guild => {
			if (guild.id == config.guildId){
				guildData =  guild
				return
				
			}					
			});
		
		guildData.roles.cache.forEach(role => {
			if (role.name == classes){
				groupToPing = role.id
				return
			}
			});
	}
	catch{
		log('ERROR : (crash) Impossible to find the role corresponding to the class')
	}
	

	if (previousAgenda != 'Error' && typeof(currentAgenda) !== 'string'){

		try{

			log(`Comparing new to old agenda for ${classes}, ${file.username}`)
			
			//Boucle qui permet de parcourir les datas
			// Reach each content in each dates
			for (let date in currentAgenda) {

				let dateTmp = date.split('/')
				dateTmp = `${dateTmp[1]}/${dateTmp[0]}/${dateTmp[2]}`
				dateTmp = new Date(dateTmp)
				dateTmp.setUTCHours(0,0,0,0)
				dateTmp.setUTCDate(dateTmp.getUTCDate() + 1);
				console.log(dateTmp);

				console.log(date, dateTmp, dateTmp.getTime(), today.getTime(), today.toLocaleDateString())

				if (dateTmp.getTime() >= today.getTime()) {
					console.log('YEY')
				}

				// Only compare comming days
				if (dateTmp.getTime() >= today.getTime()) {

					// If a day exist in the previousAgenda and in the currentAgenda
					log(`Checking new lessons for ${date}`)
					// If a date existed in the previous agenda and in the current agenda | and if the lenght of courses has increase or stay still.
					if (date in previousAgenda && previousAgenda[date] && currentAgenda[date].cours.length >= previousAgenda[date].cours.length){
						var sentence_ok = 'False'
						var sentence_ok_2 = 'False'

						let cours = currentAgenda[date].cours;

						for (let i = 0; i < cours.length; i++) {

							// Take the student_group_name
							// Gonna craash if you have a week with just OPEN and Anglais :/
							if (currentAgenda[date].cours[i].name == 'OPEN ESGI' && currentAgenda[date].cours[i].name == 'ANGLAIS'){
								student_group_name = currentAgenda[date].cours[i].student_group_name
								console.log('coucou')

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
											sentence = `# /!\\ A lesson change on ${date} !\n<@&${groupToPing}>\n> - ~~${time}~~ => ${currentAgenda[date].cours[i].time}\n> - ~~${name}~~ => ${currentAgenda[date].cours[i].content.name}\n> - ~~${type}~~ => ${currentAgenda[date].cours[i].content.type}\n> - ~~${modality}~~ => ${currentAgenda[date].cours[i].content.modality}\n> - ~~${teacher}~~ => ${currentAgenda[date].cours[i].content.teacher}`
											scheduleChannel.send(sentence)
										}
										else{

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
												sentence = `# Lesson updated on ${date}\n<@&${groupToPing}>\n> - ${time}\n> - ${name}\n> - ${type}\n> - ${modality}\n> - ${teacher}`
												scheduleChannel.send(sentence)
												sentence_ok = 'False'
												sentence_ok_2 = 'True'
											}
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

											scheduleChannel.send(`# Shedule changed ! New lesson added on **${date}**\n<@&${groupToPing}>\nYou have a new lesson on **${date}** at **${time}**\n> - Day : ${date}\n> - Time : ${time}\n> - ${type} : ${name}\n> - Modality : ${modality}\n> - Teacher : ${teacher}`)
										}
									}
								}
							}
						}
					}
					// If a course don't exist in currentAgenda but still exist in previousAgenda
					else if(date in previousAgenda && previousAgenda[date] && currentAgenda[date].cours.length < previousAgenda[date].cours.length){

						sentence_ok_2 = "True"
						if (previousAgenda[date].cours.length > currentAgenda[date].cours.length){

							for (let key in previousAgenda[date].cours) {
								if (previousAgenda[date].cours.hasOwnProperty(key) && !currentAgenda[date].cours.hasOwnProperty(key)){
									let name = previousAgenda[date].cours[key].content.name
									let time = previousAgenda[date].cours[key].content.time
									let type = previousAgenda[date].cours[key].content.type
									let modality = previousAgenda[date].cours[key].content.modality
									let teacher = previousAgenda[date].cours[key].content.teacher
									scheduleChannel.send(`# Shedule changed ! Lesson deleted **${date}**\n<@&${groupToPing}>\nThe lesson **${name}** have been deleted on **${date}** at **${time}**\n> - Day : ${date}\n> - Time : ${time}\n> - ${type} : ${name}\n> - Modality : ${modality}\n> - Teacher : ${teacher}`)
								}
							}
						}
					}
					else{
						
					}

					sentence_ok_2 == "False" ? '' : log(`New schedule for ${file.username} on ${date}`)
					sentence_ok_2 = "False"
				}
				else{
					log(`WARNING : No check for new lessons for ${date}`)
				}
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
				// If a lesson has been added or deleted in another date without any lessons
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

								sentence += `> - Date : ${date}\n> - Time : ${time}\n> - ${type} : ${name}\n> - Modality : ${modality}\n> - Teacher : ${teacher}\n\n`
							}
						}
				}

				const dateObj = new Date(realDate.split('/')[2], realDate.split('/')[1] - 1, realDate.split('/')[0]);
				if (dateObj.getTime() >= today.getTime()) {
					// scheduleChannel.send(`# A day with lesson(s) ${additionalInfos} on **${realDate}**\n<@&${groupToPing}>\n${sentence}`)
					scheduleChannel.send(`# A day with lesson(s) ${additionalInfos}\n<@&${groupToPing}>\n${sentence}`)
				}

			}

		}
		catch (error){
			log(`ERROR : Impossible to compare new and old schedule for ${file.username}, ${error}`)
			errorChannel.send(`Impossible to compare new and old schedule for ${file.username}`)
		}
	}
	// If the old file don't exist, it's like it's a weelklyAgenda
	else if(previousAgenda == 'Error' && typeof(currentAgenda) !== 'string'){
		log('Parse and print the agenda for the week')
		let resultats = await rappelWeeklyAgenda(client, currentAgenda, classes)
		scheduleChannel.send(resultats)
	}
	else{
		log(`Impossible to read ${classes}_agenda.json file, or retrieve currentAgenda...`)
		errorChannel.send(`Impossible to read ${classes}_agenda.json file, or retrieve currentAgenda...`)
		
	}

	if (typeof(currentAgenda) !== 'string' && JSON.stringify(currentAgenda) !== JSON.stringify(previousAgenda)){
		// Overwrite the file with the new schedule
		// Overwrite it if we have english lessons lol
		await gFunct.writeJsonFile('./users/agenda', `${classes}_agenda`, currentAgenda)
	}
	else if(JSON.stringify(currentAgenda) === JSON.stringify(previousAgenda)){
		log(`No new schedule for ${classes}`)
	}
	else{
		log(`ERROR "currentAgenda = error" cannot create or overwrite ${classes}_agenda.json, ${currentAgenda}`)
	}
}

// ---------------------------GRADES------------------------------------

export async function Grades(user, username, date){
	
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

export async function Absences(user, userName, date){
	
	log('Checking absences')

	const year = date.getFullYear();

	// Transform year into string
	let absences = await user.getAbsences(`${year}`)

	log('Creating absences array')
	
	if (absences){
		try{
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
		catch{
			absences = `Error when fetching your absences... userName : ${userName}`
		}

	}
	else{
		absences = 0
	}
	return absences

}

// ---------------------------------------------------------------------

export async function printAbsences(client, absences, file){

	let scheduleChannel = client.channels.cache.get(config.scheduleChannelId)
	let errorChannel = client.channels.cache.get(config.errorChannel)
	let userMessageChannel = await client.users.fetch(file.userId)

	if(typeof(absences) === 'string'){
		log(`${absences}`)
		errorChannel.send(absences)
		userMessageChannel.send(absences)
		return
	}
	else if (typeof(absences) === 'number'){
		log(`No absences for ${file.username}`)
		return
	}

	log('Compare old absences with current absences')

	// ReadFile
	const old_absences = await readJsonFile(`./users/absences/${file.username}_absences.json`)

	if (old_absences == 'Error'){
		log(`Impossible to read ./users/absences/${file.username}_absences.json`)
		return
	}

	// Compare current datas with already stored datas
	if (old_absences != 'Error' && typeof(absences) !== 'string') {
		let hoursMissed = 0
		let concat = ''

		// If an absence is deleted on a date or a full date
		let sentence = ''
		let nbAbs = 0

		for(date in old_absences){

			if (absences[date]){
				
				sentence += `> - ${date}`
				for (let time in old_absences[date]){
					if(!absences[date][time]){
						nbAbs++
						let name = old_absences[date][time].course_name
						sentence += `\n>  - **${name}** on ${time}`
					}
					
				}
				if (sentence == `> - ${date}\n`){
					sentence=''
				}

			}
			else{

				sentence += `\n> - ${date}`
				for (let abs in old_absences[date]){
					nbAbs ++
					let name = old_absences[date][abs].course_name
					sentence += `\n>  - **${name}** on ${abs}`
				}
				
			}			
		}

		if (nbAbs !== 0){
			// scheduleChannel.send(`${nbAbs} Absence(s) deleted\n ${sentence}`)
			userMessageChannel.send(`${nbAbs} Absence(s) deleted\n ${sentence}`)
		}

		// // New absence(s)	
		sentence = `You have `

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
			log('Send private message to inform new absence(s)')
			// scheduleChannel.send(sentence)
			userMessageChannel.send(sentence)
		}
		// }
		
	}
	// If the file don't exist (initial retrieve)
	else if(old_absences == 'Error' && typeof(absences) !== 'string')
	{
		// Inform the user the number of absence if have one or more
		// console.log(absences)

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

		log('Send private message for the first time')
		// scheduleChannel.send(`I detected **${nbHour}** absences\n${sentence}`)
		userMessageChannel.send(`I detected **${nbHour}** absences\n${sentence}`)
	}
	else{
		log(`ERROR : Error when retrieve absences for ${file.username}`)
		errorChannel.send(`Error when retrieve absences for ${file.username}`)
		userMessageChannel.send('Error when retrieve your absences')
	}

	if (typeof(absences) !== 'string' && JSON.stringify(old_absences) !== JSON.stringify(absences) || old_absences == 'Error'){
		// Then create a file with absences
		log('Writing absences file')
		await gFunct.writeJsonFile('./users/absences', `${file.username}_absences`, absences)
	}
	else if (absences == 'string'){
		log(`ERROR : ${absences}, or no absences datas for ${file.username}`)
	}
	else{
		log(`No new absences for ${file.username}`)
	}


	

}