Secret Santa Assigner
=====================

Emails a list of people with a random assignment of another user in
the same list. Useful for setting up a secret santa scheme. The current
version is a bit rough and ready - needs tests and better error handling.

Config
------

Two files need to be created: `config.json` should contain relevant
values for each field, transport should contain a valid [Nodemailer
Transport](https://github.com/andris9/Nodemailer#setting-up)

`emails.list` should contain a list of emails in the format `Name <email>`
e.g.

    Joe Bloggs <joe@example.org>
    Santa <santa@north.pole>

Blank/invalid lines are silently ignored.

`email.hbs` is the handlebars template used to compile the email.

Usage
-----

index.js is written using ES2015. `npm run compile` will use babel to
transpile `index.js` to `secret-santa`, prepend `#!/usr/bin/env node`,
and make it executable (at least it will on linux).

`./secret-santa` will then send the emails.

`./secret-santa --dry-run` will log the email objects to the console and 
will not send them.

`babel-node index.js` can be substituted for `./secret-santa` but will 
be slow due to needing to recompile before running.

