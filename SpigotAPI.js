require('dotenv').config()
const Discord = require("discord.js");
const Cron = require("croner");
const fs = require("fs")
const client = new Discord.Client({ intents: 0 });

client.on("ready", () => {
    Cron("*/30 * * * * *", sendResource);
    Cron("*/30 * * * * *", sendResourceAuthor, { context: 'Ajneb.json' });

})

async function sendResource() {
    const page = JSON.parse(fs.readFileSync("./newResources.json", "utf-8"));
    const resource = await fetch(`https://api.spigotmc.org/simple/0.2/index.php?action=listResources&page=${page.lastPage}`).then(res => res.json());
    if (!Array.isArray(resource)) return;
    const publish = resource.filter((e) => !page.ids.includes(e.id));
    for (const r of publish) {
        page.ids.push(r.id);
        const url = `https://www.spigotmc.org/resources/${r.id}/`;
        const guild = await client.guilds.fetch("982366973746901012");
        const channel = await guild.channels.fetch("982707353222807643");
        const embed = new Discord.MessageEmbed()
            .setThumbnail(r.icon_link)
            .setDescription(`**${r.title}**\n${r.tag}\n\n`)
            .addField('Autor:', `${r.author.username || "?"}`, true)
            .addField('Descargas:', `${r.stats.downloads || "?"}`, true)
            .setColor(0xb8d8ff)
        await channel.send({ embeds: [embed], content: `> **Link** ${url}`})
    }
    fs.writeFileSync("./newResources.json", JSON.stringify(page), { encoding: 'utf-8' });
    if (resource.length >= 10) {
        page.lastPage = page.lastPage + 1;
        page.ids = [];
        fs.writeFileSync("./newResources.json", JSON.stringify(page), { encoding: 'utf-8' });
        return sendResource()
    }

}

async function sendResourceAuthor(_self, name) {
    const page = JSON.parse(fs.readFileSync(`./Authors/${name}`, "utf-8"));
    const resource = await fetch(`https://api.spigotmc.org/simple/0.2/index.php?action=getResourcesByAuthor&id=${page.authorId}&&page=${page.lastPage}`).then(res => res.json());
    if (!Array.isArray(resource)) return;
    const publish = resource.filter((e) => !page.ids.includes(e.id));
    for (const r of publish) {
        page.ids.push(r.id);
        const url = `https://www.spigotmc.org/resources/${r.id}/`;
        const guild = await client.guilds.fetch("982366973746901012");
        const channel = await guild.channels.fetch(page.channelId);
        const embed = new Discord.MessageEmbed()
            .setThumbnail(r.icon_link)
            .setDescription(`**${r.title}**\n${r.tag}\n\n`)
            .addField('Autor:', `[${r.author.username || "?"}](https://www.spigotmc.org/resources/authors/${page.authorId})`, false)
            .addField('Versión:', `${r.supported_minecraft_versions || "?"}`, false)
            .addField('Descargas:', `${r.stats.downloads || "?"}`, false)
            .addField('Updates:', `${r.stats.updates || "?"}`, false)
            .addField('Clasificación:', `${r.stats.rating || "?"}✩`, false)
            .setColor(0xb8d8ff)
        await channel.send({ embeds: [embed], content: `> **Link** ${url}`})
    }
    fs.writeFileSync(`./Authors/${name}`, JSON.stringify(page), { encoding: 'utf-8' });
    if (resource.length >= 10) {
        page.lastPage = page.lastPage + 1;
        page.ids = [];
        fs.writeFileSync(`./Authors/${name}`, JSON.stringify(page), { encoding: 'utf-8' });
        return sendResourceAuthor(_self, name)
    }

}

client.login()
