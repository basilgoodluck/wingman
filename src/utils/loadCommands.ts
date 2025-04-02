import { Collection } from "discord.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(): Promise<Collection<string, any>> {
  const commands = new Collection<string, any>();

  try {
    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    console.log('Command files found:', commandFiles); // Debug: See what files are detected

    for (const file of commandFiles) { // Use 'of' to iterate over file names
      const filePath = path.join(commandsPath, file);
      const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
      
      try {
        const commandModule = await import(fileUrl);
        const command = commandModule.default;

        if (command && 'data' in command && 'execute' in command) {
          commands.set(command.data.name, command);
          console.log(`Loaded command: ${command.data.name}`);
        } else {
          console.warn(`Skipping ${file}: missing 'data' or 'execute'`);
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading commands directory:', error);
  }

  console.log(`Total commands loaded: ${commands.size}`);
  return commands;
}