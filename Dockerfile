FROM node:8.12.0-alpine

ARG FOLDER=flappysanta

COPY . /$FOLDER/

ENV PORT=8080

RUN chmod +x $FOLDER/entrypoint.sh

ENTRYPOINT ["sh","flappybat/entrypoint.sh"]