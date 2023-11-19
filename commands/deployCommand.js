import { log } from '../functionnalities/globalFunct.js';
import { listJsonFile, readJsonFile } from '../functionnalities/globalFunct.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export async function deployCommand(client){

  // Import commands files
  const listFile = await listJsonFile('./commands/json/')

  let tmpArr = []
  // List all the cmd name in json files
  for (const file of listFile) {
    const command = await readJsonFile(`./commands/json/${file}`, 'utf8')
    if (command != ['Error']){
      tmpArr.push(command.name)
    }
  }
  // Check if the json files are same as command registered by Discord
  const listCMD = await client.application.commands.fetch()
  for (let cmd of listCMD.values()){
    // console.log(cmd)
    if(!(tmpArr.includes(cmd.name))){
      // Delete on discord if the command don't exist in the files
      try{
        client.application.commands.cache.find(c => c.name === cmd.name).delete();
        log(`The command ${cmd.name} has been deleted`)
      }
      catch{
        log(`ERROR : Impossible to delete the command ${cmd.name}`)
      }
    }
  }

  // Create slash commands
  let createdCommand = []
  for (const file of listFile) {

    try{

      const command = await readJsonFile(`./commands/json/${file}`, 'utf8')

      let commandData = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)

      log(`Deploying ${command.name}`)
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
              commandData.addIntegerOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;

            case 5:
              commandData.addBooleanOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;

            case 6:
              commandData.addUserOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;

            case 7:
              commandData.addChannelOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;

            case 8:
              commandData.addRoleOption(option =>
                  option.setName(optionC.name)
                      .setDescription(optionC.description)
                      .setRequired(optionC.required)
              );
              break;

            case 9:
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