# Travel Backend

NestJS backend for authentication and user management.

## Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT authentication
- Bcrypt password hashing
- Class validator and class transformer

## Setup

1. Copy `.env.example` to `.env` and update the PostgreSQL connection values.
2. Install dependencies.
3. Start the app in development mode.

## Scripts

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`

## API

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users`
- `GET /users/me`
- `GET /users/:id`
- `PATCH /users/me`
- `PATCH /users/:id`
- `DELETE /users/me`
- `DELETE /users/:id`
