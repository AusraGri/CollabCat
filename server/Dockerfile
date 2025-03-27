FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app

# Copy package.json files and install dependencies
# On the server build we could prune the client dependencies
# and after the build stage we could install only the non-dev
# dependencies, though we will keep this simple.
COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci

# Copy over the server source code
COPY server/ server/

ARG TOKEN_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG AUTH0_AUDIENCE
ARG AUTH0_DOMAIN
ARG AUTH0_CLIENT_ID
ARG AUTH0_CLIENT_SECRET
ARG CLIENT_ORIGIN_URL

ENV TOKEN_KEY=$TOKEN_KEY
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV AUTH0_AUDIENCE=$AUTH0_AUDIENCE
ENV AUTH0_DOMAIN=$AUTH0_DOMAIN
ENV AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID
ENV AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET
ENV CLIENT_ORIGIN_URL=$CLIENT_ORIGIN_URL

# Build the server
WORKDIR /app/server
RUN npm run build

EXPOSE 3000

# Command Docker runs when it starts the container.
# In our case, this command is specified in server/package.json
# which does migrations and then starts the server.
CMD ["npm", "run", "prod"]
