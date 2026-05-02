# Scalable DevOps Architecture on AWS (Node.js + ECS)

This project demonstrates how to design, build, and deploy a containerized Node.js application using a complete DevOps workflow and AWS cloud infrastructure.

It starts from a simple Node.js application and evolves into a fully containerized, automated, and cloud-deployed architecture.

---

## Problem Statement

Traditional backend applications are often:

* Hard to scale
* Manually deployed
* Difficult to maintain across environments

This project solves that by building a system that is:

* Containerized
* Automatically deployed (CI/CD)
* Scalable and cloud-native
* Production-oriented architecture

---

## Architecture Overview


The system is designed to handle incoming traffic, process requests via containerized services, and efficiently manage data using a database and caching layer.

<img width="827" height="527" alt="image" src="https://github.com/user-attachments/assets/28dcdf26-cd99-47aa-9a51-fc2c5c276aab" />

---

## CI/CD Pipeline

Code changes are automatically built and deployed using a CI/CD pipeline:

GitHub → GitHub Actions → Amazon ECR → Amazon ECS

* Code push triggers pipeline
* Docker image is built and pushed to ECR
* ECS service updates automatically (rolling deployment)

---

## Tech Stack

### Application Layer

* Node.js (HTTP module)
* MySQL (`mysql2`)

### DevOps & Cloud

* Docker → Containerization
* Amazon ECS → Container orchestration
* Amazon ECR → Container registry
* GitHub Actions → CI/CD automation
* Amazon RDS → Managed database
* Amazon ElastiCache (Redis) → Caching layer
* Application Load Balancer → Traffic distribution

---

## Key Features

* Containerized backend application using Docker
* Automated CI/CD pipeline (GitHub Actions → ECS)
* Scalable deployment using ECS services
* Load balancing using ALB
* Managed database with Aurora
* Performance optimization using Redis caching

---

## Project Structure

```
├── .github/
│   └── workflows/
├── .gitignore
├── Dockerfile
├── README.md
├── app.js
├── package.json
└── package-lock.json
```

# Phase 1: Application & Containerization

  Goal

Build a simple Node.js application and containerize it using Docker so it can run consistently across environments.

  Step 1: Create a Simple Node.js App

  What we did
      1) Created a basic HTTP server using Node.js
      2) Verified that the app runs locally

  Commands
```
mkdir aws-devops-project
cd aws-devops-project

npm init -y
```

Create application file:

```
nano app.js
```

Paste the following code:
```

const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Welcome to my Devops project');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

Run the application:
```
node app.js
```

Access in browser:

http://localhost:3000

  Step 2: Dockerize the Application

  What we did
Created a Dockerfile
Built a Docker image
Ran the container locally

  Commands

Create Dockerfile:

```
nano Dockerfile
```

Paste:

```
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

Build Docker image:
```

docker build -t aws-devops-app .

```

Run container:
```
docker run -p 3000:3000 aws-devops-app
```
Access in browser:
```
http://localhost:3000
```

  Outcome
Node.js application successfully created
Application runs locally on port 3000
Docker image built and containerized successfully
Application runs inside a container

  Key Learning
How to build a basic backend service
How Docker packages an application with its dependencies
Why containerization is important for consistency across environments

---

## Phase 2: Push Docker Image to AWS & Deploy with ECS

###   Goal

Push the Docker image to a cloud registry and run the application as a live container using a managed service.

---

##   Step 1: Push Docker Image to Amazon ECR

###   What we did

* Created a private container registry
* Authenticated Docker with AWS
* Tagged and pushed the image

---

###   Commands

Configure AWS CLI:

aws configure


Login to ECR:

aws ecr get-login-password --region <region> \
| docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

Tag Docker image:

docker tag aws-devops-app:latest <ECR-URL>:latest

Push image to ECR:

docker push <ECR-URL>:latest

---

###   Outcome

* Docker image successfully stored in Amazon ECR
* Image available for deployment in ECS

---

##   Step 2: Deploy Application using ECS (Fargate)

###   What we did

* Created ECS cluster using Fargate
* Defined a task to run the container
* Deployed a service to keep the app running

---

###   Configuration (Console Steps)

#### 1. Create ECS Cluster

* Launch type: Fargate
* Cluster name: `aws-devops-app-clus`

---

#### 2. Create Task Definition

* Launch type: Fargate
* Task name: `aws-devops-app-task`
* CPU: 0.25 vCPU
* Memory: 0.5 GB

---

#### 3. Add Container

* Container name: `aws-devops-app-container`
* Image: `<your ECR image URL>`
* Port: `3000`

---

#### 4. Create Service

* Cluster: `aws-devops-app-clus`
* Launch type: Fargate
* Service name: `aws-devops-service`
* Number of tasks: `1`

---

###   Networking Setup

* VPC: Default VPC
* Subnets: All available
* Auto-assign Public IP:   Enabled
* Security Group:

  * Allow inbound traffic on port `3000`

---

##   Access the Application

1. Go to ECS → Cluster → Tasks
2. Open running task
3. Copy Public IP

Access in browser:

http://<public-ip>:3000

---

##   Outcome

* Application successfully deployed on AWS
* Container running via ECS Fargate
* Publicly accessible using task IP

---

##   Key Learning

* How container images are stored in ECR
* How ECS runs containers without managing servers
* Difference between **Task** and **Service**
* Basics of cloud networking (VPC, subnets, security groups)

---

##   Phase 3: Load Balancing with ALB

###   Goal

Improve application accessibility and scalability by introducing a load balancer instead of directly exposing containers.

---

## Problem (Before)

Initial architecture:

User → ECS Container

Limitations:

* No load distribution
* No fault tolerance
* Direct exposure of container IP
* Not scalable

---

##   Solution (After)

Updated architecture:

User → Application Load Balancer → ECS (Containers)

---

##   Step: Add Application Load Balancer

###   What we did

* Created an Application Load Balancer (ALB)
* Attached it to ECS service
* Routed incoming traffic to containers

---

### Important Note

Existing ECS services **cannot be directly modified** to attach an ALB.

  Solution:

* Created a **new ECS service**
* Configured it with ALB during setup

---

###  Configuration Steps (Console)

#### 1. Create ALB

* Go to EC2 → Load Balancers
* Create **Application Load Balancer**
* Scheme: Internet-facing
* Listener: HTTP (port 80)

---

#### 2. Create Target Group

* Target type: IP
* Port: 3000
* Health check path: `/`

---

#### 3. Create New ECS Service (with ALB)

While creating service:

* Load balancer type: Application Load Balancer
* Select created ALB
* Listener: HTTP (port 80)
* Target group: select created target group
* Container port: 3000

---

## Access the Application

1. Go to EC2 → Load Balancers
2. Select your ALB
3. Copy **DNS name**

Access in browser:

```
http://<ALB-DNS-name>
```

---

## Outcome

* Application is now accessible via ALB
* Traffic is routed to ECS containers
* Improved scalability and availability
* Removed dependency on public IP

---

## Key Learning

* Why load balancers are essential in production systems
* Difference between direct access vs load-balanced access
* How ECS integrates with ALB using target groups
* Basic traffic routing in cloud environments

## Important Fix: Expose App to External Traffic

### Problem

The application was not accessible when deployed in containers behind a load balancer.

---

### Root Cause

Original code:

```
server.listen(3000, () => {
```

By default, Node.js may bind to:

```text
127.0.0.1 (localhost)
```

This means:

* App only accepts requests from inside the container
* External traffic (ALB → ECS) cannot reach it 

---

### Solution

Update the server to listen on all network interfaces:

```
server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
```

---

### Why This Works

* `0.0.0.0` = listen on all interfaces
* Allows external traffic to reach the container
* Required for containerized and cloud deployments

---

### Outcome

* Application became accessible via ALB
* External users can now reach the service
* Fixed a common container networking issue

---

### Key Learning

* Difference between `localhost` and `0.0.0.0`
* Why containerized apps must listen on all interfaces
* Common deployment issue in Docker/ECS environments

## 📈 Phase 4: Auto Scaling ECS Service

### Goal

Enable the system to automatically handle traffic by scaling the number of running containers up or down.

---

## Problem (Before)

* ECS service was running **only 1 task**
* Could not handle increased traffic
* No cost optimization (always fixed capacity)

---

## Solution

Implemented **Auto Scaling** at the ECS service level.

---

## Step 1: Configure Scaling Limits

### What we did

Defined minimum, desired, and maximum number of tasks.

### Configuration

* Minimum tasks: `1`
* Desired tasks: `1`
* Maximum tasks: `3`

---

## Step 2: Add Scaling Policy

### What we did

Configured a **Target Tracking Scaling Policy** based on CPU usage.

---

### Configuration

* Policy type: Target Tracking
* Metric: ECS Service Average CPU Utilization
* Target value: `50%`

---

## How Target Tracking Works

* If CPU > 50% → ECS adds more tasks
* If CPU ≤ 50% → ECS reduces tasks

The system automatically tries to maintain CPU around the target value.

---

## Cooldown Periods (Important Concept)

### Why cooldown exists

After scaling, ECS waits before making another decision to avoid unnecessary scaling.

---

### Types of cooldown

**Scale-out cooldown**

* After adding tasks → wait before adding more

**Scale-in cooldown**

* After removing tasks → wait before removing more

---

## Alternative: Step Scaling (Concept)

Instead of automatic adjustment, scaling can be defined manually:

* CPU > 60% → add 1 task
* CPU > 80% → add 2 tasks
* CPU > 90% → add 3 tasks

This gives more control but requires manual configuration.

---

## Outcome

* ECS service now scales automatically based on load
* Improved availability during high traffic
* Optimized resource usage during low traffic

---

## Key Learning

* Difference between fixed capacity and auto scaling
* How Target Tracking simplifies scaling decisions
* Importance of cooldown periods
* Basic scaling strategies in cloud environments

## Phase 5: CI/CD Pipeline (GitHub Actions → ECR → ECS)

### Goal

Automate the deployment process so that every code change is automatically built, pushed, and deployed.

---

## Workflow Overview

```
Git Push → GitHub Actions → Build Docker Image → Push to ECR → Update ECS Service
```

---

## Step 1: Push Code to GitHub

### What we did

* Created a GitHub repository
* Uploaded project files
* Connected local project to remote repo

---

### Commands

```
git init
git add .
git commit -m "Initial Commit"
git remote add origin <repo-url>
git branch -M main
git push -u origin main
```

---

## Step 2: Create CI/CD Pipeline

### What we did

* Created a GitHub Actions workflow
* Automated build and deployment process

---

### File Location

```
.github/workflows/deploy.yml
```

---

### Pipeline Configuration

```
name: Deploy to ECS

on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v6
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          region: ${{ secrets.AWS_REGION }}

      - name: Login to ECR
        run: |
          aws ecr get-login-password --region $AWS_REGION \
          | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

      - name: Build Image
        run: docker build -t devops-app .

      - name: Tag Image
        run: docker tag devops-app:latest <your-ecr-url>:latest

      - name: Push Image
        run: docker push <your-ecr-url>:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster devops-cluster \
            --service devops-service-alb \
            --force-new-deployment
```

---

## Step 3: Configure Secrets

### What we did

Stored AWS credentials securely in GitHub.

Required secrets:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_REGION`

---

## How It Works

1. Code is pushed to GitHub (`main` branch)
2. GitHub Actions pipeline is triggered
3. Docker image is built
4. Image is pushed to ECR
5. ECS service is updated automatically
6. New version of app is deployed

---

## Outcome

* Fully automated deployment pipeline
* No manual Docker or ECS commands needed
* Faster and consistent deployments

---

## Key Learning

* How CI/CD pipelines automate deployments
* Integration between GitHub, ECR, and ECS
* Importance of secrets management
* How ECS updates services with new container images

## Phase 6: Database Integration (RDS MySQL)

### Goal

Enhance the application from a static response system to a dynamic, data-driven application by integrating a managed database.

---

## Problem (Before)

* Application returned static responses
* No data persistence
* No real backend functionality

---

## Solution

Integrated a managed MySQL database using Amazon RDS.

---

## Step 1: Create Database (RDS)

### What we did

* Created a MySQL database instance using AWS RDS
* Configured networking to allow ECS access

---

### Configuration

* Engine: MySQL
* DB Identifier: `aws-devops-app-db`
* Template: Free tier / Dev/Test
* VPC: Same as ECS
* Public access: Enabled

---

### Security Group (Temporary Setup)

* Type: MySQL
* Port: `3306`
* Source: `0.0.0.0/0` (Temporary for testing only)

---

### Get Endpoint

* Go to RDS → Database → Connectivity
* Copy **endpoint URL**

---

## Step 2: Update Application

### What we did

* Added MySQL client (`mysql2`)
* Connected Node.js app to database
* Implemented basic CRUD-like behavior

---

### Install dependency

```
npm install mysql2
```

---

### Updated `app.js`

```
const http = require('http');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'YOUR-ENDPOINT',
  user: 'admin',
  password: 'YOUR-PASSWORD',
  database: 'devopsdb'
});

connection.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('Connected to DB');
});

connection.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255)
  )
`);

const server = http.createServer((req, res) => {

  connection.query(
    "INSERT INTO messages (text) VALUES ('Hello from AWS ')"
  );

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

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
```

---

## Step 3: Rebuild & Deploy

### Commands

```
docker build -t aws-devops-app .
docker tag aws-devops-app:latest <ecr-url>:latest
docker push <ecr-url>:latest
```

Or trigger via CI/CD:

```
git add .
git commit -m "Add DB integration"
git push
```

---

## Deployment Flow

```
Git Push → GitHub Actions → Docker Build → ECR Push → ECS Deployment → App connects to RDS
```

---

## Test the Application

* Open ALB URL in browser
* Each request:

  * Inserts a new row
  * Fetches all rows
  * Displays data

---

## Outcome

* Application now stores and retrieves data
* Backend is fully functional
* End-to-end system (App → ECS → DB) is complete

---

## Key Learning

* How applications connect to managed databases
* Importance of VPC and security groups
* Basics of persistent storage in backend systems
* End-to-end integration in cloud architecture

---

## Important Notes

* Database is publicly accessible (not secure for production)
* Credentials are hardcoded (should use environment variables)
* No connection pooling implemented yet

## Phase 7: Caching Layer (Redis with ElastiCache)

### Goal

Improve application performance by reducing direct database calls using a caching layer.

---

## Problem (Before)

* Every request directly queried the database
* Increased latency
* Higher load on database

---

## Solution

Introduced a caching layer using Redis.

---

## Architecture Update

Before:

```
Request → Database
```

After:

```
Request → Cache (Redis) → Database (if needed)
```

---

## Step 1: Create Redis (ElastiCache)

### What we did

* Created a Redis cluster using Amazon ElastiCache
* Configured networking to allow ECS access

---

### Configuration

* Engine: Redis OSS
* Deployment: Node-based cluster
* Cluster mode: Disabled
* Node type: `cache.t3.micro`
* VPC: Same as ECS & RDS
* Subnets: All available

---

### Security Group (Temporary)

* Port: `6379`
* Source: `0.0.0.0/0` (Temporary for testing only)

---

### Get Endpoint

* Go to ElastiCache → Cluster
* Copy **Primary Endpoint**

---

## Step 2: Update Application

### What we did

* Installed Redis client
* Added caching logic to application
* Implemented cache-first strategy

---

### Install dependency

```
npm install redis
```

---

### Updated `app.js`

```
const http = require('http');
const mysql = require('mysql2');
const redis = require('redis');

console.log("Starting app...");

// Redis client
const redisClient = redis.createClient({
  socket: {
    host: 'YOUR-REDIS-ENDPOINT',
    port: 6379
  }
});

redisClient.connect()
  .then(() => console.log("Connected to Redis"))
  .catch(err => console.error("Redis connection failed:", err));

// MySQL connection
const connection = mysql.createConnection({
  host: 'YOUR-DB-ENDPOINT',
  user: 'admin',
  password: 'YOUR-PASSWORD'
});

connection.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }

  console.log('Connected to DB');

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
      console.log("Serving from Redis cache");
      res.end(cached);
      return;
    }

    console.log("Fetching from DB");

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
          EX: 10
        });

        res.end(data);
      }
    );

  } catch (error) {
    console.error(error);
    res.end("Error");
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
```

---

## How It Works

### First Request

* Cache MISS
* Data fetched from DB
* Stored in Redis

### Subsequent Requests (within 10 seconds)

* Cache HIT
* Data served directly from Redis
* Faster response time

---

## Deploy Changes

```
git add .
git commit -m "Add Redis caching"
git push
```

---

## Testing

* Open ALB URL multiple times
* Check logs:

```
Fetching from DB
Serving from Redis cache
```

---

## Outcome

* Reduced database load
* Faster response times
* Improved system performance

---

## Key Learning

* Difference between cache and database
* Cache-first design pattern
* How Redis improves performance
* Importance of TTL (expiry) in caching

---

## Important Notes

* Redis is publicly accessible (not secure for production)
* Cache expiry set to 10 seconds (demo purpose)
* No cache invalidation strategy implemented



## How It Works (End-to-End)

1. User sends request to the application
2. ALB routes traffic to ECS service
3. ECS runs containerized Node.js app
4. App reads/writes data from Aurora
5. Frequently accessed data is cached in Redis
6. CI/CD pipeline automatically updates the app on code changes

---

## What This Project Demonstrates

* Real-world DevOps workflow
* Infrastructure automation using Terraform
* Container orchestration with ECS
* CI/CD pipeline design
* Cloud architecture fundamentals
* Performance optimization using caching

---

## Limitations

* Basic application logic (focus is on infrastructure)
* No authentication/authorization
* Limited monitoring and logging

---

## Future Improvements

* Add monitoring (CloudWatch / Prometheus)
* Implement structured logging
* Introduce blue/green deployments
* Improve application-level architecture

---

## License

This project is for educational purposes.
