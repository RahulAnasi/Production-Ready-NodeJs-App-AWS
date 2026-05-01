# 🚀 Scalable DevOps Architecture on AWS (Node.js + ECS + Terraform)

This project demonstrates how to design, build, and deploy a containerized Node.js application using a complete DevOps workflow and AWS cloud infrastructure.

It starts from a simple Node.js application and evolves into a fully containerized, automated, and cloud-deployed architecture.

---

## 🧠 Problem Statement

Traditional backend applications are often:

* Hard to scale
* Manually deployed
* Difficult to maintain across environments

This project solves that by building a system that is:

* Containerized
* Automatically deployed
* Scalable and cloud-native

---

## 🏗️ Architecture Overview

The system is designed to handle incoming traffic, process requests via containerized services, and efficiently manage data using a database and caching layer.

**Flow:**

User → Application Load Balancer → ECS (Docker Containers)
                  ↓
              Amazon RDS (Database)
                  ↓
              ElastiCache (Redis)

---

## ⚙️ CI/CD Pipeline

Code changes are automatically built and deployed using a CI/CD pipeline:

GitHub → GitHub Actions → Amazon ECR → Amazon ECS

* Code push triggers pipeline
* Docker image is built and pushed to ECR
* ECS service updates automatically (rolling deployment)

---

## 🛠️ Tech Stack

### Application Layer

* Node.js (HTTP module)
* MySQL (`mysql2`)

### DevOps & Cloud

* Terraform → Infrastructure as Code
* Docker → Containerization
* Amazon ECS → Container orchestration
* Amazon ECR → Container registry
* GitHub Actions → CI/CD automation
* Amazon RDS → Managed database
* Amazon ElastiCache (Redis) → Caching layer
* Application Load Balancer → Traffic distribution

---

## 🚀 Key Features

* ✅ Containerized backend application using Docker
* ✅ Infrastructure fully provisioned using Terraform
* ✅ Automated CI/CD pipeline (GitHub Actions → ECS)
* ✅ Scalable deployment using ECS services
* ✅ Load balancing using ALB
* ✅ Managed database with Aurora
* ✅ Performance optimization using Redis caching

---

## 📂 Project Structure

├── .github/
│   └── workflows/
├── .gitignore
├── Dockerfile
├── README.md
├── app.js
├── package.json
└── package-lock.json


# Phase 1: Application & Containerization

🎯 Goal

Build a simple Node.js application and containerize it using Docker so it can run consistently across environments.

🧩 Step 1: Create a Simple Node.js App

📌 What we did
      1) Created a basic HTTP server using Node.js
      2) Verified that the app runs locally

🛠️ Commands
mkdir aws-devops-project
cd aws-devops-project

npm init -y

Create application file:

nano app.js

Paste the following code:

const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello from DevOps Project 🚀');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

Run the application:

node app.js

Access in browser:

http://localhost:3000

🐳 Step 2: Dockerize the Application

📌 What we did
Created a Dockerfile
Built a Docker image
Ran the container locally

🛠️ Commands

Create Dockerfile:

nano Dockerfile

Paste:

FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]

Build Docker image:

docker build -t aws-devops-app .

Run container:

docker run -p 3000:3000 aws-devops-app

Access in browser:

http://localhost:3000

✅ Outcome
Node.js application successfully created
Application runs locally on port 3000
Docker image built and containerized successfully
Application runs inside a container

💡 Key Learning
How to build a basic backend service
How Docker packages an application with its dependencies
Why containerization is important for consistency across environments

---

## Phase 2: Push Docker Image to AWS & Deploy with ECS

### 🎯 Goal

Push the Docker image to a cloud registry and run the application as a live container using a managed service.

---

## 📦 Step 1: Push Docker Image to Amazon ECR

### 📌 What we did

* Created a private container registry
* Authenticated Docker with AWS
* Tagged and pushed the image

---

### 🛠️ Commands

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

### ✅ Outcome

* Docker image successfully stored in Amazon ECR
* Image available for deployment in ECS

---

## 🚀 Step 2: Deploy Application using ECS (Fargate)

### 📌 What we did

* Created ECS cluster using Fargate
* Defined a task to run the container
* Deployed a service to keep the app running

---

### ⚙️ Configuration (Console Steps)

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

### 🌐 Networking Setup

* VPC: Default VPC
* Subnets: All available
* Auto-assign Public IP: ✅ Enabled
* Security Group:

  * Allow inbound traffic on port `3000`

---

## 🌍 Access the Application

1. Go to ECS → Cluster → Tasks
2. Open running task
3. Copy Public IP

Access in browser:

http://<public-ip>:3000

---

## ✅ Outcome

* Application successfully deployed on AWS
* Container running via ECS Fargate
* Publicly accessible using task IP

---

## 💡 Key Learning

* How container images are stored in ECR
* How ECS runs containers without managing servers
* Difference between **Task** and **Service**
* Basics of cloud networking (VPC, subnets, security groups)

---

## 🌐 Phase 3: Load Balancing with ALB

### 🎯 Goal

Improve application accessibility and scalability by introducing a load balancer instead of directly exposing containers.

---

## ⚠️ Problem (Before)

Initial architecture:

User → ECS Container

Limitations:

* No load distribution
* No fault tolerance
* Direct exposure of container IP
* Not scalable

---

## ✅ Solution (After)

Updated architecture:

User → Application Load Balancer → ECS (Containers)

---

## 🧩 Step: Add Application Load Balancer

### 📌 What we did

* Created an Application Load Balancer (ALB)
* Attached it to ECS service
* Routed incoming traffic to containers

---

### ⚠️ Important Note

Existing ECS services **cannot be directly modified** to attach an ALB.

👉 Solution:

* Created a **new ECS service**
* Configured it with ALB during setup

---

### ⚙️ Configuration Steps (Console)

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

## 🌍 Access the Application

1. Go to EC2 → Load Balancers
2. Select your ALB
3. Copy **DNS name**

Access in browser:

```
http://<ALB-DNS-name>
```

---

## ✅ Outcome

* Application is now accessible via ALB
* Traffic is routed to ECS containers
* Improved scalability and availability
* Removed dependency on public IP

---

## 💡 Key Learning

* Why load balancers are essential in production systems
* Difference between direct access vs load-balanced access
* How ECS integrates with ALB using target groups
* Basic traffic routing in cloud environments

## ⚙️ How It Works (End-to-End)

1. User sends request to the application
2. ALB routes traffic to ECS service
3. ECS runs containerized Node.js app
4. App reads/writes data from Aurora
5. Frequently accessed data is cached in Redis
6. CI/CD pipeline automatically updates the app on code changes

---

## 📊 What This Project Demonstrates

* Real-world DevOps workflow
* Infrastructure automation using Terraform
* Container orchestration with ECS
* CI/CD pipeline design
* Cloud architecture fundamentals
* Performance optimization using caching

---

## ⚠️ Limitations

* Basic application logic (focus is on infrastructure)
* No authentication/authorization
* Limited monitoring and logging

---

## 🔮 Future Improvements

* Add monitoring (CloudWatch / Prometheus)
* Implement structured logging
* Introduce blue/green deployments
* Improve application-level architecture

---

## 📜 License

This project is for educational purposes.
