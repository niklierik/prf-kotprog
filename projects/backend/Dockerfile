FROM node:22-alpine

WORKDIR "/home/node/app/projects/backend"

RUN yarn install

EXPOSE 3000
EXPOSE 9229

CMD ["/bin/sh", "-c", "yarn run dev"]
