/*******************************************************************
Author : Marc Lecomte
Date : 19/10/2023

Just some global function for the program


********************************************************************/

// ------------------------------------------------------------------

import path from 'path'
import fs from 'fs'

// ------------------------------------------------------------------

export async function listJsonFile(Path) {
  // const directoryPath = '../users/';
	const relativePath = Path

  try {
    const files = await fs.promises.readdir(relativePath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    return jsonFiles;
  } catch (err) {
    console.error('Error reading directory:', err);
    return ['Error'];
  }
}

// ------------------------------------------------------------------

export function readJsonFile(fileName) {
  try {
    // const directoryPath = './ytbChannels/';
    // const data = fs.readFileSync(directoryPath + fileName, 'utf8');
    const data = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur de lecture du fichier JSON:', error);
    return ['Error'];
  }
}

// ------------------------------------------------------------------

export function writeJsonFile(pathName, array){

}