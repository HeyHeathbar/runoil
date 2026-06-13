# Debian (glibc) base — git is required at runtime (the Corpus shells out to
# system git), and glibc avoids native-module (sharp) friction during install.
FROM node:22-bookworm-slim AS development-dependencies-env
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm ci

FROM node:22-bookworm-slim AS production-dependencies-env
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS build-env
# Publishable key is public (client-side); injected at build so Vite can inline
# it. The secret key is NEVER a build arg — it's a runtime secret only.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-bookworm-slim
# git: the Corpus is a git-backed OKF bundle and commits via system git.
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
