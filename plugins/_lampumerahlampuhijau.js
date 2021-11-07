let handler = m => m

handler.before = async function (m, { match }) {
    // if (match) return !1 
    //if (!m.text) return !1
    if (!m.chat.endsWith('@s.whatsapp.net')) return !0
    global.squidgame = global.squidgame ? global.squidgame : {}
    let room = Object.values(global.squidgame).find(room => room.check(m.sender) && /STOP|RUN/g.test(room.state))
    if (room) {
        let position = room.player.indexOf(room.player.find(v => v && v.sender == m.sender))
        // if (room.player[position].isFinish) return !1
        if (room.state === 'RUN') {
            room.player[position].position++
            if (room.player[position].position > room.finish) {
                for (let v of room.player) await m.reply(`Player number *${position}* is WINN!, and got *${room.reward}* XP`, v.sender)
                room.reward += room.player.filter(v => v !== m.sender).length * 1
                global.DATABASE._data.users[m.sender].exp += room.reward * 1
                await room.deleteSession()
                // room.player[position].isFinish = true
                // for (let v of room.player) await m.reply(`player number *${position}* has successfully completed the game, and only *${room.player.length}* players left`, v.sender)
            }
        }
        else {
            room.player.splice(position, 1)
            await conn.sendFile(m.sender, './src/squidGame_GLRL_Shoot.mp3', 'squidgame.mp3', '', m, true)
            await m.reply('You eliminated!')
            room.reward += 1000
            for (let v of room.player) await m.reply(`player number *${position}* is eliminated, only *${room.player.length}* players left and total prize now is *${room.reward}* XP`, v.sender)
            if (room.player.length <= 1) {
                await m.reply(`*You WIN* and got *${room.reward}* XP`, room.player[0].sender)
                global.DATABASE._data.users[m.sender].exp += room.reward * 1
                await room.deleteSession()
            }
        }
    }
    return !0
}

module.exports = handler