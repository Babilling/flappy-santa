FROM node:8.12.0-alpine

COPY . /flappybat/

ENV PORT=8080

RUN chmod +x flappybat/entrypoint.sh

ENTRYPOINT ["sh","flappybat/entrypoint.sh"]