import { log } from '../functionnalities/globalFunct.js';
import { listJsonFile, readJsonFile } from '../functionnalities/globalFunct.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export async function deployCommand(client){

  // Import commands files
  const listFile = await listJsonFile('./commands/json/')

  // Create slash commands
  let createdCommand = []
  for (const file of listFile) {

    try{

      const command = await readJsonFile(`./commands/json/${file}`, 'utf8')

      let commandData = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)

      // // Add options to the command
      if (command.options) {
        for (const optionC of command.options) {

          switch (optionC.type) {
            case 3:
              commandData.addStringOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            case 4:
              // commandData.addIntegerOption(option.name, option.description);
              commandData.addIntegerOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            case 5:
              // commandData.addBooleanOption(option.name, option.description);
              commandData.addBooleanOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            case 6:
              // commandData.addUserOption(option.name, option.description);
              commandData.addUserOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            case 7:
              // commandData.addChannelOption(option.name, option.description);
              commandData.addChannelOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            case 8:
              // commandData.addRoleOption(option.name, option.description);
              commandData.addRoleOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            case 9:
              // commandData.addMentionableOption(option.name, option.description);
              commandData.addMentionableOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;
            default:
              log(`ERROR : Invalid option type for ${option.name} in ${file}`);
              break;
          }
        }
      }

      await client.application.commands.create(commandData);
      createdCommand.push(command.name)
    }
    catch(err){
      log(`ERROR : Impossible to create the ${file.split('.json')[0]} command : ${err}`)
    }
    
  }

  log(`Created global command ${createdCommand.length}/${listFile.length} : ${createdCommand}`)
}