import { Client, Collection } from "discord.js"
import { CommandConfig } from "./slash-command"

export interface CustomDiscordClient extends Client<boolean> {
	commands: Collection<string, CommandConfig>
}