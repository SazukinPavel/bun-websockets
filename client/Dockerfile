FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .

EXPOSE ${CLIENT_PORT}

CMD ["npm", "run", "dev"]