FROM node:8.12.0-alpine

COPY . /flappysanta/

ENV PORT=8080

USER 0

RUN chmod +x flappysanta/entrypoint.sh

ENTRYPOINT ["sh","flappysanta/entrypoint.sh"]
