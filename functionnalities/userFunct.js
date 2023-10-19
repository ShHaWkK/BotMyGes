/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


File which discuss with the ges-api.js
Simplify the index.js






***********************************************************************/

// ---------------------------------------------------------------------

import { GesAPI } from '../node_modules/myges/dist/ges-api.js';
import * as gFunct from './globalFunct.js'
import myGes from 'myges';
import fs from 'fs'


// ---------------------------------------------------------------------

// Return a class with functions => go to see ges-api.js to see functions
export async function login(username, password){
	try{
		console.log(`--------Try to login into ${username}--------`)
		const tmp = await GesAPI.login(username, password)
		console.log('--------Login ok--------')
		return tmp
	}
	catch{
		console.log(`--------Login error for ${username}--------`)
		return 'Error'
	}
}

// ---------------------------------------------------------------------

// Get the agenda from the api then sort it by date and by time
// param user is mandatory to call the gesapi functions
export async function Agenda(user, startD, endD, userId){
	console.log('--------Request Agenda--------')

	// Agenda have a lot unsorted objects inside
	let agenda = await user.getAgenda(startD, endD)

	console.log('--------Creating Agenda array--------')
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
	console.log("agenda",agenda)

	// Recover things (in object in an array of array)
	// Never change the "1"	
	// agenda[i][0] is always the date
	// agenda[i][1] is always an object named with the time
	console.log(`--------Preparing ${userId}_agenda.json--------`)
	let agendaToWrite = {}
	for (var i = 0; i < agenda.length; i++) {
		
		let cours = []

		// Retrieve infos and store it in variable
		for (const obj in agenda[i][1]){
			let type = agenda[i][1][obj].type
			let modality = agenda[i][1][obj].modality
			let nameCours = agenda[i][1][obj].name
			let teacher = agenda[i][1][obj].teacher
			// console.log(obj, type, name, modality, teacher)

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

			console.log(tmp)

			cours.push(tmp)
			// console.log("cours", cours)
		}

		agendaToWrite[agenda[i][0]] = {cours}
		console.log("agendaToWrite", agendaToWrite)
		
	}
	console.log("agendaToWrite", agendaToWrite)

	agenda = agendaToWrite
	// console.log("agenda", agenda)

	await gFunct.writeJsonFile('./users/agenda', `${userId}_agenda`, agenda)

	// //Boucle qui permet de parcourir les datas
	// // Reach each content in each date
	// for (let date in agenda) {
	// 	let cours = agenda[date].cours;
	// 	for (let i = 0; i < cours.length; i++) {
	// 		console.log(date, agenda[date].cours[i].time)
	// 	}
	// }
}

// ---------------------------------------------------------------------

async function getRappel(login, password, userId) {
    const user = await login(login, password); 
    const today = new Date();
    const agendaData = await Agenda(user, today, today, userId);
    
    if (agendaData && agendaData.length) {
        let messages = [];

        for (let i = 0; i < agendaData.length; i++) {
            let entry = agendaData[i];
            let timeKeys = Object.keys(entry[1]); // Récupère toutes les heures disponibles pour cette date
            let firstTime = timeKeys[0]; // Prend la première heure
            let eventName = entry[1][firstTime].name; // Récupère le nom de l'événement pour cette heure
            messages.push(`- ${firstTime}: ${eventName}`);
        }

        return messages.join("\n");
    } else {
        return "Aucun rappel pour aujourd'hui!";
    }
}

// ---------------------------------------------------------------------

