import { log } from "../../functionnalities/globalFunct.js";
import { readJsonFile } from "../../functionnalities/globalFunct.js";

export async function help(interaction){

    const file = await readJsonFile('./commands/helpFile.json')

    if (file == 'Error'){
        interaction.reply('Impossible to read helpFile.json')
        return
    }

    if (interaction.options.getString('command')){

        let command = interaction.options.getString('command')
        command = command.toLowerCase()

        if (file[command]){
            
            await showCommand(interaction, file, command)

        }
        else{
            await interaction.reply('This command doesn\'t exist..');
            return
        }
    }
    else{
        log(`Showing list of commands`)
        let sentence = "# List of all the commands\n"
        // for (let cmd of file){
        for (const [key, value] of Object.entries(file)) {
            // console.log(cmd)
            sentence+=`> - ${value.name} : ${value.command}\n`
        }
        await interaction.reply(sentence)
        log('Replied to /help')
    }

}

function showCommand(interaction, file, command){
    log(`Showing command ${command}`)
    let infos = file[command]
    let sentence = `# __${infos.name}__\n## ${infos.description}\n### ${infos.command}\n`

    let conditions = infos.conditions.split('~~')

    for (let i = 0; i < conditions.length; i++) {
        sentence += `> - ${conditions[i].trim()}\n`;
    }
    
    interaction.reply(sentence);
    log(`Replied to ${command}`)
}