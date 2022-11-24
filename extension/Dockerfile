FROM node:alpine

WORKDIR /usr/src/tabdash/extension

COPY package.json ./

ENV VITE_COMPANION_BASE https://tabdash.wesley.fyi
ENV VITE_IS_EXTENSION false

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3003

CMD [ "npm", "run", "serve" ]