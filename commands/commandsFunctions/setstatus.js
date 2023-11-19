import { log } from "../../functionnalities/globalFunct.js";

export async function setStatus(interaction, client){
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