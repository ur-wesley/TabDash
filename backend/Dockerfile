FROM node:alpine

WORKDIR /usr/src/tabdash/backend

ARG DB_PATH
ARG PORT

ENV DB_PATH DB_PATH
ENV PORT PORT

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3005

CMD [ "npm", "run", "start" ]