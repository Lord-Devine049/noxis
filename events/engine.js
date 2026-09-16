const {
    getRandomQuestion,
    isCorrectAnswer
} = require("./coding");

const db =
    require("../database/database");

const achievements =
    require("../database/achievements");

const EVENT_INTERVAL =
    5 * 60 * 60 * 1000;

const CHECK_INTERVAL =
    60 * 1000;

const activeEvents =
    new Map();

let schedulerStarted =
    false;

function registerGroup(jid) {

    if (
        !jid ||
        !jid.endsWith("@g.us")
    ) {
        return;
    }

    db.registerGroup(jid);
}

async function startEvent(sock, jid) {

    if (
        !jid ||
        !jid.endsWith("@g.us")
    ) {
        return false;
    }

    if (activeEvents.has(jid)) {
        return false;
    }

    if (db.getActiveEvent(jid)) {
        return false;
    }

    const question =
        getRandomQuestion();

    const event = {
        jid,
        question,
        startedAt: Date.now()
    };

    activeEvents.set(
        jid,
        event
    );

    db.createEvent({
        type: "coding",
        groupJid: jid,
        question:
            question.question,
        answer:
            question.answers[0],
        xp: question.xp
    });

    await sock.sendMessage(
        jid,
        {
            text:
`💻 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑪𝑶𝑫𝑰𝑵𝑮 𝑪𝑯𝑨𝑳𝑳𝑬𝑵𝑮𝑬

━━━━━━━━━━━━━━━━━━

${question.question}

⚡ Difficulty: ${question.difficulty}
🏆 Reward: +${question.xp} XP

🥇 FIRST CORRECT ANSWER WINS

━━━━━━━━━━━━━━━━━━
🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
        }
    );

    return true;
}

async function checkAnswer(
    sock,
    message,
    text
) {

    const jid =
        message.key.remoteJid;

    if (
        !jid ||
        !jid.endsWith("@g.us")
    ) {
        return false;
    }

    const event =
        activeEvents.get(jid);

    if (!event) {
        return false;
    }

    if (
        !isCorrectAnswer(
            text,
            event.question
        )
    ) {
        return false;
    }

    const winnerJid =
        message.key.participant ||
        message.participant ||
        jid;

    const winnerName =
        message.pushName ||
        "NØXIS Member";

    const result =
        db.addXP(
            winnerJid,
            event.question.xp,
            "Coding Event"
        );

    const wins =
        (result.member.eventsWon || 0) + 1;

    const updatedMember =
        db.updateMember(
            winnerJid,
            {
                name: winnerName,
                eventsWon: wins
            }
        );

    const streakResult =
        db.updateStreak(
            winnerJid
        );

    const achievementResult =
        achievements.checkAchievements(
            winnerJid
        );

    activeEvents.delete(jid);

    const dbEvent =
        db.getActiveEvent(jid);

    if (dbEvent) {

        db.closeEvent(
            dbEvent.id,
            winnerJid
        );
    }

    db.scheduleNextCodingEvent(
        jid
    );

    const unlockedText =
        achievementResult.unlocked.length
            ? `\n🏅 ACHIEVEMENT UNLOCKED\n${
                achievementResult.unlocked
                    .map(
                        item =>
                            `${item.emoji} ${item.name}`
                    )
                    .join("\n")
            }\n`
            : "";

    await sock.sendMessage(
        jid,
        {
            text:
`🥇 𓊈⸸𓊉 𝑪𝑯𝑨𝑳𝑳𝑬𝑵𝑮𝑬 𝑪𝑳𝑬𝑨𝑹𝑬𝑫

👤 ${winnerName}

⚡ Earned: +${event.question.xp} XP
🏆 Total XP: ${updatedMember.xp}
🌑 Rank: ${updatedMember.rank}
🔥 Streak: ${streakResult.member.streak} day${streakResult.member.streak === 1 ? "" : "s"}
🥇 Events Won: ${updatedMember.eventsWon}

${
    result.oldRank !== result.newRank
        ? `⬆️ RANK UP!\n${result.oldRank} → ${result.newRank}\n`
        : ""
}

${unlockedText}

⏱️ Next challenge: 5 hours

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
        }
    );

    return true;
}

function startScheduler(sock) {

    if (schedulerStarted) {
        return;
    }

    schedulerStarted = true;

    const check = async () => {

        const groups =
            db.getDueCodingGroups();

        for (const group of groups) {

            try {

                const started =
                    await startEvent(
                        sock,
                        group.jid
                    );

                if (started) {

                    db.scheduleNextCodingEvent(
                        group.jid
                    );
                }

            } catch (error) {

                console.error(
                    "Background system error:",
                    error.message
                );
            }
        }
    };

    setInterval(
        check,
        CHECK_INTERVAL
    );

    check();
}

module.exports = {
    registerGroup,
    startEvent,
    checkAnswer,
    startScheduler
};
