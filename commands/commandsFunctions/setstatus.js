import { log } from "../../functionnalities/globalFunct.js";
import config from '../../config.json' assert { type: 'json' }

export async function setStatus(interaction, client){

    const owners = config.owners

    if (!(owners.includes(interaction.user.username))){
        interaction.reply('Your not the owner of the bot...')
        return
    }

    try{
        client.user.setActivity({
            name: interaction.options.getString('new-status')
        })
        await interaction.reply(`Status switched for ${interaction.options.getString('new-status')}`);
        log(`Status switched for ${interaction.options.getString('new-status')}`)
    }
    catch{
        interaction.reply('ERROR : Impossible to set the activity of the bot');
        log('ERROR : Impossible to set the activity of the bot')
    }
}