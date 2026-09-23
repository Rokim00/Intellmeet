# 🚀 Frontend Auth Integration

**Base URL:** `http://localhost:5000/api/v1/auth`  
**Rule:** Set `withCredentials: true` on Axios.

---

## 1. Types & DTOs

```typescript
// Models
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  avatarUrl: string;
}

// Inputs (DTOs)
export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Member';
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Responses
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors: { field: string; message: string }[];
}
```

---

## 2. Routes

| Endpoint | Method | Body | Auth Header | Returns |
| :--- | :--- | :--- | :--- | :--- |
| `/signup` | `POST` | `SignupDTO` | ❌ None | `{ user, accessToken }` |
| `/login` | `POST` | `LoginDTO` | ❌ None | `{ user, accessToken }` |
| `/me` | `GET` | ❌ None | `Bearer <token>` | `User` profile |
| `/refresh` | `POST` | `{}` | ❌ None | `{ accessToken }` |
| `/logout` | `POST` | ❌ None | `Bearer <token>` | `200 OK` |

---

## 3. Frontend Checklist

- [ ] Add `withCredentials: true` to Axios.
- [ ] Save `accessToken` in memory / auth state.
- [ ] If 401 Unauthorized → call `/refresh` to get a new `accessToken`.
- [ ] Show errors from `error.response.data.errors` on form inputs.
