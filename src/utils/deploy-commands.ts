import { REST, Routes } from 'discord.js';
import { loadCommands } from './loadCommands.js';
import dotenv from 'dotenv';

dotenv.config();

export async function registerCommands() {
  const commandsCollection = await loadCommands();
  const commands = Array.from(commandsCollection.values()).map(command => command.data.toJSON());

  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.GUILD_ID;
  const token = process.env.DISCORD_SECRET_TOKEN;

  if (!clientId || !guildId || !token) {
    console.error('Missing DISCORD_CLIENT_ID, GUILD_ID, or DISCORD_SECRET_TOKEN in .env');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId), 
      { body: commands }
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}