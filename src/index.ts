import { Client, GatewayIntentBits } from "discord.js";
import {
    createChannelCommand,
    deleteChannelCommand,
    disableNSFWCommand,
    enableNSFWCommand,
    modifyNameCommand,
    modifyTopicCommand,
} from "./channelHandler";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.TOKEN;
const categoryId = process.env.CATEGORY_ID;
const channelLimitString = process.env.CHANNEL_LIMIT;
const channelLimit =
    channelLimitString != undefined ? parseInt(channelLimitString) : undefined;

if (
    token === undefined ||
    categoryId === undefined ||
    channelLimit === undefined
) {
    console.error("Missing some required variables");
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration],
});

client.login(token).catch(console.error);

client.on("ready", (client) => {
    console.log(
        `Logged in as ${client.user.username} on ${client.guilds.cache.size} servers`
    );
    client.user.setPresence({
        activities: [{ name: "channel-manager" }],
        status: "online",
    });
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
            case "create":
                await createChannelCommand(
                    interaction,
                    categoryId,
                    channelLimit
                );
                break;
            case "delete":
                await deleteChannelCommand(interaction);
                break;
            case "modify-name":
                await modifyNameCommand(interaction);
                break;
            case "modify-topic":
                await modifyTopicCommand(interaction);
                break;
            case "enable-nsfw":
                await enableNSFWCommand(interaction);
                break;
            case "disable-nsfw":
                await disableNSFWCommand(interaction);
                break;
        }
    }
});

client.on("error", console.error);
