# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/tabdash/companion

COPY package.json ./

ARG PUBLIC_BACKEND_BASE
ENV PUBLIC_BACKEND_BASE=$PUBLIC_BACKEND_BASE

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /usr/src/tabdash/companion/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]