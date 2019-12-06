"use strict";

const Discord = require('discord.io');
const Log = require('winston');
const auth = require('./auth.json');
const fs = require('fs');

Log.add(new Log.transports.Console, { colorize: true });
Log.level = 'debug';

const calculateDays = (date1, date2) => {
	const timeDifference = date1.getTime() - date2.getTime();
	const daysDifference = Math.floor(Math.abs(timeDifference / (24 * 60 * 60 * 1000)));

	return daysDifference;
}

const bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

bot.updateDate = function (date, user) {
	this.savedDate = date;
	fs.writeFile('DateTime.txt', this.savedDate.toString(), function (err) {
		if (err) {
			Log.error(`Could not update date when writing to file: ${err}`)
			process.exit(1);
		}
		Log.info(`Changed date to ${this.savedDate} by ${user.username}#${user.discriminator}`)
	}.bind(this));
}

bot.on('ready', function () {
	Log.info('Connected');
	Log.info('Logged in as: ');
	Log.info(this.username + ' - (' + this.id + ')');

	fs.readFile('DateTime.txt', 'utf8', function (err, contents) {
		if (err) {
			Log.error("could not open DateTime.txt", err)
			process.exit(1);
		}

		this.savedDate = new Date(Date.parse(contents))
		Log.info(`Loaded date ${this.savedDate}`)
	}.bind(this))
});

bot.on('message', function (user, userID, channelID, message, evt) {
	debugger
	if (message.substring(0, 1) !== '!') {
		return
	}

	let days, word;

	let args = message.substring(1).split(' ');
	const cmd = args[0];
	args = args.splice(1);

	switch (cmd) {
		case 'time':
			days = calculateDays(this.savedDate, new Date());
			word = days !== 1 ? "days" : "day";
			bot.sendMessage({
				to: channelID,
				message: `${days} ${word}`
			})

			return;

		case 'fgt1':  // resetdate
			bot.updateDate(new Date(), evt.d.author);
			bot.sendMessage({
				to: channelID,
				message: 'OK, Date reset'
			})

			return;

		case 'fgt2': // setsefte
			// accepted format of cmd is `setsefte 24 12 2020` - spaces between numbers
			if (args.length !== 3) {
				return
			}
			const [dd, mm, yyyy] = args.map(s => Number.parseInt(s));
			const input = Date.parse(`${yyyy}-${mm}-${dd}`);
			if (!input) {
				return;
			}

			const inputDate = new Date(input);
			if (inputDate.getTime() > new Date().getTime()) {
				bot.sendMessage({
					to: channelID,
					message: 'tva e v budeshteto e DIBIL'
				});
				return;
			}

			days = calculateDays(inputDate, new Date());
			word = days !== 1 ? "days" : "day";

			bot.sendMessage({
				to: channelID,
				message: `${days} ${word} since last L4D2`
			});
			bot.updateDate(inputDate, evt.d.author);
			return;

		default:
			// unrecognised command, do nothing
			return;
	}
});
