const db = require("./database");

const ACHIEVEMENTS = {
    FIRST_EVENT: {
        id: "first_event",
        name: "FIRST BLOOD",
        description: "Win your first coding challenge.",
        emoji: "🥇"
    },

    STREAK_3: {
        id: "streak_3",
        name: "CONSISTENT",
        description: "Reach a 3-day streak.",
        emoji: "🔥"
    },

    STREAK_7: {
        id: "streak_7",
        name: "UNBREAKABLE",
        description: "Reach a 7-day streak.",
        emoji: "🔥"
    },

    XP_100: {
        id: "xp_100",
        name: "RISING",
        description: "Reach 100 XP.",
        emoji: "⚡"
    },

    XP_500: {
        id: "xp_500",
        name: "ACTIVE BUILDER",
        description: "Reach 500 XP.",
        emoji: "🏆"
    },

    EVENTS_10: {
        id: "events_10",
        name: "CHALLENGER",
        description: "Win 10 coding challenges.",
        emoji: "💻"
    }
};

function ensureAchievements(jid) {

    const member =
        db.registerMember(
            jid,
            "NØXIS Member"
        );

    if (!Array.isArray(member.achievements)) {
        member.achievements = [];
        db.updateMember(
            jid,
            {
                achievements:
                    member.achievements
            }
        );
    }

    return member;
}

function unlockAchievement(
    jid,
    achievement
) {

    const member =
        ensureAchievements(jid);

    if (
        member.achievements
            .includes(achievement.id)
    ) {
        return false;
    }

    member.achievements.push(
        achievement.id
    );

    db.updateMember(
        jid,
        {
            achievements:
                member.achievements
        }
    );

    return true;
}

function checkAchievements(jid) {

    const member =
        ensureAchievements(jid);

    const unlocked = [];

    if (
        member.eventsWon >= 1 &&
        unlockAchievement(
            jid,
            ACHIEVEMENTS.FIRST_EVENT
        )
    ) {
        unlocked.push(
            ACHIEVEMENTS.FIRST_EVENT
        );
    }

    if (
        member.streak >= 3 &&
        unlockAchievement(
            jid,
            ACHIEVEMENTS.STREAK_3
        )
    ) {
        unlocked.push(
            ACHIEVEMENTS.STREAK_3
        );
    }

    if (
        member.streak >= 7 &&
        unlockAchievement(
            jid,
            ACHIEVEMENTS.STREAK_7
        )
    ) {
        unlocked.push(
            ACHIEVEMENTS.STREAK_7
        );
    }

    if (
        member.xp >= 100 &&
        unlockAchievement(
            jid,
            ACHIEVEMENTS.XP_100
        )
    ) {
        unlocked.push(
            ACHIEVEMENTS.XP_100
        );
    }

    if (
        member.xp >= 500 &&
        unlockAchievement(
            jid,
            ACHIEVEMENTS.XP_500
        )
    ) {
        unlocked.push(
            ACHIEVEMENTS.XP_500
        );
    }

    if (
        member.eventsWon >= 10 &&
        unlockAchievement(
            jid,
            ACHIEVEMENTS.EVENTS_10
        )
    ) {
        unlocked.push(
            ACHIEVEMENTS.EVENTS_10
        );
    }

    return {
        member:
            db.getMember(jid),

        unlocked
    };
}

function getAchievements(jid) {

    const member =
        ensureAchievements(jid);

    return Object.values(
        ACHIEVEMENTS
    ).map(achievement => ({
        ...achievement,

        unlocked:
            member.achievements
                .includes(achievement.id)
    }));
}

module.exports = {
    ACHIEVEMENTS,
    checkAchievements,
    getAchievements
};
