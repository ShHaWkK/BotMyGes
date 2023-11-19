import { log } from "../../functionnalities/globalFunct.js";
import config from '../../config.json' assert { type: 'json' }
import * as userFunct from "../../functionnalities/userFunct.js"
import * as gFunct from "../../functionnalities/globalFunct.js"

export async function personalAbsences(interaction, client){
    
    let username = interaction.user.username

    // Log into the myges user account
    const file = await gFunct.readJsonFile('./users/infos/'+username+'.json')

    if (file == 'Error'){
        interaction.reply('Error, you need to be registered..')
        return
    }

    interaction.reply('Sending private message for your absences')

    let errorChannel = await client.channels.cache.get(config.errorChannel)
    let userMessageChannel = await client.users.fetch(file.userId)

    try{

        // Variable to connect the bot to the myGes user account
        const login = file.login;
        const password = file.password;		

        // Login the user using userFunct.js
        const user = await userFunct.login(login, password)


        const today = new Date()
        const absences = await userFunct.Absences(user, username, today)

        if(typeof(absences) === 'string'){
            log(`${absences}`)
            errorChannel.send(absences)
            userMessageChannel.send(absences)
            return
        }
        else if (typeof(absences) === 'number'){
            log(`No absences for ${file.username}`)
            userMessageChannel.send(`No absences for you`)
            return
        }

        let sentence = "# You have missed :\n"
        for(let date in absences){

            sentence += `> - on ${date}`
            for (let time in absences[date]){
                if(absences[date][time]){
                    let name = absences[date][time].course_name
                    sentence += `\n>  - **${name}** on ${time}`
                }
                
            }
            
        }

        log(`Sending private message /absences to ${username}`)
        userMessageChannel.send(sentence)
    }
    catch{
        errorChannel.send(`Impossible to /absences for ${username}`)
        userMessageChannel.send(`Impossible to /absences`)
        log(`Impossible to /absences for ${username}`)
    }
}