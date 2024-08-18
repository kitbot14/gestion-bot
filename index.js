const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

// Initialisation du client Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Collection des commandes
client.commands = new Collection();

// Charger les commandes depuis le dossier commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Charger les événements depuis le dossier events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Enregistrement des commandes auprès de l'API Discord
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        const commands = client.commands.map(command => command.data.toJSON());
        console.log('Enregistrement des commandes slash...');
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );
        console.log('Commandes enregistrées avec succès.');
    } catch (error) {
        console.error(error);
    }
})();

// Login du bot
client.login(config.token);
