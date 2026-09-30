# FairFare

FairFare is a ride booking backend built with **Node.js**, **Express**, and **MongoDB**. Passengers can request rides, and drivers can accept, start, complete, or cancel them.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Passenger and driver roles
- Ride request and status management
- Fare calculation based on ride distance
- MongoDB data storage with Mongoose

## Tech Stack

- Node.js
- Express
- MongoDB and Mongoose
- JSON Web Tokens
- bcryptjs
- express-validator

## Getting Started

### Requirements

- Node.js and npm
- A MongoDB connection string

### Installation

Clone the repository, then install dependencies:

```bash
npm install

Create a .env file in the project root:
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Start the development server:
npm run dev
The server will run at http://localhost:3000 if PORT is set to 3000.

API Endpoints
Routes are prefixed with /api.

Authentication
Method	Endpoint	        Description
POST	/api/auth/register	Register an account
POST	/api/auth/login	    Log in and receive a JWT


Example registration body:
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "password123",
  "role": "user"
}

Set role to "driver" to register as a driver. If omitted, the account is created as a passenger ("user").

Example login body:
{
  "email": "alex@example.com",
  "password": "password123"
}

Rides
Ride endpoints require a JWT. Send it in the request header:
Authorization: Bearer YOUR_TOKEN

Method	Endpoint	                Description
POST	/api/ride/requestride	    Request a ride
GET	    /api/ride/getride	        Get rides associated with the logged-in user
GET	    /api/ride/getridebyid/:id	Get a ride by ID
PUT	    /api/ride/accpetride/:id	Accept a ride as a driver
PUT	    /api/ride/startride/:id	    Start an accepted ride
PUT	    /api/ride/endride/:id	    Complete a started ride
PUT	    /api/ride/cancelride/:id	Cancel a ride


Example ride request body:
{
  "pickuplocation": "Central Station",
  "dropofflocation": "City Center",
  "distance": 12
}

The current fare calculation is distance in km × 10$.

Project Structure
src/
├── controllers/   # Request handlers and application logic
├── middlewares/   # Authentication middleware
├── models/        # Mongoose models
├── routes/        # API route definitions
└── server.js      # Express app and database connection




