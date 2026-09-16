const lessons = {
    1: {
        title: "HTML BASICS",
        text:
`🎓 𝑳𝑬𝑺𝑺𝑶𝑵 1 — HTML BASICS

HTML creates the structure of a webpage.

Example:

<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>

<body>
    <h1>Hello World!</h1>
    <p>My name is YOUR NAME.</p>
</body>
</html>

🧠 Key idea:
HTML = Structure

🏆 Challenge:
Create a webpage with:
• Your name
• A heading
• A paragraph
• A button

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
    },

    2: {
        title: "CSS BASICS",
        text:
`🎨 𝑳𝑬𝑺𝑺𝑶𝑵 2 — CSS BASICS

CSS controls how a webpage looks.

Example:

body {
    background: black;
    color: white;
}

h1 {
    font-size: 40px;
}

🧠 Key idea:
CSS = Design

🏆 Challenge:
Create a dark webpage with:
• A colored heading
• Styled paragraph
• Custom button

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
    },

    3: {
        title: "JAVASCRIPT BASICS",
        text:
`⚡ 𝑳𝑬𝑺𝑺𝑶𝑵 3 — JAVASCRIPT BASICS

JavaScript adds logic and interaction.

Example:

const name = "NØXIS";

console.log(name);

🧠 Key idea:
JavaScript = Logic

🏆 Challenge:
Create a variable containing your name
and print it to the console.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
    },

    4: {
        title: "NODE.JS BASICS",
        text:
`🟢 𝑳𝑬𝑺𝑺𝑶𝑵 4 — NODE.JS BASICS

Node.js lets JavaScript run outside
the browser.

Example:

console.log("NØXIS ONLINE");

Run it with:

node index.js

🧠 Key idea:
Node.js = JavaScript runtime

🏆 Challenge:
Create index.js and make it print:

NØXIS ONLINE

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
    },

    5: {
        title: "GIT BASICS",
        text:
`🐙 𝑳𝑬𝑺𝑺𝑶𝑵 5 — GIT BASICS

Git tracks changes in your project.

Useful commands:

git status
git add .
git commit -m "Update"
git push

🧠 Key idea:
Git = Version control

🏆 Challenge:
Create a Git repository,
make a change, commit it,
and check its status.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
    }
};

module.exports = {
    name: "code",
    aliases: ["lesson"],

    description: "Opens an NØXIS Academy lesson.",

    async execute({ sock, message, args }) {

        const jid =
            message.key.remoteJid;

        const id =
            Number(args[0]);

        if (!lessons[id]) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🎓 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑪𝑨𝑫𝑬𝑴𝒀

Choose a lesson:

/code 1 — HTML
/code 2 — CSS
/code 3 — JavaScript
/code 4 — Node.js
/code 5 — Git

Use /lessons to see the full academy.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        await sock.sendMessage(
            jid,
            {
                text: lessons[id].text
            }
        );
    }
};
