# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/tabdash/extension

COPY package.json ./

ARG VITE_COMPANION_BASE
ARG VITE_BACKEND_BASE
ARG VITE_IS_EXTENSION
ARG VITE_OPENWEATHER_API_KEY
ARG VITE_UNSPLASH_API_KEY

ENV VITE_COMPANION_BASE=$VITE_COMPANION_BASE
ENV VITE_BACKEND_BASE=$VITE_BACKEND_BASE
ENV VITE_IS_EXTENSION=$VITE_IS_EXTENSION
ENV VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY
ENV VITE_UNSPLASH_API_KEY=$VITE_UNSPLASH_API_KEY

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /usr/src/tabdash/extension/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3003

CMD ["nginx", "-g", "daemon off;"]