FROM node:18-bullseye-slim

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node . .
RUN npm install && npm run build && npm prune --production

CMD [ "npm", "start" ]
