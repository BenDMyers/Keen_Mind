import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { AutocompleteOption } from "../utils/map-to-autocomplete";

// export type CommandBuilder = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export type CommandConfig = {
	// data: SlashCommandBuilder | CommandBuilder;
	data: SlashCommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	autocompleteOptions?: AutocompleteOption[] | Promise<AutocompleteOption[]>
}