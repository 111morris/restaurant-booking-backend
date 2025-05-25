# Restaurant Booking System

## Overview

The **Restaurant Booking System** is a modern full-stack web application designed to streamline restaurant reservations. It allows users to book tables, manage their reservations, and receive real-time updates. Admins have access to a dedicated dashboard to oversee bookings, users, and system notifications.

This project combines the power of **Node.js** and **Express.js** on the backend with a sleek **React.js** frontend, delivering a responsive and dynamic user experience. Additional features include Firebase-powered push notifications, JWT authentication, and optional OpenAI API integration for smart capabilities.

---

## Features

*  Secure user registration and login with JWT authentication

*  Easy table booking and reservation management

*  Real-time notifications for new bookings and status updates (via Firebase & Socket.IO)

*  Admin dashboard to manage users and bookings

*  Payment processing support (placeholder for future integration)

*  Optional AI features via OpenAI API

---

## Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **MySQL**
* **Socket.IO**
* **Firebase**
* **JWT (JSON Web Tokens)**
* **OpenAI API** *(optional)*

### Frontend

* **React.js**
* **Axios**
* **Tailwind CSS**

---

## Getting Started

### Prerequisites

Ensure the following are installed on your machine:

* [Node.js](https://nodejs.org/) (v14 or higher)
* [MySQL](https://www.mysql.com/) (v5.7 or higher)
* [Git](https://git-scm.com/) *(optional but recommended)*

---

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
```

---

### 🔧 Backend Setup

#### 2. Configure Environment Variables

Navigate to the backend folder:

```bash
cd restaurant-booking-backend
```

Create a `.env` file and add the following:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=NewPassword123!   # Replace with your MySQL password
DB_NAME=restaurant_booking
JWT_SECRET=your_jwt_secret    # Replace with your own secret
OPENAI_API_KEY=your_openai_api_key   # Optional
```

#### 3. Install Backend Dependencies

```bash
npm install
```

#### 4. Set Up the Database

* Create a MySQL database named `restaurant_booking`.
* Run SQL scripts to create tables and seed initial data.

#### 5. Start the Backend Server

```bash
npm start
```

The backend will run at: [http://localhost:5000](http://localhost:5000)

---

### Frontend Setup

#### 1. Navigate to Frontend Directory

```bash
cd restaurant-booking-frontend
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Start the Frontend Application

```bash
npm start
```

The frontend will be available at: [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Log in an existing user |

### 🗕️ Bookings

| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| GET    | `/api/bookings`            | Retrieve all bookings (Admin) |
| POST   | `/api/bookings`            | Create a new booking          |
| PUT    | `/api/bookings/:id/status` | Update booking status         |
| DELETE | `/api/bookings/:id`        | Delete a booking              |

### Notifications

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| GET    | `/api/notifications` | Fetch admin notifications |

### AI Endpoint *(Optional)*

| Method | Endpoint      | Description                           |
| ------ | ------------- | ------------------------------------- |
| POST   | `/api/ai/ask` | Send a prompt to ChatGPT (if enabled) |

#### Request Example:

```http
POST /api/ai/ask
{
  "message": "Suggest a romantic dinner table setup."
}
```

#### Response Example (if enabled):

```json
{
  "response": "You could use candlelight, soft music, and..."
}
```

#### Response Example (if disabled):

```json
{
  "error": "AI feature is currently disabled because the API key is missing."
}
```

---

## Real-Time Features

This project utilizes **Socket.IO** for real-time communication. When running, the system will support:

* Instant updates to the admin when new bookings are made
* Live status updates for reservations

Ensure your Socket.IO server is properly configured and running with the backend.

---

## AI Features (Optional)

This project includes optional AI capabilities powered by the OpenAI API. These features can be used to:

* Automatically respond to user queries
* Enhance admin assistance with smart suggestions
* Provide intelligent booking feedback (future roadmap)

### Environment Setup for AI

To enable AI features, add the following to your `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
```

If you do **not** provide a valid `OPENAI_API_KEY`, the AI features will:

* Not initialize the OpenAI API client
* Skip or disable AI-related routes
* Respond gracefully with fallback messages like:

```json
{
  "error": "AI feature is currently disabled because the API key is missing."
}
```

This ensures the backend runs safely without requiring AI configuration.

---

## Contributing

We welcome all contributions! If you have ideas, feature requests, or found bugs, feel free to:

* Open an issue
* Submit a pull request

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

Thanks to the developers and tools that made this project possible:

* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com/)
* [React.js](https://reactjs.org/)
* [MySQL](https://www.mysql.com/)
* [Socket.IO](https://socket.io/)
* [Firebase](https://firebase.google.com/)
* [OpenAI](https://platform.openai.com/)
