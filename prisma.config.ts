// Prisma 7 config — the `url` was moved out of schema.prisma into this file.
// This file is loaded by the Prisma CLI (prisma generate, db push, studio, etc.)
// and by the runtime client when no driver adapter is provided.
//
// Docs: https://www.prisma.io/docs/orm/reference/prisma-config-reference

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
