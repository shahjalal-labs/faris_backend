# Faris Barbershop Backend - Appointment & Real-Time Booking API

<p align="center">
  <img src="assets/banner.svg" alt="faris_backend Banner" width="100%">
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.21-black?style=for-the-badge&logo=express" alt="Express"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma" alt="Prisma"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"></a>
  <a href="https://socket.io"><img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io" alt="Socket.io"></a>
  <a href="https://firebase.google.com"><img src="https://img.shields.io/badge/Firebase-FCM-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License"></a>
</p>

---

## 📖 Overview

**faris_backend** is Faris Backend (`faris_backend`) is a specialized barbershop and beauty salon booking API built with Node.js, Express.js, TypeScript, and Prisma ORM with MongoDB. The service coordinates stylist scheduling matrices, appointment time slots, real-time client-to-barber messaging via Socket.io, Firebase Cloud Messaging push alerts, and verified client reviews.

---

## ⚡ Key Features

- 💈 **Barber & Service Catalog:** Multi-category grooming services with dynamic pricing, durations, and specialist tags.
- 📅 **Dynamic Availability Matrix:** Real-time stylist scheduling engine preventing double-booking and tracking custom work shifts.
- 💬 **Real-Time Client-Stylist Chat:** WebSockets powered by Socket.io enabling immediate appointment adjustments and inquiries.
- 🔔 **Firebase Cloud Messaging:** Instant push notifications for appointment confirmations, reminders, and promotional offers.
- ⭐ **Feedback & Rating System:** Customer reviews with aggregate stylist scoring to showcase barber ratings.
- 🎁 **Promotions & Offers:** Configurable marketing discounts, seasonal codes, and promotional banners.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client[Web & Mobile Clients] -->|HTTPS REST| Express[Express HTTP Server]
    Client -->|WSS Socket| SocketServer[Socket.io Gateway]

    subgraph Middleware ["Middleware Pipeline"]
        Express --> Auth[JWT & Role Verification]
        Express --> Validate[Zod Input Validation]
    end

    subgraph CoreServices ["Salon Business Modules"]
        Auth --> BookingService[Appointment Booking Service]
        Auth --> AvailService[Stylist Availability Engine]
        Auth --> ServiceCatalog[Grooming Services Catalog]
        Auth --> OfferService[Promotions & Discounts]
    end

    subgraph RealTime ["Real-Time & Notifications"]
        SocketServer --> ChatRooms[Real-Time Barber Chat]
        BookingService --> FCM[Firebase Cloud Messaging API]
    end

    subgraph Database ["Persistence"]
        CoreServices --> Prisma[Prisma ORM Client]
        ChatRooms --> Prisma
        Prisma --> MongoDB[(MongoDB Cluster)]
    end
```

---

## 📂 Directory Structure

```text
.
├── src/
│   ├── app/
│   ├── components/
│   └── ...
├── assets/
│   └── banner.svg
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── LICENSE
```

---

## 🛠️ Tech Stack & Dependencies

| Layer / Library | Version | Description |
|---|---|---|
| **Express.js** | `v4.21` | REST routing and API middleware |
| **TypeScript** | `v5.x` | Type-safe application architecture |
| **Prisma ORM** | `v6.x` | Schema migrations and database access |
| **MongoDB** | `Atlas` | Document database for salon records and chats |
| **Socket.io** | `v4.8` | Bidirectional WebSocket connection for live chat |
| **Firebase Admin SDK** | `v13.x` | FCM push notification delivery |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on the provided sample:

```bash
cp .env.example .env
```

Configurable variables:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/faris_db?retryWrites=true&w=majority

JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=super_secret_refresh_token
REFRESH_TOKEN_EXPIRES_IN=30d

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Socket CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.x or higher recommended)
- Package Manager (`npm`, `yarn`, or `pnpm`)

### Installation

```bash
# Clone repository
git clone https://github.com/shahjalal-labs/faris_backend.git
cd faris_backend

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
# or for backend services
npm run start:dev
```

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
