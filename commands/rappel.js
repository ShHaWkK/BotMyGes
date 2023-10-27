const fs = require('fs');


function declencherRappel(date, sujet) {
    // Lire le fichier pour obtenir les rappels existants
    fs.readFile(remindersFile, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
            console.error("Erreur lors de la lecture du fichier:", err);
            return;
        }

        // Parse le contenu du fichier
        let reminders = [];
        try {
            reminders = JSON.parse(data);
        } catch (error) {
            console.error("Erreur lors de l'analyse des rappels:", error);
            return;
        }

        // Ajouter le nouveau rappel
        reminders.push({
            date: date,
            sujet: sujet
        });

        // Sauvegarder les rappels mis à jour
        fs.writeFile(remindersFile, JSON.stringify(reminders, null, 2), (err) => {
            if (err) {
                console.error("Erreur lors de l'écriture du fichier:", err);
            } else {
                console.log('Rappel ajouté avec succès!');
            }
        });
    });
}

module.exports = declencherRappel;


// Cette fonction enregistre le rappel dans un fichier JSON.
function saveToJSON(date, subject) {
    
    let reminders = [];
    try {
        reminders = JSON.parse(fs.readFileSync('reminders.json', 'utf8'));
    } catch (error) {
        console.log("Fichier reminders.json non trouvé. Création d'un nouveau fichier.");
    }

    // Ajouter le nouveau rappel
    reminders.push({
        date: date,
        subject: subject
    });

    // Sauvegarder les données 
    const jsonData = JSON.stringify(reminders, null, 2);
    fs.writeFile('reminders.json', jsonData, (err) => {
        if (err) throw err;
        console.log(`Rappel ajouté pour ${subject} le ${date}.`);
    });
}

// Cette fonction interprète la commande et stocke le rappel
function processCommand(command) {
    const parts = command.split(' ');
    if (parts.length < 3 || parts[0] !== '/rappel') {
        console.error("Commande invalide.");
        return;
    }

    const date = parts[1];
    const subject = parts.slice(2).join(' ');

    saveToJSON(date, subject);
}

export default processCommand;
