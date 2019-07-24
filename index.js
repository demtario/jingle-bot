const Discord = require('discord.js')
const YTDL = require('ytdl-core')

const config = require('./config')
const database = require('./database')

const client = new Discord.Client()

let cache = database.open('db.json')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if(msg.content.startsWith(config.prefix+"set ")) { // -SET
    let link = msg.content.split(' ')[1]
    let user = msg.author.tag

    // Check linku
    const regex = new RegExp(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g)
    if(!regex.test(link)) {
      msg.channel.send("Zły link pajacu do YT tylko działa!")
      return false
    }

    // Zapisywanie w db
    let item = cache.users.find((el) => el.user == user)
    if(item != null) {
      item.link = link
    } else {
      cache.users.push({
        user,
        link
      })
    }

    database.save()
    msg.channel.send("Ustawiono jingiel dla: "+msg.author.tag)


  } else if(msg.content.startsWith(config.prefix+"play ")) { // -PLAY
    let link = msg.content.split(' ')[1]
    const regex = new RegExp(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g)
    if(!regex.test(link)) {
      msg.channel.send("Zły link pajacu do YT tylko działa!")
      return false
    }

    let channelID = msg.author.lastMessage.member.voiceChannelID
    let channel = client.channels.get(channelID)
    if(channel != null) {
      channel.join().then(connection => {
        play(link, connection)
        msg.channel.send("Tera gra muzyyka")
      }).catch(e => {
        console.error(e);
      });
    } else {
      msg.channel.send("Kurłaaa ale podłącz się do kanału wpierw!")
    }
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel

  let newUser = newMember.user.tag

  if(oldUserChannel === undefined && newUserChannel !== undefined) {

    let entry = cache.users.find((el) => el.user == newUser)
    if(entry == null) return false

    let userLink = entry.link

    const channel = client.channels.get(newMember.voiceChannelID)
    channel.join().then(connection => {
      play(userLink, connection)
      setTimeout(() => {
        channel.leave()
      }, 20000)
    }).catch(e => {
      console.error(e);
    });
  }
})

const play = async (link, connection) => {
  connection.playStream(YTDL(link))
}

client.login(config.token);