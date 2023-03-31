import {
    Guild,
    CategoryChannel,
    Snowflake,
    TextChannel,
    ChatInputCommandInteraction,
} from "discord.js";

function getCategoryChannels(guild: Guild) {
    return guild.channels.cache
        .filter((c) => c instanceof CategoryChannel)
        .map((c) => c as CategoryChannel);
}

function getCategoryChannel(guild: Guild, id: Snowflake) {
    return getCategoryChannels(guild).find((c) => c.id == id);
}

function getChildChannelsInCategory(guild: Guild, id: Snowflake) {
    return getCategoryChannel(guild, id)?.children?.cache;
}

function isChannelTopicOfUser(topic: string | null, id: string) {
    return topic?.endsWith(`owner: ${id}`) || false;
}

function isChannelOfUser(channel: TextChannel, userId: string) {
    return isChannelTopicOfUser(channel.topic, userId);
}

function getTopic(userId: string, content: string) {
    return `${content === "" ? "" : `${content}\n`}owner: ${userId}`;
}

function getChannelsOfUser(
    guild: Guild,
    categoryId: Snowflake,
    userId: string
) {
    return getChildChannelsInCategory(guild, categoryId)
        ?.filter((c) => c instanceof TextChannel)
        ?.map((c) => c as TextChannel)
        ?.filter((c) => isChannelTopicOfUser(c.topic, userId));
}

async function createChannel(
    guild: Guild,
    categoryId: Snowflake,
    name: string,
    userId: string
) {
    return await getCategoryChannel(guild, categoryId)?.children?.create({
        name: name,
        topic: getTopic(userId, ""),
    });
}

function canCreateChannel(
    guild: Guild,
    categoryId: string,
    userId: string,
    limit: number
) {
    const count = getChannelsOfUser(guild, categoryId, userId)?.length || 0;
    return count < limit;
}

export async function createChannelCommand(
    interaction: ChatInputCommandInteraction,
    categoryId: string,
    channelLimit: number
) {
    const guild = interaction.guild;
    const userId = interaction.user.id;
    if (guild !== null && categoryId !== undefined) {
        if (canCreateChannel(guild, categoryId, userId, channelLimit)) {
            const name = interaction.options.getString("name", true);
            const channel = await createChannel(
                guild,
                categoryId,
                name,
                userId
            );
            if (channel !== undefined) {
                await interaction.reply({
                    content: `チャンネルを作成しました <#${channel.id}>`,
                });
            }
        } else {
            await interaction.reply({
                content: "チャンネル作成可能数の上限に達しています",
            });
        }
    }
}

async function editCommand(
    interaction: ChatInputCommandInteraction,
    action: (channel: TextChannel) => Promise<void>
) {
    const channel = interaction.channel;
    if (channel instanceof TextChannel) {
        if (isChannelOfUser(channel, interaction.user.id)) {
            await action(channel);
        } else {
            await interaction.reply({
                content: "自分のチャンネルのみ変更することができます",
            });
        }
    }
}

export async function deleteChannelCommand(
    interaction: ChatInputCommandInteraction
) {
    await editCommand(interaction, async (channel) => {
        const confirm = interaction.options.getBoolean("confirm", true);
        if (confirm) {
            await interaction.reply({
                content: "このチャンネルは削除されます",
            });
            await channel.delete();
        } else {
            await interaction.reply({
                content: "チャンネルの削除をキャンセルしました",
            });
        }
    });
}

export async function modifyNameCommand(
    interaction: ChatInputCommandInteraction
) {
    await editCommand(interaction, async (channel) => {
        const name = interaction.options.getString("name", true);
        await channel.setName(name);
        await interaction.reply({
            content: "このチャンネルの名前を変更しました",
        });
    });
}

export async function modifyTopicCommand(
    interaction: ChatInputCommandInteraction
) {
    await editCommand(interaction, async (channel) => {
        const content = interaction.options.getString("topic", true);
        await channel.setTopic(getTopic(interaction.user.id, content));
        await interaction.reply({
            content: "このチャンネルのトピックを変更しました",
        });
    });
}

export async function enableNSFWCommand(
    interaction: ChatInputCommandInteraction
) {
    await editCommand(interaction, async (channel) => {
        await channel.setNSFW(true);
        await interaction.reply({
            content: "このチャンネルの年齢制限を有効にしました",
        });
    });
}

export async function disableNSFWCommand(
    interaction: ChatInputCommandInteraction
) {
    await editCommand(interaction, async (channel) => {
        await channel.setNSFW(false);
        await interaction.reply({
            content: "このチャンネルの年齢制限を無効にしました",
        });
    });
}
