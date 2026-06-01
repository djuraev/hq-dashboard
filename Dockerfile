# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# pin pnpm to match the committed lockfile (avoids corepack policy mismatch)
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# install deps (cache-friendly: lockfile first)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# build
COPY . .
RUN pnpm build

# ---- Serve stage ----
FROM nginx:1.27-alpine AS serve
# SPA routing fallback + listen on 4000
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 4000
CMD ["nginx", "-g", "daemon off;"]
