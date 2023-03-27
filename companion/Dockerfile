FROM node:19

WORKDIR /usr/src/tabdash/companion

COPY package.json ./

ENV SECRET_DB_LOCATION ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "preview" ]