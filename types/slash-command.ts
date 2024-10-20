import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import type { AutocompleteOption } from "../utils/map-to-autocomplete";

export type CommandConfig = {
	data:
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
		| SlashCommandSubcommandsOnlyBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	autocompleteOptions?: AutocompleteOption[] | Promise<AutocompleteOption[]>
}