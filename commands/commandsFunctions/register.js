import { log } from "../../functionnalities/globalFunct.js";
import { writeJsonFile } from "../../functionnalities/globalFunct.js";

export async function register(interaction){
    log(`Registeration begin for ${interaction.user.username}`)
    const mygesusername = interaction.options.getString('mygesusername')
    const mygespassword = interaction.options.getString('mygespassword')
    const username = interaction.user.username
    const userid = interaction.user.id

    let infos = 
    {
        "userId":userid,
        "username":username,
        "login":mygesusername,
        "password":mygespassword
    }
    let tmp = await writeJsonFile("./users/infos", `${username}.json`, infos)

    if (tmp != 'ok'){
        await interaction.reply('Registered !');
    }
    else{
        await interaction.reply('Error when registeration....');
    }

   
}