const fs = require("fs");
const path = require("path");

const databasePath =
    path.join(__dirname, "noxis.json");

const defaultData = {
    members: {},
    groups: {},
    events: [],
    answers: []
};

if (!fs.existsSync(databasePath)) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(
            defaultData,
            null,
            2
        )
    );
}

function loadDatabase() {

    try {

        return JSON.parse(
            fs.readFileSync(
                databasePath,
                "utf8"
            )
        );

    } catch {

        return JSON.parse(
            JSON.stringify(defaultData)
        );
    }
}

let data = loadDatabase();

data.members ||= {};
data.groups ||= {};
data.events ||= [];
data.answers ||= [];

function saveDatabase() {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(
            data,
            null,
            2
        )
    );
}

function getRank(xp) {

    if (xp >= 5000) return "COUNCIL";
    if (xp >= 3000) return "VETERAN";
    if (xp >= 2000) return "ELITE";
    if (xp >= 1000) return "BUILDER";
    if (xp >= 500) return "ACTIVE";
    if (xp >= 100) return "MEMBER";

    return "RECRUIT";
}

function getNextRank(xp) {

    if (xp < 100) {
        return {
            name: "MEMBER",
            xp: 100
        };
    }

    if (xp < 500) {
        return {
            name: "ACTIVE",
            xp: 500
        };
    }

    if (xp < 1000) {
        return {
            name: "BUILDER",
            xp: 1000
        };
    }

    if (xp < 2000) {
        return {
            name: "ELITE",
            xp: 2000
        };
    }

    if (xp < 3000) {
        return {
            name: "VETERAN",
            xp: 3000
        };
    }

    if (xp < 5000) {
        return {
            name: "COUNCIL",
            xp: 5000
        };
    }

    return {
        name: "MAX",
        xp: 5000
    };
}

function getRankProgress(xp) {

    const next =
        getNextRank(xp);

    if (next.name === "MAX") {

        return {
            current: xp,
            required: 5000,
            remaining: 0,
            percent: 100
        };
    }

    const remaining =
        Math.max(
            0,
            next.xp - xp
        );

    const percent =
        Math.min(
            100,
            Math.floor(
                (xp / next.xp) * 100
            )
        );

    return {
        current: xp,
        required: next.xp,
        remaining,
        percent
    };
}

function registerMember(
    jid,
    name
) {

    if (data.members[jid]) {

        if (
            name &&
            name !== "NØXIS Member"
        ) {

            data.members[jid].name =
                name;

            saveDatabase();
        }

        return data.members[jid];
    }

    data.members[jid] = {

        jid,

        name:
            name ||
            "NØXIS Member",

        xp: 0,

        rank: "RECRUIT",

        streak: 0,

        lastStreakDate: null,

        eventsWon: 0,

        achievements: [],

        registeredAt:
            new Date().toISOString(),

        lastActive: null
    };

    saveDatabase();

    return data.members[jid];
}

function getMember(jid) {

    return data.members[jid] ||
        null;
}

function updateMember(
    jid,
    changes
) {

    if (!data.members[jid]) {

        registerMember(
            jid,
            "NØXIS Member"
        );
    }

    Object.assign(
        data.members[jid],
        changes
    );

    saveDatabase();

    return data.members[jid];
}

function addXP(
    jid,
    amount,
    reason = "Activity"
) {

    if (!data.members[jid]) {

        registerMember(
            jid,
            "NØXIS Member"
        );
    }

    const member =
        data.members[jid];

    const oldRank =
        member.rank;

    member.xp += amount;

    member.rank =
        getRank(member.xp);

    member.lastActive =
        new Date().toISOString();

    data.answers.push({

        jid,

        amount,

        reason,

        timestamp:
            new Date().toISOString()
    });

    saveDatabase();

    return {

        member,

        oldRank,

        newRank:
            member.rank
    };
}

/*
 * Persistent daily streak.
 *
 * Returns:
 * {
 *   member,
 *   changed,
 *   streak,
 *   status
 * }
 */

function updateStreak(jid) {

    if (!data.members[jid]) {

        registerMember(
            jid,
            "NØXIS Member"
        );
    }

    const member =
        data.members[jid];

    const now =
        new Date();

    const today =
        now.toISOString()
            .slice(0, 10);

    const previous =
        member.lastStreakDate ||
        null;

    if (previous === today) {

        return {

            member,

            changed: false,

            streak:
                member.streak || 0,

            status:
                "already-counted"
        };
    }

    if (!previous) {

        member.streak = 1;

    } else {

        const previousDate =
            new Date(
                `${previous}T00:00:00Z`
            );

        const todayDate =
            new Date(
                `${today}T00:00:00Z`
            );

        const difference =
            Math.floor(
                (
                    todayDate -
                    previousDate
                ) /
                86400000
            );

        if (difference === 1) {

            member.streak =
                (member.streak || 0) + 1;

        } else {

            member.streak = 1;
        }
    }

    member.lastStreakDate =
        today;

    member.lastActive =
        now.toISOString();

    saveDatabase();

    return {

        member,

        changed: true,

        streak:
            member.streak,

        status:
            previous
                ? "updated"
                : "started"
    };
}

function leaderboard(
    limit = 10
) {

    return Object.values(
        data.members
    )
        .sort(
            (a, b) =>
                b.xp - a.xp
        )
        .slice(0, limit);
}

function registerGroup(
    jid,
    name = "NØXIS Group"
) {

    if (
        !jid ||
        !jid.endsWith("@g.us")
    ) {
        return null;
    }

    if (!data.groups[jid]) {

        data.groups[jid] = {

            jid,

            name,

            joinedAt:
                new Date()
                    .toISOString(),

            lastSeen:
                new Date()
                    .toISOString(),

            nextCodingEventAt:
                Date.now() +
                (
                    5 *
                    60 *
                    60 *
                    1000
                )
        };

    } else {

        data.groups[jid].lastSeen =
            new Date()
                .toISOString();

        if (
            name &&
            name !== "NØXIS Group"
        ) {

            data.groups[jid].name =
                name;
        }

        if (
            !data.groups[jid]
                .nextCodingEventAt
        ) {

            data.groups[jid]
                .nextCodingEventAt =
                Date.now() +
                (
                    5 *
                    60 *
                    60 *
                    1000
                );
        }
    }

    saveDatabase();

    return data.groups[jid];
}

function getGroups() {

    return Object.values(
        data.groups
    );
}

function scheduleNextCodingEvent(
    jid
) {

    if (!data.groups[jid]) {

        registerGroup(jid);
    }

    data.groups[jid]
        .nextCodingEventAt =
        Date.now() +
        (
            5 *
            60 *
            60 *
            1000
        );

    saveDatabase();

    return data.groups[jid]
        .nextCodingEventAt;
}

function getDueCodingGroups() {

    const now =
        Date.now();

    return Object.values(
        data.groups
    )
        .filter(
            group =>
                group.nextCodingEventAt &&
                group.nextCodingEventAt <= now
        );
}

function createEvent(event) {

    const newEvent = {

        id:
            Date.now().toString(),

        ...event,

        active: true,

        startedAt:
            new Date()
                .toISOString(),

        winnerJid: null
    };

    data.events.push(
        newEvent
    );

    saveDatabase();

    return newEvent;
}

function getActiveEvent(
    groupJid = null
) {

    return data.events.find(
        event =>
            event.active === true &&
            (
                !groupJid ||
                event.groupJid === groupJid
            )
    ) || null;
}

function closeEvent(
    eventId,
    winnerJid = null
) {

    const event =
        data.events.find(
            event =>
                event.id === eventId
        );

    if (!event) {
        return null;
    }

    event.active = false;

    event.winnerJid =
        winnerJid;

    event.endedAt =
        new Date()
            .toISOString();

    saveDatabase();

    return event;
}

module.exports = {

    getRank,

    getNextRank,

    getRankProgress,

    registerMember,

    getMember,

    updateMember,

    addXP,

    updateStreak,

    leaderboard,

    registerGroup,

    getGroups,

    scheduleNextCodingEvent,

    getDueCodingGroups,

    createEvent,

    getActiveEvent,

    closeEvent
};
