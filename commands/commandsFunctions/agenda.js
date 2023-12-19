import { log } from "../../functionnalities/globalFunct.js";
// import { Agenda } from "../../functionnalities/userFunct.js";
import config from '../../config.json' assert { type: 'json' }
import * as userFunct from "../../functionnalities/userFunct.js"
import * as gFunct from "../../functionnalities/globalFunct.js"
// import { rappelWeeklyAgenda } from "../../functionnalities/userFunct.js";


export async function personalAgenda(interaction, client){

    let username = interaction.user.username

    // Log into the myges user account
    const file = await gFunct.readJsonFile('./users/infos/'+username+'.json')

    if (file == 'Error'){
        await interaction.reply('Error, you need to be registered..')
        return
    }
    await interaction.reply('Sending a private message, can take more than a minute, please wait...');

    let errorChannel = await client.channels.cache.get(config.errorChannel)
    let userMessageChannel = await client.users.fetch(file.userId)

    try{

        // Create the current date
        var today = new Date();
        let monday = new Date(gFunct.getWeekMonday())
        let saturday = new Date(gFunct.getWeekSaturday())

        log(`Executing /agenda for ${username}`)

        // Variable to connect the bot to the myGes user account
        const login = file.login;
        const password = file.password;		

        // Login the user using userFunct.js
        const user = await userFunct.login(login, password)

        // Request the agenda

        // If I set 0 to hours, saturday it set to saturday 22h :/
        saturday.setUTCHours(0, 0, 0, 0);

        // Compare date to request the weekly scheldule or the next weekly schedule
        // console.log(today, saturday)
        if (today >= saturday){

            monday.setUTCHours(0,0,0,0)
            monday.setDate(monday.getDate() + 7);
            monday.setUTCHours(0,0,0,0)

            // console.log(saturday)
            saturday.setDate(saturday.getDate() + 7);

        }
        // console.log(monday, saturday)
        // Request the agenda
        const agenda = await userFunct.Agenda(user, monday, saturday)

        if(typeof(agenda) === 'string'){
            log(`ERROR : ${agenda}`)
            await interaction.reply(`ERROR : ${agenda}`);
            errorChannel.send(`ERROR : ${agenda}`)
            return
        }

        const sentence = await userFunct.rappelWeeklyAgenda(client, agenda, "no-role") 
        log(`Sending private message /agenda to ${username}`)
        await userMessageChannel.send(sentence);

    }
    catch{
        errorChannel.send(`ERROR : Impossible to retrieving schedule for ${username}`)
        userMessageChannel.send('Error when retrieving your schedule...')
        log(`ERROR : Impossible to retrieving schedule for ${username}`)
    }

}