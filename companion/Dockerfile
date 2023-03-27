FROM node:19

WORKDIR /usr/src/tabdash/companion

COPY package.json ./

ARG PUBLIC_BACKEND_BASE

ENV PUBLIC_BACKEND_BASE PUBLIC_BACKEND_BASE

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "preview" ]