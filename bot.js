var Discord = require('discord.io');
var logger = require('winston');
var current = new Date();
var auth = require('./auth.json');
var datetemp;
var fs = require('fs');
var firstDate = new Date();


logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function(user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var oneDay = 24 * 60 * 60 * 1000;
        args = args.splice(1);
        switch (cmd) {
            case 'time':
                fs.readFile('DateTime.txt', 'utf8', function(err, contents) {
                    datetemp = contents
                    firstDate = new Date(Date.parse(datetemp))
                    // console.log(firstDate.getTime())

                    var diffDays = Math.round(Math.abs((current.getTime() - firstDate.getTime()) / (oneDay)));
                    bot.sendMessage({
                        to: channelID,
                        message: diffDays.toString() + ' days'
                    })
                })
                break;
            case 'resetdate':
                firstDate = new Date();
                fs.writeFile('DateTime.txt', firstDate.toString(), function(err) {
                    if (err) throw err
                    console.log('Saved')
                });
                bot.sendMessage({
                    to: channelID,
                    message: 'Date reset'
                })
                break;
            case 'setsefte':
                var month = args[1];
                month--;
                tempdate = new Date(args[2], month, args[0]);
                if (tempdate.getTime() > new Date().getTime()) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'tva e v budeshteto e DIBIL'
                    })
                    break;
                } else
                    firstDate = new Date(args[2], month, args[0]);
                var diffDays = Math.round(Math.round((current.getTime() - firstDate.getTime()) / (oneDay)));
                if (diffDays >= 0)
                    bot.sendMessage({
                        to: channelID,
                        message: diffDays.toString() + ' days since last L4D2'
                    })
                fs.writeFile('DateTime.txt', firstDate.toString(), function(err) {
                    if (err) throw err;
                    console.log('Saved');
                });
        }
    }
});
