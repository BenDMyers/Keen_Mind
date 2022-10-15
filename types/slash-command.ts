import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export type CommandConfig = {
	data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	autocompleteOptions?: {name: string, value: string}[] | Promise<{name: string, value: string}[]>
}