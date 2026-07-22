# My Movie List - REST API

A stateless RESTful API for browsing movies, directors, and genres, with user registration, JWT-based authentication, and favourite-movie management.
<br/>Built with **Node.js**, **Express**, **MongoDB**, and **Passport.js** as part of a full-stack project made in MERN stack (MongoDB, Express, React, Node.js).

- **Backend API:** [Render deployment](https://mymovielist-api-dhqp.onrender.com)
- **Frontend client:** [React (Netlify)](https://mymovielistj.netlify.app/) 

<br/>

### Table of Contents
- [1. Project structure and design](#1-project-structure-and-design)
- [2. Database](#2-database)
- [3. Authentication and Authorization](#3-authentication-and-authorization)
- [4. Middleware Stack](#4-middleware-stack)
- [5. API Endpoints](#5-api-endpoints)
- [6. Environment Variables](#6-environment-variables)
- [7. Local Setup](#7-local-setup)
- [8. Future Improvements](#8-future-improvements)

<br/>

## 1. Project structure and design
The codebase follows a layered monolithic architecture, with each layer having a single responsibility, making the codebase easier to review, test and maintain.

| Layer | Directory | Responsibility |
|---|---|---|
| **Routes** | `routes/` | Manage the various endpoints of the API so that each route file is a single resource (e.g., `movies.js`, `users.js`).
| **Controllers** | `controllers/` | Own the request/response lifecycle: parse input, delegate to models and format HTTP responses. |
| **Models** | `models/` | Schema definitions made with Mongoose, of which fields include include data types, requiremente and references.
| **Middleware** | `middleware/` | Connects different layers of the application to handle shared concerns and manage pipeline flow (e.g., logging, error handling, authentication). |
| **Application Factory** | `app.js` | Assembles the Express application, mounts middleware and routes together. |
| **Entry Point** | `index.js` | Loads environment variables, connects to MongoDB and starts the HTTP server. |


<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

## 2. Database

This project uses **MongoDB**, a NoSQL document database that stores data as JSON-like documents rather than table rows.
<br/>The database has five collections: `movies`, `users`, `genres`, `directors`, and `actors`.

- ### Schema enforcement with Mongoose
  MongoDB is however schema-less, meaning that documents in the same collection can have different fields. This flexibility is useful for rapid development, but it also means that malformed data can creep into the database if not validated at the application layer.<br/>
  Therefore, the project uses **Mongoose**, an ODM (Object-Document Mapper) to add a schema layer on top of the database and enforce data integrity.
  With defined schemas, Mongoose validates incoming data before it is saved to the database, ensuring that malformed data never reaches the database. 

- ### How data is structured
  Each collection has its own file in `models/` with a Mongoose schema:

  ```js
  // models/Movie.js
  const movieSchema = mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    genre:       { type: mongoose.Schema.Types.ObjectId, ref: "Genre", required: true },
    director:    { type: mongoose.Schema.Types.ObjectId, ref: "Director", required: true },
    actors:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
    imagePath:   String,
  });
  ```

  Related entities are stored in separate collections and linked via `ObjectId` references (for example, a `Movie` stores its `genre` and `director` as IDs rather than embedding the full documents). This avoids data duplication while still sending a fully resolved object in one response avoiding redundant queries. 


<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>


## 3. Authentication, Security and Authorization

The API is fully stateless: it does not use sessions, cookies, or CSRF tokens. Instead, it uses `JWTs` (JSON Web Tokens) for authentication and authorization. This means that the server never stores any record of who is logged in: every request must carry a self-contained token that the server can verify on its own, so any instance of the API can handle any request without consulting a shared session store.


- **LocalStrategy**: handles initial login request. It extracts `username` and `password` from the request body, looks up the user and uses bcrypt to verify the password. On success, a JWT is generated and returned to the client.
- **JWTStrategy**: guards every protected route. It pulls the token from the `Authorization: Bearer <token>` header to verify its signature, and resolves the full user document. If the token is expired, tampered with or missing, Passport returns `401 Unauthorized` and the route handler never executes. 

Secure password storage and verification is handled by **bcrypt**, a one-way hashing algorithm used so that the server never stores plaintext passwords and make it hard for attackers to recover them even if the database is compromised.


<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

## 4. Middleware Stack

The middleware pipeline in `app.js` executes in this order on every request:

| Middleware | Purpose |
|---|---|
| `morgan("common")` | Structured request logging to stdout (method, URL, status, response time) |
| `bodyParser.json()` | Parses `Content-Type: application/json` bodies into `req.body` |
| `bodyParser.urlencoded()` | Parses form-encoded payloads |
| `cors.js` | Whitelists allowed origins (`localhost:1234`, `mymovielistj.netlify.app`); rejects all others with a descriptive error |
| `passport.initialize()` | Bootstraps Passport's authentication machinery |
| `passport.js` (required) | Registers Local + JWT strategies with Passport |
| `errorHandler.js` | Catch-all Express error middleware (4-arity function). Catches unhandled errors from any prior middleware and returns `500` |

Route-level middleware (`passport.authenticate("jwt", { session: false })`) is applied per-route in the route files, not globally - public routes like `POST /users` (signup) and `POST /login` bypass it.

<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

## 5. API Endpoints

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>`.

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users` | Register a new user. Body validated by `express-validator`. Password bcrypt-hashed before storage. |
| `POST` | `/login` | Authenticate with username + password. Returns `{ user, token }`. |

### Protected (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/movies` | List all movies with populated genre & director |
| `GET` | `/movies/:title` | Single movie by title (exact match) |
| `GET` | `/genres` | List all genres |
| `GET` | `/genres/:name` | Single genre with associated movies |
| `GET` | `/directors` | List all directors |
| `GET` | `/directors/:name` | Single director with associated movies |
| `GET` | `/users` | List all users |
| `GET` | `/users/:username` | Single user profile |
| `PUT` | `/users/:username` | Update user info. Re-validated, password re-hashed. |
| `POST` | `/users/:username/movies/:MovieID` | Add movie to user's favourites |
| `DELETE` | `/users/:username/movies/:MovieID` | Remove movie from user's favourites |
| `DELETE` | `/users/:username` | Delete user account |

> **Note on status codes:** Successful `GET` and `PUT` operations return `200`/`201`. Validation failures return `422`. Auth failures return `401`. Not-found returns `404`. Server errors return `500` via the catch-all error handler.

<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

## 6. Environment Variables

Local `.env` file is never committed but a template is provided as `example.env` as reference:

| Variable | Required | Purpose |
|---|---|---|
| `DB_URI` | Yes | MongoDB connection string (Atlas cluster or local instance) |
| `JWT_SECRET` | Yes | HMAC-SHA256 signing key for JWT tokens. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | No | Server listen port. Defaults to `8080`. Set automatically by Render in production. |

An `.env` file is needed for local development while on `Render` it is not used and any env vars can be injected through the platform's dashboard **Environment → Environment Variables** 

<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

## 7. How to run the app 

- ### Prerequisites:

  - **Node.js** ≥ 21 (required for native `--env-file` flag)
  - **MongoDB** running locally on `127.0.0.1:27017`, or a MongoDB Atlas cluster

- ### Steps:

  ```bash
  # 1. Clone the repository
  git clone <repo-url>
  cd movie_api

  # 2. Install dependencies
  npm install

  # 3. Create your .env file from the template
  cp example.env .env
  # Edit .env with your actual DB_URI and JWT_SECRET

  # 4. Start in development mode (auto-restart on changes)
  npm run dev

  # 5. Or start in production mode
  npm start
  ```

  To run the app locally use:
  ```js
  npm run dev
  ```
  This command uses `nodemon --env-file=.env`, which loads the `.env` file into `process.env` via Node's native env-file support. 
  Make sure to create a `.env` file in the root directory with your MongoDB connection string and JWT secret before running.

  > **Note:** npm start is used for production deployment on Render, this command does not use the `.env` file since Render injects environment variables at the OS level.

<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

## 8. Future Improvements

- **Stronger input validation**: improve `express-validator` with better rules to handle login and signup edge cases.
- **Structured logging**: replace Morgan with [Pino](https://getpino.io) for better detailed logging.
- **Rate limiting & security hardening**: add [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), [helmet](https://helmetjs.github.io), and CORS tightening to protect against brute-force and common web vulnerabilities.
- **Testing**: add unit tests and integration tests.
- **Admin role**: introduce an admin role to keep user data private and allow for database management via an admin dashboard.
- **Main Concept**: redesign the app concept from a generic movie database into a more personalizable, user-driven experience.

<p align="right"><a href="#table-of-contents">↑ Back to top</a></p>

