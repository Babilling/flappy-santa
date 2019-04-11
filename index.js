var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var hash = require('hash.js');
var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err)
    console.error(err.message);
  console.log('Connected to the database.');
});

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});

io.on('connection', function(socket){
  socket.started = false;
  socket.date = Date.now();
  

socket.on('register', function(pseudo, pwd){
    db.get(`SELECT count(*) as count FROM User where pseudo=?;`, [pseudo],
        function(err, rows) {
          if (err) {
            socket.emit('start', false, "Erreur interne : " + err);
            return console.log(err.message);
          }
          if (rows.count == 0){
            db.run(`INSERT INTO User(pseudo, pwd) VALUES(?,?);`, [pseudo, hash.sha256().update(pwd).digest('hex')],
              function(err) {
                if (err) return console.log(err.message);
            });
          }
          socket.emit('start', true, "");
      });
  });

socket.on('start', function(){
    socket.started = true;
    socket.date = Date.now();
	db.all(`SELECT pseudo, step from User order by step desc limit 12`, [],
    function(err, rows) {
      if (err) return console.log(err.message);
      socket.emit("leaderboard", rows);
  });
  });

  socket.on('step', function(pseudo, pwd, step){

    if (socket.started && (Date.now() - socket.date) > (step / 2)){
        var dateNow = Date.now();
	  var d = Date(dateNow);
	  a = d.toString()
      console.log(a + " Game over for " + pseudo + " : " + step + " step(s) (Game time = " + millisToMinutesAndSeconds((Date.now() - socket.date)) + ")");
      socket.started = false;
      db.run(`INSERT INTO User(pseudo, pwd, step, hstime) VALUES(?,?,?,?) ON CONFLICT(pseudo) DO UPDATE SET step=?, hstime=? WHERE step<?;`, [pseudo, hash.sha256().update(pwd).digest('hex'), step, dateNow, step, dateNow, step],
          function(err) {
            if (err) return console.log(err.message);
        });
      db.all(`SELECT pseudo, step from User order by step desc, hstime limit 12;`, [],
        function(err, rows) {
          if (err) return console.log(err.message);
          socket.emit("leaderboard", rows);
      });
    }
    else console.log(pseudo + " is trying to hack the app");
  });
});

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}
