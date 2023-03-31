const { REST, SlashCommandBuilder, Routes } = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const applicationId = process.env.APPLICATION_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const createCommand = new SlashCommandBuilder()
    .setName("create")
    .setDescription("チャンネルを作成する")
    .addStringOption((option) =>
        option.setName("name").setDescription("チャンネル名").setRequired(true)
    )
    .setDMPermission(false);

const deleteCommand = new SlashCommandBuilder()
    .setName("delete")
    .setDescription("コマンドを実行したチャンネルを削除する")
    .addBooleanOption((option) =>
        option.setName("confirm").setDescription("削除の確認").setRequired(true)
    )
    .setDMPermission(false);

const modifyNameCommand = new SlashCommandBuilder()
    .setName("modify-name")
    .setDescription("コマンドを実行したチャンネルの名前を変更する")
    .addStringOption((option) =>
        option.setName("name").setDescription("チャンネル名").setRequired(true)
    )
    .setDMPermission(false);

const modifyTopicCommand = new SlashCommandBuilder()
    .setName("modify-topic")
    .setDescription("コマンドを実行したチャンネルのトピックを変更する")
    .addStringOption((option) =>
        option.setName("topic").setDescription("トピック").setRequired(true)
    )
    .setDMPermission(false);

const enableNSFWCommand = new SlashCommandBuilder()
    .setName("enable-nsfw")
    .setDescription("コマンドを実行したチャンネルの年齢制限を有効にする")
    .setDMPermission(false);

const disableNSFWCommand = new SlashCommandBuilder()
    .setName("disable-nsfw")
    .setDescription("コマンドを実行したチャンネルの年齢制限を無効にする")
    .setDMPermission(false);

const commands = [
    createCommand,
    deleteCommand,
    modifyNameCommand,
    modifyTopicCommand,
    enableNSFWCommand,
    disableNSFWCommand,
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
    body: commands,
})
    .then((data) =>
        console.log(
            `Successfully registered ${data.length} application commands.`
        )
    )
    .catch(console.error);
