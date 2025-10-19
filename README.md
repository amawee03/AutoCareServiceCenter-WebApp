# 🚗 AutoCare Service Center

The **AutoCare Service Center** is a full-stack web application built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.  
It is designed to digitalize and streamline the daily operations of a vehicle service center — from managing appointments to tracking job progress — enhancing both customer convenience and administrative efficiency.

---

## 🧠 Overview

This system provides functionalities for **customers**, **mechanics**, and **administrators**, covering all essential operations within a modern auto service center.  
The platform enables online service booking, vehicle and inventory management, financial tracking, and real-time job progress updates — all from a centralized dashboard.

---

## ⚙️ Main System Components

### 1. 🧾 Service Catalogue Management
- View and manage all available service types (e.g., repairs, oil changes, inspections).  
- Add, edit, or remove service listings.  
- Define service charges and durations.  
- Enable/disable services based on availability.

### 2. 👤 User Management
- Register, log in, and manage user profiles (Customers, Admins, Mechanics).  
- Secure authentication using **JWT** and **bcrypt**.  
- Role-based access control to restrict unauthorized actions.  
- View booking history and personal notifications.

### 3. 🚘 Vehicle Management
- Register and store vehicle details (model, make, registration number).  
- Link vehicles to specific users.  
- Track maintenance and service history for each vehicle.  
- Generate service reports per vehicle.

### 4. 🧰 Inventory Management
- Maintain stock of spare parts and consumables.  
- Add or remove items with quantity tracking.  
- Monitor low-stock alerts and generate restock notifications.  
- Track parts usage per service job.

### 5. 💰 Financial & Appointment Management
- Customers can book appointments online for selected services.  
- Manage payment records and billing summaries.  
- Track completed, pending, and cancelled appointments.  
- Generate financial reports and daily revenue summaries.

### 6. 🔧 Job Progress Tracking
- Track job progress (Pending → In Progress → Completed).  
- Mechanics can update task statuses in real-time.  
- Provide service notes and customer feedback at completion.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, HTML5, CSS3, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Version Control** | Git & GitHub |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js |

---

## 📂 Project Structure

AutoCareServiceCenter/
│
├── backend/ # Express + Node.js backend
│ ├── config/ # DB connection & environment setup
│ ├── controllers/ # Route handlers (CRUD logic)
│ ├── models/ # MongoDB schemas
│ ├── routes/ # API endpoints
│ └── server.js # Backend entry point
│
├── frontend/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI elements
│ │ ├── pages/ # Page views (Service, Vehicle, etc.)
│ │ ├── services/ # API integration
│ │ ├── App.js # Root React component
│ │ └── index.js # App entry point
│
└── README.md

## 🔒 Security Features
- Passwords hashed using bcrypt.js
- JWT-based authentication & authorization
- CORS-enabled secure API calls
- Role-based route protection for Admins, Mechanics, and Users

## 👨‍💻 Developers
- [Amasha Weerasuriya](https://www.linkedin.com/in/amasha-weerasuriya-4a3a43266)
- Vinuri Dahanayake
- Jinuki Senevirathne
- Dilwan Tissera
- Praveen Fonseka
