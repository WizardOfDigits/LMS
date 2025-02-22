# API Documentation

## Base URL

```
http://yourdomain.com/api/v1
```

## Endpoints

### 1. User Registration

**Endpoint:**

```
POST /register
```

**Description:**
Registers a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password123",
  "avatar": "optional-url"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Please check your email: johndoe@example.com to activate your account",
  "activationToken": "jwt_token_here"
}
```

**Error Responses:**

- 400: "Email already exists"
- 500: "Something went wrong"

---

### 2. Activate User

**Endpoint:**

```
POST /activate-user
```

**Description:**
Activates a user account.

**Request Body:**

```json
{
  "activation_token": "jwt_token_here",
  "activation_code": "1234"
}
```

**Response:**

```json
{
  "success": true
}
```

**Error Responses:**

- 400: "Invalid activation code"
- 400: "Email already exists"
- 500: "An unknown error occurred"

---

## Authentication Tokens

- **Access Token:** Expires in 30 minutes.
- **Refresh Token:** Expires in 7 days.
- ACTIVATION_SECRET

---
