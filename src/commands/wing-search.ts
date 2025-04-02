import { SlashCommandBuilder } from 'discord.js';
import { generateResponse } from '../utils/prompt.js';

export default {
  data: new SlashCommandBuilder()
    .setName('wing-search')
    .setDescription('Search with a prompt')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('The prompt to search')
        .setRequired(true)
    ),
  async execute(interaction: any) {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.deferReply();
    try {
      const response = await generateResponse(prompt, interaction.user.id);
      await interaction.editReply(response);
    } catch (error) {
      await interaction.editReply('Error generating response.');
    }
  },
};