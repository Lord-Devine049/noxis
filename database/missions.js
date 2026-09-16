const db = require("./database");

const MISSIONS = [
    {
        id: "daily_chat",
        name: "NETWORK ACTIVE",
        description: "Send a message in a NØXIS group.",
        xp: 10
    },
    {
        id: "daily_profile",
        name: "KNOW YOURSELF",
        description: "Check your NØXIS profile.",
        xp: 10
    },
    {
        id: "daily_streak",
        name: "KEEP THE FIRE",
        description: "Maintain your daily streak.",
        xp: 15
    }
];

function getToday() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

function getMemberMissions(jid) {

    const member =
        db.registerMember(
            jid,
            "NØXIS Member"
        );

    const today =
        getToday();

    if (
        member.missionsDate !== today
    ) {

        member.missionsDate = today;
        member.missions = {};

        db.updateMember(jid, {
            missionsDate: today,
            missions: {}
        });
    }

    return member;
}

function completeMission(
    jid,
    missionId
) {

    const member =
        getMemberMissions(jid);

    const mission =
        MISSIONS.find(
            item =>
                item.id === missionId
        );

    if (!mission) {
        return null;
    }

    if (
        member.missions &&
        member.missions[missionId]
    ) {
        return {
            completed: false,
            mission,
            member
        };
    }

    const result =
        db.addXP(
            jid,
            mission.xp,
            `Mission: ${mission.name}`
        );

    member.missions[missionId] = true;

    db.updateMember(jid, {
        missions: member.missions
    });

    return {
        completed: true,
        mission,
        member: result.member
    };
}

function getMissions(jid) {

    const member =
        getMemberMissions(jid);

    return MISSIONS.map(
        mission => ({
            ...mission,
            completed:
                !!member.missions?.[
                    mission.id
                ]
        })
    );
}

module.exports = {
    MISSIONS,
    getMissions,
    completeMission
};
