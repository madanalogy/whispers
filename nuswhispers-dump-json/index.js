require('dotenv').config();

var fs = require('fs');
var mysql = require('mysql');
var tunnel = require('tunnel-ssh');

var tunnelConfig = {
  host: process.env.SSH_HOST || 'localhost',
  port: process.env.SSH_PORT || 2222,
  username: process.env.SSH_USER || 'vagrant',
  password: process.env.SSH_PASS || 'vagrant',
  dstPort: 3306
};

var server = tunnel(tunnelConfig, function (err, result) {
  console.log('Connected to virtual machine.');

  var connection = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: 3306,
    user: process.env.DB_USER || 'homestead',
    password: process.env.DB_PASS || 'secret',
    database: process.env.DB_NAME || 'nuswhispers'
  });

  connection.connect(function (err) {
    if (err) {
      console.error('Error connecting to MySQL database: ' + err);
      return;
    }

    console.log('Connected to MySQL database.');

    var query = connection.query("SELECT * FROM confessions WHERE (status = 'Approved' OR status = 'Featured');");
    var ws = fs.createWriteStream(process.env.DUMP_FILENAME || 'dump.json');
    var count = 0;

    ws.write('[');

    var lastRow;

    query
      .on('error', function (err) {
        console.error('Query error: ' + err);
      })
      .on('result', function (row) {
        if (lastRow) {
          ws.write(lastRow + ',');
        }

        lastRow = JSON.stringify(row);
        count++;
      })
      .on('end', function() {
        ws.write(lastRow + ']');
        ws.end();

        console.log('Completed dumping ' + count + ' rows.');
        connection.destroy();
        server.close();
      });
  });
});

server.on('error', function (err) {
  console.error('Error connecting to virtual machine: ' + err);
});
