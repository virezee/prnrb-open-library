FROM oven/bun:1.3.5-alpine
WORKDIR /prnrb-open-library-backend
COPY package.json bun.lock ./
RUN bun i
RUN bunx prisma generate
RUN bunx prisma migrate dev --name init
COPY . .
RUN bun run build
CMD ["bun", "run", "start"]