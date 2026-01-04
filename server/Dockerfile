FROM oven/bun:1.3.5-alpine
WORKDIR /prnrb-open-library-backend
COPY package.json bun.lock prisma.config.ts .env ./
COPY src/infrastructure/prisma/schema.prisma src/infrastructure/prisma/schema.prisma
RUN bun i
RUN bunx prisma generate
RUN bunx prisma db push
COPY . .
RUN bun run build
CMD ["bun", "run", "start"]