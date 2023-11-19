import { register } from "./commandsFunctions/register.js";
import { setStatus } from "./commandsFunctions/setstatus.js";
import { help } from "./commandsFunctions/help.js";
import { personalAgenda } from "./commandsFunctions/agenda.js";

export async function executeSlashCommand(interaction, client){
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'agenda') {
        personalAgenda(interaction, client)
    }

    if (interaction.commandName === 'help') {
        help(interaction)
    }

    if (interaction.commandName === 'register') {
      register(interaction)
    }

    if (interaction.commandName === 'rappel') {
        await interaction.reply('rappel !');
    }

    if (interaction.commandName === 'set-status') {
        setStatus(interaction, client)
    }

    if (interaction.commandName === 'set-up') {
        await interaction.reply('set-up !');
    }
      
};