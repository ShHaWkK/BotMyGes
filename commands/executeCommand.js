import { register } from "./commandsFunctions/register.js";
import { help } from "./commandsFunctions/help.js";
import { personalAgenda } from "./commandsFunctions/agenda.js";
import { personalAbsences } from "./commandsFunctions/absences.js";

import { addOwner } from "./commandsFunctions/addowner.js";
import { setStatus } from "./commandsFunctions/setstatus.js";

export async function executeSlashCommand(interaction, client){
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'absences') {
        personalAbsences(interaction, client)
    }

    if (interaction.commandName === 'agenda') {
        personalAgenda(interaction, client)
    }

    if (interaction.commandName === 'grades') {
        await interaction.reply('Command under construction..');
    }

    if (interaction.commandName === 'help') {
        help(interaction)
    }

    if (interaction.commandName === 'register') {
        register(interaction)
    }

    if (interaction.commandName === 'rappel') {
        await interaction.reply('Command under construction..');
    }



    // Admin Commands
    if (interaction.commandName === 'add-owner') {
        addOwner(interaction, client)
    }

    if (interaction.commandName === 'set-status') {
        setStatus(interaction, client)
    }

    if (interaction.commandName === 'set-up') {
        await interaction.reply('Command under construction..');
    }
      
};