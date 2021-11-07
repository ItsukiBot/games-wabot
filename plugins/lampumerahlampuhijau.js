let startTime = 1  // minute
let gameTime = 5
async function handler(m, { conn, usedPrefix, command, text }) {
    global.squidgame = global.squidgame ? global.squidgame : {}
    if (Object.values(global.squidgame).find(room => room.id.startsWith('lmlh') && room.check(m.sender))) return m.reply('Kamu masih didalam game')
    let room = Object.values(global.squidgame).find(room => room.id.startsWith('lmlh') && room.state === 'WAITING' && (text ? room.name === text : true))
    m.reply('[WIP Feature]')
    if (room) {
        room.player.push({ sender: m.sender, position: 0, /* isFinish: false */ })
        m.reply(`Waiting game to start. remaining time ${msToTime((room.start + (startTime * 1000 * 60)) - (new Date * 1))}.\nTotal player *${room.player.length}*`)
    } else {
        room = {
            id: 'lmlh-' + (+new Date),
            start: new Date * 1,
            player: [{
                sender: m.sender,
                position: 0,
                // isFinish: false
            }],
            state: 'WAITING',
            message: [],
            interval: undefined,
            timeout: undefined,
            reward: 0,
            finish: Math.ceil(Math.random() * 100),
            startTimeout: setTimeout(async () => {
                if (room.player.length == 1 && room.state == 'WAITING') {
                    await m.reply(`More *${startTime}* minute`, room.player[0].sender)
                    room.start = new Date * 1
                    return room.startTimeout.refresh()
                }
                room.interval = setInterval(async () => {
                    await room.deleteMessage()
                    if (room.state == 'RUN') {
                        for (let v of room.player) room.message.push(
                            m.reply('RED LIGHT!!', v.sender),
                            await conn.sendFile(v.sender, './src/squidGame_GLRL_Scan.mp3', 'squidgame.mp3', '', m, true)
                        )
                        room.state = 'STOP'
                    } else if (/STOP|WAITING/g.test(room.state)) {
                        for (let v of room.player) {
                            if (room.state == 'WAITING') await m.reply(`*Game start!!*, and target *${room.finish}* messages`, v.sender)
                            room.message.push(
                                m.reply('GREEN LIGHT!!', v.sender),
                                m.reply(`less than *${room.finish - v.position}* messages to win this game!`, v.sender),
                                await conn.sendFile(v.sender, './src/squidGame_GLRL.mp3', 'squidgame.mp3', '', m, true)
                            )
                        }
                        room.state = 'RUN'
                    }
                }, pickRandom([5, 6, 7, 8, 9]) * 1000)

                room.timeout = setTimeout(async () => {
                    for (let v of room.player) {
                        room.message.push(
                            m.reply('Timeout', v.sender),
                            await conn.sendFile(v.sender, './src/squidGame_GLRL_Shoot.mp3', 'squidgame.mp3', '', m, true)
                        )
                    }
                    await room.deleteSession()
                }, gameTime * 1000 * 60)
            }, startTime * 1000 * 60),
            /**
             * Check if player has ben join game
             * @param {String} who 
             * @returns Boolean
             */
            check: function (who = '') {
                return this.player.some(v => v.sender == who)
            },
            /**
             * delete message from `room.message`
             * @returns this | Object | any
             */
            deleteMessage: async function () {
                if (this.message.length) {
                    let message = []
                    try { message = await Promise.all(this.message) } catch { }
                    for (let m of message) {
                        if (m && !(m instanceof Promise)) await conn.deleteMessage(m.chat, m.key)
                    }
                    this.message = []
                }
                return this
            },
            /**
             * delete session 
             * @returns this | Object | any
             */
            deleteSession: async function () {
                await this.deleteMessage()
                clearInterval(this.interval)
                clearTimeout(this.startTimeout)
                clearTimeout(this.timeout)
                delete global.squidgame[this.id]
                return this
            }
        }
        if (text) room.name = text
        m.reply('Waiting partner' + (text ? `type this commmand
        ${usedPrefix}${command} ${text}` : ''))
        global.squidgame[room.id] = room
    }
}

handler.help = ['lampumerahlampuhijau', 'lmlh'].map(v => v + ' [custom room name]')
handler.tags = ['squidgame', 'rpg', 'games']
handler.command = /^(lampumerahlampuhijau|lmlh)$/

handler.private = true

module.exports = handler

function msToTime(ms) {
    ms = parseInt(ms)
    if (isNaN(ms)) return '--:--:--'
    let second = Math.floor((ms / 1000) % 60)
    let minute = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return ((hours ? `${hours} Hour(s)` : '') + (minute ? ` ${minute} Minute(s)` : '') + (second ? ` ${second} Second(s)` : ''))
}

function pickRandom(array) {
    return array[Math.round(Math.random() * array.length)]
}

// function format(...args) {
//     return require('util').format(...args)
// }