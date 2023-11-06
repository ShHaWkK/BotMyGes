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

export async function writeJsonFile(directoryPath, name, array, optionnalSentence = ""){

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
    log(`Data written ${optionnalSentence}to ${directoryPath}/${name}.json`)
	});
}

// ------------------------------------------------------------------

export function getWeekMonday(){
  var today = new Date();
  today.setHours(0, 0, 0)
  var dayOfWeek = today.getDay();
  // var daysUntilMonday = dayOfWeek === 0 ? 6 : 1 - dayOfWeek;
  var daysUntilMonday = 1 - ((dayOfWeek + 6) % 7);
  var monday = new Date(today.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  return monday
}

// ------------------------------------------------------------------

// export function getWeekSaturday(){
//   var today = new Date();
//   today.setHours(0, 0, 0)
//   var dayOfWeek = today.getDay();
//   var daysUntilSaturday = dayOfWeek === 6 ? 1 : 6 - dayOfWeek;
//   var saturday = new Date(today.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
//   return saturday
// }

// "New function", need to test it if we are not sunday (day 0)
export function getWeekSaturday() {
  var today = new Date();
  today.setHours(0, 0, 0)
  var dayOfWeek = today.getDay();
  // var daysUntilSaturday = 6 - dayOfWeek;
  var daysUntilSaturday = 6 - ((dayOfWeek + 6) % 7);
  var saturday = new Date(today.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
  return saturday;
}

// ------------------------------------------------------------------

// export function getWeek(week) {
//   var date = new Date(week.getTime());
//   date.setHours(0, 0, 0, 0);
//   date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
//   var week1 = new Date(date.getFullYear(), 0, 4);
//   return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
// };

// ------------------------------------------------------------------



// ------------------------------------------------------------------