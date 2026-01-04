FROM oven/bun:1.3.5-alpine
WORKDIR /prnrb-open-library-frontend
COPY package.json bun.lock ./
RUN bun i
COPY . .
RUN bun run build
CMD ["bunx", "serve", "-s", "dist"]