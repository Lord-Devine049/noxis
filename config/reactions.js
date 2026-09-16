const reactions = {

    /*
     * CORE
     */

    menu: "⚡",
    ping: "🏓",


    /*
     * ADMIN / MODERATION
     */

    admin: "🛡️",
    staff: "👑",
    sudo: "🔐",

    kick: "🩸",
    promote: "👑",
    demote: "🛡️",

    warn: "⚠️",
    warnings: "⚠️",

    mute: "🔇",
    unmute: "🔊",
    muted: "🔇",


    /*
     * GROUP AUTOMATION
     */

    settings: "⚙️",
    group: "🛡️",
    grouphelp: "📋",


    /*
     * MEMBER
     */

    profile: "👤",
    rank: "🏆",
    xp: "✨",
    streak: "🔥",
    achievements: "🏅",
    leaderboard: "📊",


    /*
     * MISSIONS
     */

    tasks: "📋",
    done: "✅",
    missions: "🎯",
    progress: "📈",


    /*
     * ACADEMY
     */

    academy: "🎓",
    lessons: "📚",
    code: "💻",
    dailycode: "🧠",
    quiz: "❓",


    /*
     * GAMING
     */

    gaming: "🎮",
    challenge: "⚔️",
    team: "👥",
    tournament: "🏆",


    /*
     * MEDIA
     */

    media: "🎨",
    showcase: "🖼️",
    submit: "📤",
    gallery: "🖼️",


    /*
     * ANIME
     */

    anime: "🩸",
    manga: "📖",
    amv: "🎬",


    /*
     * COMMUNITY
     */

    noxis: "🌑",
    rules: "📜",
    news: "📰",
    events: "📅",
    links: "🔗"

};


function getReaction(command) {

    return reactions[
        String(command || "")
            .toLowerCase()
    ] || "🌑";

}


module.exports = {
    getReaction
};
