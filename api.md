# API Documentation

**Version:** 1.0
**Base URL:** `https://api.yourproject.com/v1`

---

## Introduction

Welcome to the [Project Name] API! This document provides all the information you need to interact with our platform programmatically.

## Authentication

All API requests must be authenticated. We use **Bearer Token** authentication.

Include your API key in the `Authorization` header with every request:

`Authorization: Bearer YOUR_API_KEY`

You can obtain an API key from your user dashboard. Requests without a valid key will result in a `401 Unauthorized` error.

## Rate Limiting

Authenticated users are limited to **1000 requests per hour**. The current rate limit status is returned in the following HTTP headers with each response:

-   `X-RateLimit-Limit`: The total number of requests allowed in the current window.
-   `X-RateLimit-Remaining`: The number of requests remaining in the current window.
-   `X-RateLimit-Reset`: The UTC epoch timestamp when the rate limit will reset.

Exceeding the rate limit will result in a `429 Too Many Requests` error.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error (4xx or 5xx), the response body will contain a JSON object with more details:

```json
{
  "error": {
    "code": "resource_not_found",
    "message": "The requested user does not exist."
  }
}
```

| Status Code | Meaning               | Description                                           |
| :---------- | :-------------------- | :---------------------------------------------------- |
| `400`       | Bad Request           | The request was malformed (e.g., invalid JSON).       |
| `401`       | Unauthorized          | Authentication failed or was not provided.            |
| `403`       | Forbidden             | The authenticated user does not have permission.      |
| `404`       | Not Found             | The requested resource does not exist.                |
| `429`       | Too Many Requests     | You have exceeded the rate limit.                     |
| `500`       | Internal Server Error | Something went wrong on our end. Please try again.    |

---

## Resources

### Users

The User resource represents an individual account on the platform.

#### `GET /users`

Retrieves a list of all users. Supports pagination.

**Query Parameters:**
-   `page` (integer, optional, default: 1): The page number to retrieve.
-   `limit` (integer, optional, default: 20): The number of items per page.

**Responses:**
-   `200 OK`: A paginated list of user objects.

```json
{
  "data": [
    {
      "id": "usr_123",
      "email": "user1@example.com",
      "created_at": "2023-10-27T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### `POST /users`

Creates a new user.

**Request Body:** (`application/json`)

```json
{
  "email": "newuser@example.com",
  "password": "a-very-strong-password"
}
```

**Responses:**
-   `201 Created`: The user was created successfully. The response body contains the new user object.
-   `400 Bad Request`: The email is invalid or the password is too weak.

#### `GET /users/{id}`

Retrieves a specific user by their ID.

**Path Parameters:**
-   `id` (string, required): The unique identifier of the user (e.g., `usr_123`).

**Responses:**
-   `200 OK`: The user object.
-   `404 Not Found`: No user was found with the given ID.

#### `PUT /users/{id}`

Updates a specific user.

**Path Parameters:**
-   `id` (string, required): The unique identifier of the user.

**Request Body:** (`application/json`)

```json
{
  "email": "updated.email@example.com"
}
```

**Responses:**
-   `200 OK`: The updated user object.
-   `404 Not Found`: No user was found with the given ID.

#### `DELETE /users/{id}`

Permanently deletes a user.

**Path Parameters:**
-   `id` (string, required): The unique identifier of the user.

**Responses:**
-   `204 No Content`: The user was successfully deleted.
-   `404 Not Found`: No user was found with the given ID.