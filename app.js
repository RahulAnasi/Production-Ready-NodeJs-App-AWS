const http = require('http');
const mysql = require('mysql2');
const redis = require('redis');

console.log("Starting app...");

// Redis client
const redisClient = redis.createClient({
  socket: {
    host: 'master.aws-devops-app-cache-cluster.6nzr6z.eun1.cache.amazonaws.com:6379',
    port: 6379
  }
});

redisClient.connect().then(() => {
  console.log("✅ Connected to Redis");
}).catch(err => {
  console.error("❌ Redis connection failed:", err);
});

// MySQL connection
const connection = mysql.createConnection({
  host: 'database-2.c5oqk08mi0us.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Admin10906'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err);
    return;
  }
  console.log('✅ Connected to DB');

  connection.query("CREATE DATABASE IF NOT EXISTS devopsdb");
  connection.query("USE devopsdb");

  connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text VARCHAR(255)
    )
  `);
});

// Server
const server = http.createServer(async (req, res) => {

  try {
    // 1. Check cache
    const cached = await redisClient.get("messages");

    if (cached) {
      console.log("⚡ Serving from Redis cache");
      res.end(cached);
      return;
    }

    console.log("📦 Fetching from DB");

    // 2. Fetch from DB
    connection.query(
      "SELECT * FROM messages",
      async (err, results) => {
        if (err) {
          res.end("DB error");
          return;
        }

        const data = JSON.stringify(results);

        // 3. Store in Redis
        await redisClient.set("messages", data, {
          EX: 10 // expires in 10 seconds
        });

        res.end(data);
      }
    );

  } catch (error) {
    console.error(error);
    res.end("Error");
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
