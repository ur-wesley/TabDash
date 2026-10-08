FROM oven/bun:1-alpine

WORKDIR /usr/src/tabdash/backend

COPY package.json ./
RUN bun install --production

COPY . .

ENV PORT=3005
ENV DB_PATH=/opt/TabDash-data
EXPOSE 3005

CMD [ "bun", "src/index.ts" ]