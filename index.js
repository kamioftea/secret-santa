var handlebars = require('handlebars');
var fs = require('fs');
var nodemailer = require('nodemailer');
var shuffle = require('shuffle-array');
var _ = require('highland');

var config = require('./config.js');

var userFileStream = fs.createReadStream('emails.list');
var templateFileStream = fs.createReadStream('email.hbs');

var transporter = nodemailer.createTransport(config.email.transport);

// Given an array of {name, email} and a string representing the template,
//  - shuffle the users, copy to recipients, rotate recipients and zip together to form a 
//    closed loop. 
//  - zip user and recipient together and compile into emails using the template
//  - return a stream of emails {from, to, subject, body}
function buildEmails([users, template]) {
    shuffle(users);
    
    var recipients = users.slice(); //clone;
    recipients.push(recipients.shift()); // rotate;

    return _(users)
        .zip(_(recipients))
        .map(([gifter, giftee]) => ({
            from:    config.email.from,
            to:      gifter.email,
            subject: config.email.subject,
            text:    template({gifter: gifter, giftee: giftee})
        }));
}

// Given an email {from, to, subject, body} send it
function sendEmail(email) {
	if(config.dryRun)
	{
		console.log(email);
		return;
	}
	
    transporter.sendMail(email, (err, info) => {
        if(err) console.log(err);
    });
}

// Build the users.lists file into {name, email} and collect into an array we can shuffle
var usersStream = _(userFileStream)
        .split()
        .map(row => row.match(/^([^<]+)<([^>]+)>$/))
        .compact() // Strip out lines that don't match
        .map(([,name,email]) => ({
                name:  name.trim(),
                email: email.trim()
        }))
        .collect();

// Convert the template file into a handlebars template
//
// It should be possible to just wait for the whole file, but this will do:
//  - load the file into lines (which does the string building)
//  - collect the resulting array
//  - join into a single string with newlines
//  - compile the resulting string into a handlebars template
var templateStream = _(templateFileStream)
    .split()
    .collect()
    .map(lines => lines.join("\n"))
    .map(template => handlebars.compile(template));

// Zip the two input streams together so that value will only be emitted once both have completed.
usersStream.zip(templateStream)
    .map(buildEmails)
    .sequence()
    .each(sendEmail);
