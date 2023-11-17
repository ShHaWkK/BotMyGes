# BotMyGes 

(Actuellement en Cours.....) 
Ce bot sert a se connecter au site internet myges utilisé par les étudiant français du réseau GES

## __**Le Bot ne fera l'objet d'aucun support après 2027-28**__

### __Mise en palce du bot__
1. Acquisition des fichiers
    1. Création d'un dossier dans lequel mettre les fichiers

    2. Télécharger les fichiers en zip
    Ou
    3. ````git clone https://github.com/ShHaWkK/BotMyGes.git``

2. Télécharger Node.js

 ``` npm i node.js ```

3. Télécharger les modules
 ```npm i myges@4.7.1```
 ```npm i discord.js@14.13.0```
 ```npm i node-fetch@3.3.2```

4. Configurer le bot
 Voir __Configurer le bot__

5. Run le programme
 ````node index.js``


### __Configurer le bot__

1. Rendez vous sur le portail developpeur de Discord
    1. Créer une nouvelle application
    2. Copier le token du bot

2. Activer le mode développeur
    1. Paramètre -> Avancé -> Developpeur Mode

3. Fichier config.json
    1. Rentrer le token du bot dans le fichier config.json au niveau de botToken
    2. ID du serveur
        1. Sur Discord, clique droit sur le serveur et copier son ID (Dev Mode Activé obligatoire)
        2. Coller l'ID dans le fichier config.json pour le guildId

    3. Configurer trois channels pour le bot
        1. errorChannel (clique droit sur le salon -> copier ID) et coller l'ID dans config.json pour errorChannel.
        2. Répétez ces étapes pour scheduleChanneId et reminderChannel

4. Vous pouvez désormais utiliser le bot
 
