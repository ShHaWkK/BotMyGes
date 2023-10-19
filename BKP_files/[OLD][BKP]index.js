import config from './config.json' assert { type: 'json' };
import { GesAPI } from './node_modules/myges/dist/ges-api.js';
import myGes from 'myges';
import fs from 'fs'


const clientId = '<client-id>';
const login = config.username;
const password = config.password;

const startD = new Date('2023-10-16');
const endD = new Date('2023-10-21');

GesAPI.login(login, password)
  .then((api) => {
    return api.getAgenda(startD, endD);


  })
  .then((data) => {
    console.log(data)

    for (let i = 0; i < data.length; i++) {

      let start = data[i].start_date;
      let end = data[i].end_date;
      let date = new Date(start);
      let startDateString = date.toLocaleString();
      date = new Date(end);
      let endDateString = date.toLocaleString();


      console.log(data[i].type);
      console.log(data[i].modality);
      console.log(startDateString);
      console.log(endDateString);
      console.log(data[i].name);
      console.log(data[i].teacher);
    }


    // const jsonData = JSON.stringify(data);
    // fs.writeFile('agenda.json', jsonData, (err) => {
    //   if (err) throw err;
    //   console.log('Data written to file');
    // });
  })
  .catch((err) => {
    console.error(err);
  });







