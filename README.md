# BotMyGes [DEPRECATED / OUTDATED]

This bot will not recieve any futur update..

Ce bot sert a se connecter au site internet myges utilisé par les étudiant français du réseau GES

## Le Bot ne fera l'objet d'aucun support après 2027-28

Dernière version en zip : https://github.com/ShHaWkK/BotMyGes/releases

### Mise en place du bot
1. Acquisition des fichiers
    1. Création d'un dossier dans lequel mettre les fichiers

    2. Télécharger les fichiers en zip
    Ou
    3. ```git clone https://github.com/ShHaWkK/BotMyGes.git```

2. Télécharger Node.js

    ``` npm i node.js ```

3. Télécharger les modules
    1. ```npm i myges@4.7.1```
    2. ```npm i discord.js@14.13.0```
    3. ```npm i node-fetch@3.3.2```

4. Configurer le bot
    1. Voir __Configurer le bot__

5. Run le programme
    1. ```node index.js```






### Configurer le bot

1. Rendez vous sur le portail developpeur de Discord
    1. Créer une nouvelle application
    2. Copier le token du bot

2. Activer le mode développeur sur votre application Discord
    1. Paramètre -> Avancé -> Developpeur Mode

3. Fichier config.json
    1. Rentrer le token du bot dans le fichier config.json au niveau de botToken
    2. Paramétrer les IDs obligatoires
        1. Sur Discord, clique droit sur le serveur et copier son ID (Dev Mode Activé obligatoire)
        2. Coller l'ID dans le fichier config.json pour le guildId

    3. Configurer trois channels pour le bot
        1. Créer un salon (error-channel par exemple)
        2. clique droit sur le salon nouvellement créé -> copier ID, puis coller l'ID dans config.json (pour errorChannel dans cet exemple).
        2. Répétez ces étapes pour les champs scheduleChanneId et reminderChannel

4. Vous pouvez désormais utiliser le bot
    1. ```node index.js```


### Vous pouvez utiliser une bibliothèque telle que pm2 pour windows afin de démarrer le bot lors du démarrage de votre ordinateur, ou host le bot sur un serveur distant.
 
