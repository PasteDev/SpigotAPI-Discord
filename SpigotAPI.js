require('dotenv').config()
const Discord = require("discord.js");
const Cron = require("croner");
const fs = require("fs")
const client = new Discord.Client({ intents: 0 });

client.on("ready", () => {
    Cron("* * * * *", sendResource);
    Cron("* * * * *", sendResourceAuthor(`Ajneb.json`));

})

//Recursos recien publicados de todos los usuarios. (https://www.spigotmc.org/resources/?order=resource_date)
async function sendResource() {
    const page = JSON.parse(fs.readFileSync("./newResources.json", "utf-8"));
    const resource = await fetch(`https://api.spigotmc.org/simple/0.2/index.php?action=listResources&page=${page.lastPage}`).then(res => res.json());
    if (!Array.isArray(resource)) return;
    const publish = resource.filter((e) => !page.ids.includes(e.id));
    for (const r of publish) {
        page.ids.push(r.id);
        const url = `https://www.spigotmc.org/resources/${r.id}/`;
        const guild = await client.guilds.fetch("ID DEL SERVIDOR"); //IMPORTANTE COMPLETAR
        const channel = await guild.channels.fetch("ID DEL CANAL PARA LOS RECURSOS RECIEN PUBLICADOS"); //IMPORTANTE COMPLETAR
        const embed = new Discord.MessageEmbed()
            .setThumbnail(r.icon_link)
            .setDescription(`**${r.title}**\n\n**Stats:**\nAutor: ${r.author.username}\nDescargas: ${r.stats.downloads}\nVersión: ${r.supported_minecraft_versions}\n\n> [Enlace del Plugin!](${url})`)
            .setColor(0xb8d8ff)
        await channel.send({ embeds: [embed] })
    }
    fs.writeFileSync("./newResources.json", JSON.stringify(page), { encoding: 'utf-8' });
    if (resource.length >= 10) {
        page.lastPage = page.lastPage + 1;
        page.ids = [];
        fs.writeFileSync("./newResources.json", JSON.stringify(page), { encoding: 'utf-8' });
        return sendResource()
    }

}
//Recursos publicados de un Autor en especifico. (https://www.spigotmc.org/resources/authors/ajneb97.43796/)

async function sendResourceAuthor(_self, name) {
    const page = JSON.parse(fs.readFileSync(`./Authors/${name}`, "utf-8"));
    const resource = await fetch(`https://api.spigotmc.org/simple/0.2/index.php?action=getResourcesByAuthor&id=${page.authorId}&&page=${page.lastPage}`).then(res => res.json());
    if (!Array.isArray(resource)) return;
    const publish = resource.filter((e) => !page.ids.includes(e.id));
    for (const r of publish) {
        page.ids.push(r.id);
        const url = `https://www.spigotmc.org/resources/${r.id}/`;
        const guild = await client.guilds.fetch("ID DEL SERVIDOR DE DISCORD"); //IMPORTANTE COMPLETAR
        const channel = await guild.channels.fetch(page.channelId); //Aquí debes ir a la carpeta Authors y en el JSON de la persona en la parte de "channelId" colocas la ID del canal
        const embed = new Discord.MessageEmbed()
            .setThumbnail(r.icon_link)
            .setDescription(`**${r.title}**\n\n**Stats:**\nAutor: ${r.author.username}\nDescargas: ${r.stats.downloads}\nVersión: ${r.supported_minecraft_versions}\n\n> [Enlace del Plugin!](${url})`)
            .setColor(0xb8d8ff)
        await channel.send({ embeds: [embed] })
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