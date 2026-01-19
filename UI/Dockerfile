# -------- BUILD STAGE --------
FROM node:20 AS build
WORKDIR /app

COPY UI/package*.json ./
RUN npm install

COPY UI/ .
RUN npm run build

# -------- RUNTIME STAGE --------
FROM nginx:alpine

# 🔥 COPY whatever is inside dist (no hardcoding)
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80