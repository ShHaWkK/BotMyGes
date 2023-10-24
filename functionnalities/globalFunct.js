/*******************************************************************
Author : Marc Lecomte
Date : 19/10/2023

Just some global function for the program


********************************************************************/

// ------------------------------------------------------------------
import { fileURLToPath } from 'url';
import path from 'path'
import fs from 'fs'

// ------------------------------------------------------------------

// ------------------------------------------------------------------

export function log(str) {
  // Determinate the path of the globalFunct.js file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Determinate the path of the log folder and file
  const logDir = path.join(__dirname.split('\\functionnalities')[0], 'log');
  const filePath = path.join(logDir, 'log.txt');

  if (fs.existsSync(logDir) == false) {
    fs.mkdirSync(logDir);
  }

  var today = new Date();
  let previousStr = `[${today.toLocaleDateString()} - ${today.toLocaleTimeString()}] `

  console.log(previousStr+str)
  fs.appendFileSync(filePath, previousStr+str+'\n');
}

// ------------------------------------------------------------------

export async function listJsonFile(Path) {
  // const directoryPath = '../users/';
	const relativePath = Path

  try {
    const files = await fs.promises.readdir(relativePath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    return jsonFiles;
  } catch (err) {
    // console.error('Error reading directory:', err);
    log(`ERROR : Reading directory ${relativePath}, ${err}`)
    return 'Error';
  }
}

// ------------------------------------------------------------------

export async function readJsonFile(fileName) {
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // console.error('Erreur de lecture du fichier JSON:', error);
    log(`ERROR : Reading Json file ${fileName}, ${error}`)
    return 'Error';
  }
}

// ------------------------------------------------------------------

export async function writeJsonFile(directoryPath, name, array){

  const directories = directoryPath.split(path.sep);
  let currentPath = '';
  const json = JSON.stringify(array, null, 2)

  directories.forEach((directory) => {
    currentPath = path.join(currentPath, directory);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });


  fs.writeFile(`${directoryPath}/${name}.json`, json, (err) => {
	  if (err) {
	    console.error(err);
      log(`ERROR : error while writing file ${directoryPath}/${name}.json, ${err}`)
	    return;
	  }
	  // console.log('Data written to file');
    log(`Data written to ${directoryPath}/${name}.json`)
	});
}

// ------------------------------------------------------------------

// Calculate the number of the current week
Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  var week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// ------------------------------------------------------------------

// Calculate the date of the monday of the current week
Date.prototype.getWeekMonday = function() {
  var date = new Date(this.getTime());
  var day = date.getDay();
  var diff = date.getDate() - day + (day == 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toLocaleDateString('en-US').split('/').join('-');
};

// ------------------------------------------------------------------

// Calculate the date of the saturday of the current week
Date.prototype.getWeekSaturday = function() {
  var date = new Date(this.getTime());
  var day = date.getDay();
  var diff = date.getDate() - day + (day == 0 ? 0 : 6);
  return new Date(date.setDate(diff)).toLocaleDateString('en-US').split('/').join('-');
};

// ------------------------------------------------------------------



// ------------------------------------------------------------------