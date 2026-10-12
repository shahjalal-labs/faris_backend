# 💈 Faris — Salon & Barbershop Appointment Scheduling API

<p align="center">
  <img src="./assets/banner.svg" alt="Architecture Banner" width="100%" />
</p>

<p align="center">
  <a href="https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-37d78a40-72b1-4eff-8fc9-cde8a781e33e">
    <img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="height: 34px;" />
  </a>
  &nbsp;&nbsp;
  <a href="https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-37d78a40-72b1-4eff-8fc9-cde8a781e33e">
    <img src="https://img.shields.io/badge/Postman-Interactive%20API%20Documentation-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Postman Documentation" />
  </a>
  &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
</p>

---

## 📌 Executive Overview

On-demand barbershop appointment booking, stylist seat reservations, real-time consultation messaging with Socket.io, and Firebase FCM push notifications built with Node.js, Express, TypeScript, and Prisma.

This microservice has been designed following enterprise software engineering standards, featuring clean modular service architecture, centralized error handling, robust JWT authorization, strict input validation, and comprehensive automated database models.

---

## ⚡ Interactive API Documentation (Postman)

The entire API specification, complete with route headers, payload samples, and JWT authentication schemas, is published and directly accessible in the public Postman workspace:

👉 **[Launch Interactive Postman Workspace](https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-37d78a40-72b1-4eff-8fc9-cde8a781e33e)** *(No forking or sign-in required — instant browser reference)*

- **Collection UID**: `48491387-37d78a40-72b1-4eff-8fc9-cde8a781e33e`
- **Workspace**: Shahjalal API Portfolio
- **Environment**: Cloud Production / Local Docker Compose

---

## 🏗️ Architecture & Data Modeling

The backend persistence layer is engineered with production database schemas:

| Entity Model | Domain Responsibility |
| :--- | :--- |
| `Stylist / Barber` | Staff profiles, service specialties, shift schedules, and workstation chairs |
| `Appointment / Slot` | Real-time calendar slot reservations, duration locks, and confirmations |
| `ServiceCatalog` | Haircut, grooming, and styling treatment pricing and duration tiers |
| `Message / Room` | Customer-barber real-time direct chat and consultation media |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.x or v20.x
- **PostgreSQL** or **MongoDB** (refer to `.env.example`)
- **Redis** (for BullMQ queues where applicable)

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/shahjalal-labs/faris_backend.git
cd faris_backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### 3. Database Migration & Development
```bash
# Generate database client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## 👨‍💻 Engineering & Maintainer

**Md. Shahjalal**  
*Full Stack Software Engineer & Solutions Architect*  
- **Email**: [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)  
- **GitHub**: [@shahjalal-labs](https://github.com/shahjalal-labs)  
- **Postman Portfolio**: [Shahjalal API Portfolio](https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio)

---
<p align="center"><sub>Engineered with precision for production reliability and seamless scalability.</sub></p>
