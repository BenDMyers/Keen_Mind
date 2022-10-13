import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export type CommandConfig = {
	data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}