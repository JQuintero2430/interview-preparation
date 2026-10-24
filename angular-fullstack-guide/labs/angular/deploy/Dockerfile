# labs/angular/deploy/Dockerfile — documented only, not built: Docker is not run in the labs
# Build context: labs/angular, so the paths below are relative to that folder: docker build -f deploy/Dockerfile .
# (No parser directive such as "# syntax=": Docker reads those only above every other line, and this comment is first.)

# Build stage: Node and the Angular CLI live here, and nothing in it reaches the final image unless a COPY --from takes it.
FROM node:24-alpine AS build
# Every later path in this stage is relative to /app.
WORKDIR /app

# Copy only the manifest and the lockfile first, so this layer and the install below stay cached until a dependency changes.
COPY package.json package-lock.json ./
# npm ci installs exactly what the lockfile pins; the cache mount keeps npm's download folder between builds, so a rebuilt layer downloads only new packages.
RUN --mount=type=cache,target=/root/.npm npm ci
# The sources change most often, so they come after the install: an edit then rebuilds only this layer and the build below.
COPY . .
# ng build uses the production configuration by default (angular.json); the output lands in dist/labs/browser.
RUN npx ng build

# Runtime stage: a non-root Nginx on port 8080, with no Node, no node_modules and no CLI.
FROM nginx/nginx-unprivileged:1.31.8
# Only the browser folder is copied, so the image holds the static files and nothing from the build toolchain.
COPY --from=build /app/dist/labs/browser/ /usr/share/nginx/html/
# Section 3 writes this template (SPA fallback, caching headers); the image's entrypoint renders /etc/nginx/templates/*.template into /etc/nginx/conf.d at start.
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
# Section 5 writes this template and the script that turns it into config.json when the container starts, so no environment's values are baked into the image.
COPY deploy/config/config.json.template /opt/app/config.json.template
# The entrypoint runs a script in /docker-entrypoint.d only if it is executable, hence --chmod.
COPY --chmod=755 deploy/docker-entrypoint.d/40-write-config.sh /docker-entrypoint.d/40-write-config.sh
# The base image already sets this user (UID 101); stating it keeps the file honest and lets a test read it.
USER 101
# The unprivileged image listens on 8080, not 80.
EXPOSE 8080
