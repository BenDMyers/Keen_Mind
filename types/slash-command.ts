import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { AutocompleteOption } from "../utils/map-to-autocomplete";

export type CommandConfig = {
	data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	autocompleteOptions?: AutocompleteOption[] | Promise<AutocompleteOption[]>
}