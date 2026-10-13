# Secure User Authentication System

A secure user authentication application built with Node.js, Express, SQLite, and JavaScript. The application supports user registration, login, password hashing, JWT-based authentication, and protected API endpoints.

## Features

* User registration and login
* Password hashing with bcrypt
* JWT-based authentication
* Protected user profile endpoint
* SQLite database for persistent user records
* Server-side input validation
* HTTP status codes for error handling
* Rate limiting on authentication endpoints
* Responsive frontend interface
* Environment-based configuration

## Technologies Used

* Node.js
* Express.js
* SQLite with better-sqlite3
* bcryptjs
* JSON Web Tokens (JWT)
* HTML, CSS, and JavaScript
* Helmet security middleware
* express-rate-limit

## Project Structure

```text
secure-authentication/
├── README.md
├── package.json
├── server.js
├── .gitignore
├── .env.example
└── public/
    └── index.html
```

## Requirements

* Node.js 20 or a compatible supported Node.js version
* npm

## Installation

Clone the repository:

```bash
git clone https://github.com/vijayasrikoneti140607-gif/secure-authentication.git
```

Enter the project directory:

```bash
cd secure-authentication
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a local `.env` file using `.env.example` as a template.

Configure these variables:

```env
PORT=3000
JWT_SECRET=replace_with_your_own_random_secret
DB_PATH=users.db
```

Generate a secure JWT secret locally with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into your local `.env` file.

**Never upload your real `.env` file or JWT secret to GitHub.**

## Run the Application

Start the server:

```bash
npm start
```

Open the following address in your browser:

```text
http://localhost:3000
```

The SQLite database and users table are created automatically when the application starts.

## API Endpoints

### 1. API Information

**GET /**

Returns basic API information when the static frontend does not handle the request.

Example response:

```json
{
  "message": "Secure Authentication API",
  "endpoints": [
    "POST /api/auth/register",
    "POST /api/auth/login",
    "GET /api/auth/me"
  ]
}
```

### 2. Register a User

**POST /api/auth/register**

Request body:

```json
{
  "username": "demo_user",
  "password": "ExamplePassword123"
}
```

Successful response: `201 Created`

The password is hashed before it is stored in the database.

Possible errors:

* `400 Bad Request` — Invalid input
* `409 Conflict` — Username already exists
* `500 Internal Server Error` — Registration failed

### 3. Log In

**POST /api/auth/login**

Request body:

```json
{
  "username": "demo_user",
  "password": "ExamplePassword123"
}
```

Successful response: `200 OK`

The response contains a JWT access token.

Possible errors:

* `400 Bad Request` — Invalid input
* `401 Unauthorized` — Invalid credentials
* `500 Internal Server Error` — Login failed

### 4. Get the Authenticated User

**GET /api/auth/me**

This endpoint requires a valid JWT.

Request header:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response:

```json
{
  "user": {
    "id": 1,
    "username": "demo_user"
  }
}
```

Possible errors:

* `401 Unauthorized` — Missing, invalid, or expired token
* `500 Internal Server Error` — Server error

## Example Authenticated Request

First, log in and copy the returned token.

Then run:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Replace `YOUR_ACCESS_TOKEN` with the token returned by the login endpoint.

## Security Measures

* Passwords are hashed using bcrypt.
* JWTs expire after one hour.
* Protected endpoints require authentication.
* Authentication endpoints have rate limiting.
* Helmet adds security-related HTTP headers.
* User input is validated on the server.
* Environment variables are used for secrets.
* Local database and environment files are excluded through `.gitignore`.

## Live Demo

Not deployed yet.

A live demo URL will be added after deployment and testing.

## Future Improvements

* Password reset functionality
* Email verification
* Automated authentication tests
* Refresh-token support
* Production database hosting
* Improved frontend accessibility

## Author

Vijayasri Koneti

## License

This project is available for educational and portfolio purposes.
