import { log } from '../functionnalities/globalFunct.js';
import { listJsonFile, readJsonFile } from '../functionnalities/globalFunct.js';

export async function deployCommand(client){

  // Import commands files
  const listFile = await listJsonFile('./commands/json/')

  // Create slash commands
  let createdCommand = []
  for (const file of listFile) {

    try{
      
      const command = await readJsonFile(`./commands/json/${file}`, 'utf8')
      const commandData = {
        name: command.name,
        description: command.description,
      };
      await client.application.commands.create(commandData);
      createdCommand.push(command.name)
    }
    catch(err){
      log(`ERROR : Impossible to create the ${file} command : ${err}`)
    }
    
  }

  log(`Created global command ${createdCommand.length}/${listFile.length} : ${createdCommand}`)
}