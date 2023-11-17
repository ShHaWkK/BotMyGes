// Slashes command in alphabetical order...

export async function executeSlashCommand(interaction){
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'blep') {
        // Delete the command
        await interaction.reply('Command under construction... :(');
    }

    if (interaction.commandName === 'help') {
        // Ajouter votre action ici
        await interaction.reply('help !');
    }

    if (interaction.commandName === 'register') {
      // Ajouter votre action ici
      await interaction.reply('Registered !');
    }

    if (interaction.commandName === 'rappel') {
        // Ajouter votre action ici
        await interaction.reply('rappel !');
    }

    if (interaction.commandName === 'set-up') {
        // Ajouter votre action ici
        await interaction.reply('set-up !');
    }
      
};