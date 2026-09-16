const lessons = [
    {
        id: 1,
        title: "HTML BASICS",
        description: "Learn the structure of a basic webpage.",
        command: "/code 1"
    },
    {
        id: 2,
        title: "CSS BASICS",
        description: "Learn how to style a webpage.",
        command: "/code 2"
    },
    {
        id: 3,
        title: "JAVASCRIPT BASICS",
        description: "Learn variables, functions and logic.",
        command: "/code 3"
    },
    {
        id: 4,
        title: "NODE.JS BASICS",
        description: "Learn how JavaScript runs outside the browser.",
        command: "/code 4"
    },
    {
        id: 5,
        title: "GIT BASICS",
        description: "Learn version control and repositories.",
        command: "/code 5"
    }
];

module.exports = {
    name: "lessons",

    aliases: ["academy-lessons"],

    description: "Shows NØXIS Academy lessons.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        const lines =
            lessons.map(
                lesson =>
`${lesson.id}. 🎓 ${lesson.title}
   ${lesson.description}
   ▶️ ${lesson.command}`
            );

        await sock.sendMessage(
            jid,
            {
                text:
`🎓 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑪𝑨𝑫𝑬𝑴𝒀

━━━━━━━━━━━━━━━━━━

${lines.join("\n\n")}

━━━━━━━━━━━━━━━━━━

🧠 Learn. Build. Repeat.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
