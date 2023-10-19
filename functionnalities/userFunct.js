/**********************************************************************
Author : Marc Lecomte
Date : 18/10/2023


File which discuss with the ges-api.js
Simplify the index.js






***********************************************************************/

// ---------------------------------------------------------------------

import { GesAPI } from '../node_modules/myges/dist/ges-api.js';
import myGes from 'myges';
import fs from 'fs'


// ---------------------------------------------------------------------

// Return a class with functions => go to see ges-api.js to see functions
export async function login(username, password){
	return await GesAPI.login(username, password)
}

// ---------------------------------------------------------------------

// Get the agenda from the api then sort it by date and by time
export async function Agenda(user, startD, endD){
	// Agenda have a lot unsorted objects inside
	const agenda = await user.getAgenda(startD, endD)


	// Create an array to store objects by date, then by time
	let dict = []
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
			dict[date][time]['wtf_un_deuxieme_cours_en_meme_temps_kénié'] = agenda[i];
		}


    }

    // Sort the dict from the "lowest" date to the "uppest" date
    // Idk how it works btw
    const sortedData = Object.entries(dict).sort((a, b) => {
	  const dateA = new Date(a[0].split('/').reverse().join('-'));
	  const dateB = new Date(b[0].split('/').reverse().join('-'));
	  return dateA - dateB;
	});

    // // Just to console.log() the good data
	// for (var i = 0; i < agenda.length; i++) {
	// 	console.log('----------------------------------------------------------------------------')
	// 	console.log(agenda[i][0], Object.keys(agenda[i][1]))

	// 	for (const obj in agenda[i][1]){
	// 		let type = agenda[i][1][obj].type
	// 		let modality = agenda[i][1][obj].modality
	// 		let name = agenda[i][1][obj].name
	// 		let teacher = agenda[i][1][obj].teacher
	// 		console.log(obj, type, name, modality, teacher)
	// 	}
	// }

	return sortedData
}

// ---------------------------------------------------------------------

