# CelebalTask-7: Celebal Employee Management System

## Project Overview

This project is a **simple full-stack Node.js web app** that demonstrates:
- User **registration** and **login**
- **JWT-based authentication**
- **Role-based access control** (admin vs user)
- Protected **dashboard** and **employee management**
- Basic **CRUD** for employees (Add, Edit, Delete)
- Secure **token handling** using HTTP-only cookies

---

## How this project satisfies the requirement

**Requirement:**  
> *Add JSON Web Token (JWT) authentication to your existing RESTful API. Ensure secure handling of tokens and implement a protected route.*

### How it’s implemented

1. **JWT Authentication**

   - When a user logs in, the server:
     - Verifies their credentials.
     - Generates a **JWT** with user info and role.
     - Signs it using a secret key.
     - Stores it in an **HTTP-only cookie** (for secure handling).

2. **Secure Token Handling**

   - The JWT is stored in an HTTP-only cookie — this protects it from XSS attacks because client-side JavaScript cannot read it.
   - Tokens expire in **1 hour** for security.
   - The server checks the JWT on each protected request.

3. **Protected Routes**

   - **/dashboard** → only accessible if a valid JWT is present.
   - **/api/employees** → only accessible to authenticated users **with admin role**.
   - **Role-based logic** ensures normal users cannot access admin-only operations.

---

## Main Features

- **Register:** Users can register with `username`, `password`, and `role` (user or admin).
- **Login:** Users log in with credentials → receive a JWT → stored securely.
- **Dashboard:** 
  - Displays a welcome message.
  - Admins can **add**, **edit**, **delete** employee records.
- **Backend:** Uses Node.js, Express, `jsonwebtoken` and `bcryptjs`.
- **Frontend:** HTML, CSS, JavaScript fetch calls for API.
- **Data Storage:** Simple JSON files (`users.json` and `employees.json`).

---

## Security Measures

- **Passwords** are hashed using `bcryptjs` before storing.
- **Tokens** are short-lived (`1h`) and stored as HTTP-only cookies.
- **Role checks** prevent unauthorized access to admin routes.

---

## How to Run Locally

```bash
# 1. Clone this repo
git clone https://github.com/yourusername/CelebalTask-7.git
cd CelebalTask-7

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Visit in browser
http://localhost:3000
