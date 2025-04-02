import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { generateResponse, clearHistory } from './utils/prompt.js';
import { registerCommands } from './utils/deploy-commands.js';
import { loadCommands } from './utils/loadCommands.js';
import dotenv from 'dotenv';

dotenv.config();

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, any>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection<string, any>();

async function main() {
  try {
    const commands = await loadCommands();
    client.commands = commands;
    await registerCommands();

    client.once(Events.ClientReady, () => {
      console.log(`Logged in as ${client.user?.tag}`);
    });

    // Slash command handling (unchanged)
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        await interaction.reply({
          content: 'Error executing this command!',
          ephemeral: true,
        });
      }
    });

    // Message handling
    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return; // Skip bot messages

      // Bot ID is safe after login, but we’ll assert it for TypeScript
      const botId = client.user!.id; // Non-null assertion since this runs after ClientReady

      // Check if bot is mentioned or replied to
      const isMentioned = message.mentions.users.has(botId);
      const isReplyToBot = message.reference && message.reference.messageId
        ? (await message.channel.messages.fetch(message.reference.messageId)).author.id === botId
        : false;

      // Handle !chat
      if (message.content.startsWith('!chat')) {
        const prompt = message.content.slice(5).trim();
        if (!prompt) return message.reply('Provide a prompt after !chat.');

        try {
          const response = await generateResponse(prompt, message.author.id);
          await message.reply(response);
        } catch (error) {
          await message.reply('Error generating response.');
        }
      }
      // Handle !clear
      else if (message.content === '!clear') {
        clearHistory(message.author.id);
        await message.reply('Chat history cleared.');
      }
      // Handle mentions or replies
      else if (isMentioned || isReplyToBot) {
        let prompt = message.content.trim();
        if (isMentioned) {
          const mentionRegex = new RegExp(`<@!?${botId}>|@${client.user?.username}`, 'i');
          prompt = prompt.replace(mentionRegex, '').trim();
        }

        if (!prompt) return message.reply('Give me something to work with!');

        try {
          const response = await generateResponse(prompt, message.author.id);
          await message.reply(response);
        } catch (error) {
          await message.reply('Error generating response.');
        }
      }
    });

    await client.login(process.env.DISCORD_SECRET_TOKEN);
    console.log('Bot is online!');
  } catch (error) {
    console.error('Error starting bot:', error);
    process.exit(1);
  }
}

main();