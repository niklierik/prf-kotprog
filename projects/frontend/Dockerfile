FROM node:22-alpine

WORKDIR "/home/node/app/projects/frontend"

RUN yarn install

EXPOSE 4200

CMD ["/bin/sh", "-c", "yarn run start"]
