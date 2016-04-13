# dota2afk

 - How many of your matches had an AFK in any of the teams?
 - How many had an AFK in your team?
 - And in the enemy team?
 - How many of those matches you won?

Well, now you can know :D

## How to use it
### Requirements
You need **Node.js** and a database. I'm using Sequelize, so you should be able to run this code with **PostgreSQL, MySQL, MariaDB, SQLite or MSSQL**.  
You will need an API key to query the Dota 2 API: http://steamcommunity.com/dev/apikey

### Config
Edit *config.json* and enter your API key and database credentials.
Run `npm install` to install dependencies.

### Usage
First you have to parse some matches. So, get your Steam Account ID (for example: *147178957*), and run:  
`node parser.js 147178957`

After the parser has finished parsing matches, you can run:  
`node stats.js 147178957`

That will show you something like this:
```
Account ID 147178957
Total matches analyzed: 499
Total matches with at least one afk (in any of the teams or both): 69
Matches with afks only in your team: 20
        You won: 4 of those games
Matches with afks only in the enemy team: 49
        You won: 42 of those games
```

### Limitations
 - Only the last 500 matches are analyzed. This is a Dota 2 API limitation. There are workarounds, but add complexity and I don't think it is that important right now.
 - Match type (All pick, draft...) is parsed and stored, but currently ignored in stats. 
