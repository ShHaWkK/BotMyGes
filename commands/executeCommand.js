import { register } from "./commandsFunctions/register.js";
import { setStatus } from "./commandsFunctions/setstatus.js";
import { help } from "./commandsFunctions/help.js";

export async function executeSlashCommand(interaction, client){
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'help') {
        help(interaction)
    }

    if (interaction.commandName === 'register') {
      await register(interaction)
    }

    if (interaction.commandName === 'rappel') {
        await interaction.reply('rappel !');
    }

    if (interaction.commandName === 'set-status') {
        await setStatus(interaction, client)
    }

    if (interaction.commandName === 'set-up') {
        await interaction.reply('set-up !');
    }
      
};