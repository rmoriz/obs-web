FROM node:16-alpine
RUN apk add --no-cache git
COPY . .
RUN npm i && npm run build
USER node
EXPOSE 5000
ENTRYPOINT [ "npm", "run", "start" ]
LABEL org.opencontainers.image.source="https://github.com/Niek/obs-web"