import { defineConfig } from '@prisma/client'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
  adapter: {
    type: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
})
