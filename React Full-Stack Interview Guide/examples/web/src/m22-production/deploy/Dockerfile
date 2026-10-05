# syntax=docker/dockerfile:1
# Sample only: not built or run when this guide was written (module 22, Exercise 2).

# ---- Stage 1: build the static bundle ----
FROM node:24-alpine AS build
WORKDIR /app

# Copy only the manifests first so this layer (and the install) is cached until dependencies change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Baked into the bundle at build time (import.meta.env.VITE_RELEASE).
ARG VITE_RELEASE=dev
ENV VITE_RELEASE=$VITE_RELEASE
RUN npm run build

# ---- Stage 2: serve it. Node, node_modules and sources are NOT in this image. ----
FROM nginx:stable-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
