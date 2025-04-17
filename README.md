# Candidate Takehome Exercise
This is a simple backend engineer take-home test to help assess candidate skills and practices.  We appreciate your interest in Voodoo and have created this exercise as a tool to learn more about how you practice your craft in a realistic environment.  This is a test of your coding ability, but more importantly it is also a test of your overall practices.

If you are a seasoned Node.js developer, the coding portion of this exercise should take no more than 1-2 hours to complete.  Depending on your level of familiarity with Node.js, Express, and Sequelize, it may not be possible to finish in 2 hours, but you should not spend more than 2 hours.  

We value your time, and you should too.  If you reach the 2 hour mark, save your progress and we can discuss what you were able to accomplish. 

The theory portions of this test are more open-ended.  It is up to you how much time you spend addressing these questions.  We recommend spending less than 1 hour.  

For the record, we are not testing to see how much free time you have, so there will be no extra credit for monumental time investments.  We are looking for concise, clear answers that demonstrate domain expertise.

# Project Overview
This project is a simple game database and consists of 2 components.  

The first component is a VueJS UI that communicates with an API and renders data in a simple browser-based UI.

The second component is an Express-based API server that queries and delivers data from an SQLite data source, using the Sequelize ORM.

This code is not necessarily representative of what you would find in a Voodoo production-ready codebase.  However, this type of stack is in regular use at Voodoo.

# Project Setup
You will need to have Node.js, NPM, and git installed locally.  You should not need anything else.

To get started, initialize a local git repo by going into the root of this project and running `git init`.  Then run `git add .` to add all of the relevant files.  Then `git commit` to complete the repo setup.  You will send us this repo as your final product.
  
Next, in a terminal, run `npm install` from the project root to initialize your dependencies.

Finally, to start the application, navigate to the project root in a terminal window and execute `npm start`

You should now be able to navigate to http://localhost:3000 and view the UI.

You should also be able to communicate with the API at http://localhost:3000/api/games

If you get an error like this when trying to build the project: `ERROR: Please install sqlite3 package manually` you should run `npm rebuild` from the project root.

# Practical Assignments
Pretend for a moment that you have been hired to work at Voodoo.  You have grabbed your first tickets to work on an internal game database application. 

#### FEATURE A: Add Search to Game Database
The main users of the Game Database have requested that we add a search feature that will allow them to search by name and/or by platform.  The front end team has already created UI for these features and all that remains is for the API to implement the expected interface.  The new UI can be seen at `/search.html`

The new UI sends 2 parameters via POST to a non-existent path on the API, `/api/games/search`

The parameters that are sent are `name` and `platform` and the expected behavior is to return results that match the platform and match or partially match the name string.  If no search has been specified, then the results should include everything (just like it does now).

Once the new API method is in place, we can move `search.html` to `index.html` and remove `search.html` from the repo.

#### FEATURE B: Populate your database with the top 100 apps
Add a populate button that calls a new route `/api/games/populate`. This route should populate your database with the top 100 games in the App Store and Google Play Store.
To do this, our data team have put in place 2 files at your disposal in an S3 bucket in JSON format:

- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json
- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json

# Theory Assignments
You should complete these only after you have completed the practical assignments.

The business goal of the game database is to provide an internal service to get data for all apps from all app stores.  
Many other applications at Voodoo will use consume this API.

#### Question 1:
We are planning to put this project in production. According to you, what are the missing pieces to make this project production ready? 
Please elaborate an action plan.

#### Question 2:
Let's pretend our data team is now delivering new files every day into the S3 bucket, and our service needs to ingest those files
every day through the populate API. Could you describe a suitable solution to automate this? Feel free to propose architectural changes.


# 📦 Production Readiness & Daily Ingestion Strategy

## ✅ Question 1: What is missing to make the project production-ready?

### 🔍 Observations
While the current game database application works well in a development context, transitioning to production requires robustness, security, scalability, and maintainability.

### 🛠️ Action Plan

#### 1. **Environment & Configuration Management**
- Introduce `.env` files and a config management strategy using libraries like `dotenv`.
- Separate environments (dev/staging/prod) with proper config isolation.

#### 2. **Validation & Error Handling**
- Switch to from JS to TS.
- Use a library like `Joi` for request validation, `Zod` for form validation (UI).
- Centralize error handling (Express error middleware).

#### 3. **Rate Limiting & Security**
- Apply rate limiting using `express-rate-limit`.
- Implement security best practices (helmet, CORS config, input sanitization).

#### 4. **Authentication & Authorization**
- Protect endpoints using JWT or OAuth (especially for sensitive operations like populate/delete).

#### 5. **Database Improvements**
- Use UUIDs as primary keys.
- Enforce uniqueness at the DB level with proper constraints.
- Improve indexing for performance (e.g. on `storeId`, `name`, `platform`).

#### 6. **Testing & CI/CD**
- Improve test coverage with unit and integration tests.
- Set up CI pipelines (e.g. GitHub Actions) for lint/test/build.
- Add pre-commit hooks using `husky`.

#### 7. **Observability**
- Use `winston` or `pino` for structured logging.
- Add monitoring/alerting with services like Datadog/CloudWatch.

#### 8. **Deployment Strategy**
- Dockerize the app.
- Use orchestration (e.g. Kubernetes or ECS).
- CI/CD for zero-downtime deployment.

---

## 🔁 Question 2: Automating Daily Ingestion from S3

### 🔄 Problem
The API should ingest new files uploaded daily to an S3 bucket — manually triggering the populate endpoint is not scalable.

### 🔧 Proposed Architecture

#### ✅ Based on Experience
> “According to what I’ve already tested, this approach would totally work — especially if we integrate CloudWatch for logging and alerts.”

### 📐 Architecture Overview

#### 1. **S3 Trigger**
- Create a specific folder (e.g. `/daily-upload`) in the S3 bucket.
- Set up an **S3 event trigger** for file uploads in this folder.

#### 2. **Trigger Lambda**
- A **Lambda function** is invoked when a file is added.
- It pushes a message into an **SQS Queue** with file metadata (URL, timestamp, etc.).

#### 3. **Ingestion Lambda**
- Another **Lambda** function polls the queue.
- It:
  - Fetches the S3 file (JSON).
  - Parses and deduplicates data.
  - Calls the internal `/populate` API or directly interacts with the DB.

#### 4. **Scaling & Monitoring**
- SQS ensures load is managed — avoiding API overload.
- CloudWatch logs errors, tracks ingestion stats, and sends alerts on failure.

#### 5. **Optional Enhancements**
- Use AWS Step Functions for more control (e.g. retry logic).
- Add batch processing (combine games from multiple files before storing).

### 🧩 Benefits
- Fully **automated**, scalable, and resilient.
- Easy to monitor and maintain.
- Decouples upload logic from ingestion logic.


