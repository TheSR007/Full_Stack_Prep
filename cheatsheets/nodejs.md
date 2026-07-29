# Node.js & Express REST API Cheatsheet

> Reference guide for building production-grade Express + TypeScript + Prisma + Zod REST APIs, including standard setup steps, clean architecture patterns, and critical pitfalls.

---

## 1. Generic Project Initialization Sequence

For any new Express + TypeScript + Prisma REST API project:

```bash
# 1. Initialize project
mkdir my-api-project
cd my-api-project
npm init -y

# 2. Install Production Dependencies
npm install express cors helmet cookie-parser express-rate-limit jsonwebtoken bcryptjs zod @prisma/client winston morgan swagger-ui-express swagger-jsdoc

# 3. Install Development Dependencies
npm install -D typescript ts-node-dev prisma ts-node jest supertest ts-jest @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/morgan @types/swagger-ui-express @types/swagger-jsdoc @types/jest @types/supertest @types/node dotenv

# 4. Initialize Configs
npx tsc --init
npx prisma init
```

---

## 2. Standard Directory Layout

```
src/
├── app.ts                 # Express app bootstrap, security middleware, & route mounts
├── server.ts              # HTTP server listener & graceful shutdown handlers
├── config/
│   └── config.ts          # Zod environment variable parsing
├── docs/
│   └── swagger.ts         # OpenAPI / Swagger UI config
├── middleware/
│   ├── auth.ts            # JWT Bearer verification & RBAC guard
│   ├── errorHandler.ts    # Centralized Express error handler
│   ├── rateLimiter.ts     # Endpoint & auth rate limiting
│   └── validate.ts        # Generic Zod request validation wrapper
├── modules/
│   ├── auth/              # Auth routes, controller, service, schema
│   └── tasks/             # Task routes, controller, service, schema
└── utils/
    ├── appError.ts        # Custom operational error class
    ├── logger.ts          # Winston logger
    └── prisma.ts          # Singleton Prisma Client
```

---

## 3. Essential Architecture Code Patterns

### 3.1 Environment Parsing (`src/config/config.ts`)
```typescript
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

export const config = envSchema.parse(process.env);
```

### 3.2 Generic Zod Validation Middleware (`src/middleware/validate.ts`)
```typescript
import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { AppError } from "../utils/appError";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join(".").replace(/^(body|query|params)\./, ""),
          message: err.message,
        }));
        next(new AppError(400, "VALIDATION_ERROR", "Invalid request parameters", formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
```

### 3.3 JWT Refresh Token with HttpOnly Cookie
```typescript
// Set HttpOnly refresh token cookie on login/register
res.cookie("refreshToken", tokens.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth",
});
```

---

## 4. Key Pitfalls & Solutions Learned

### Pitfall 1: Unique Constraint Failure on Rapid JWT Refresh Token Creation
- **Symptom**: `Unique constraint failed on the fields: (token)` when calling `register` or `login` in quick succession or within automated tests.
- **Root Cause**: `jwt.sign({ userId, email })` generates identical JWT string tokens if invoked within the same second because `iat` (issued at timestamp in seconds) is identical.
- **Solution**: Always include a unique `jti` (JWT ID) in the payload when signing refresh tokens:
  ```typescript
  import crypto from "crypto";

  const refreshToken = jwt.sign(
    { userId, email, role, jti: crypto.randomUUID() },
    config.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  ```

### Pitfall 2: Prisma 7 Driver Adapters vs Prisma 6
- **Symptom**: `Error P1012: The datasource property url is no longer supported in schema files` or `PrismaClient was instantiated without any options. A driver adapter is required`.
- **Root Cause**: Prisma 7 requires driver adapters (`@prisma/adapter-pg`, `better-sqlite3`) and manages connection URLs via `prisma.config.ts`.
- **Solution**: For zero-config SQLite setups without native build dependencies, lock `@prisma/client` and `prisma` to `^6.4.0` with `url = env("DATABASE_URL")` in `schema.prisma`.

### Pitfall 3: TypeScript Generic Type Error `TS2707` on ZodObject
- **Symptom**: `error TS2707: Generic type ZodObject requires between 1 and 5 type arguments`.
- **Root Cause**: Using `ZodObject` without type arguments as a function parameter type in middleware.
- **Solution**: Use `ZodTypeAny` or `ZodSchema` from `zod` as the parameter type in generic validation wrappers.

### Pitfall 4: Clearing HttpOnly Cookies on Logout
- **Symptom**: Calling `res.clearCookie("refreshToken")` fails to clear the browser cookie.
- **Root Cause**: `res.clearCookie` requires matching the exact `path` option set when the cookie was created.
- **Solution**: Specify `{ path: "/api/v1/auth" }` explicitly when calling `res.clearCookie`.

### Pitfall 5: Express 5 Route Params Typing
- **Symptom**: TypeScript errors when passing `req.params.id` to functions expecting `string`.
- **Root Cause**: Express 5 types `req.params` values as `string | undefined`.
- **Solution**: Type parameter schemas with Zod params check, or cast `req.params.id as string` inside controller handlers.
