import { GesAPI } from './node_modules/myges/dist/ges-api.js';
import { log, readJsonFile } from './functionnalities/globalFunct.js'
import config from './config.json' assert { type: 'json' }
import * as gFunct from './functionnalities/globalFunct.js'
import * as userFunct from './functionnalities/userFunct.js'
import myGes from 'myges';
import fs from 'fs'
import { assert } from 'console';



const file = await gFunct.readJsonFile('./users/infos/556461959042564098.json')

// Variable to connect the bot to the myGes user account
const userId = file.userId;
// const username = file.username
const login = file.login;
const password = file.password;		


const user = await userFunct.login(login, password)

// let agenda = await user.getProfile()

const test = await userFunct.getClasses(user, '2023')

console.log(`${test[0].promotion} - ${test[0].name}`)