import config from '../../config.json' assert { type: 'json' }
import { log } from '../../functionnalities/globalFunct.js'


export async function addOwner(interaction, client){
    log('Running add-owner')
    
    const owners = config.owners

    if (!(owners.includes(interaction.user.username))){
        interaction.reply('Your not the owner of the bot...')
        return
    }

    interaction.reply('Command under construction..')
}