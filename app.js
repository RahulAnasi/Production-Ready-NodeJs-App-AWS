const http = require('http');
const mysql = require('mysql2');

// DB connection
const connection = mysql.createConnection({
  host: 'database-2.c5oqk08mi0us.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Admin10906',
  database: 'aws-devops-app-db'
});

// Connect to DB
connection.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('Connected to DB');
});

// Create table if not exists
connection.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255)
  )
`);

// Create server
const server = http.createServer((req, res) => {

  // Insert message
  connection.query(
    "INSERT INTO messages (text) VALUES ('Our app is now connected to the db. More to come!')"
  );

  // Fetch messages
  connection.query(
    "SELECT * FROM messages",
    (err, results) => {
      if (err) {
        res.end('Error fetching data');
        return;
      }

      res.end(JSON.stringify(results));
    }
  );
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
