# Docker

[![](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg?style=for-the-badge)](https://hub.docker.com/r/babilling/flappysanta/)

- Build it yourself : 
```
docker build -t flappysanta .
```

- Run it from Dockerhub : 
```
docker run --name flappysanta -d -v myvolumedb:/flappysanta/database.db -v myvolumelog:/opt/log/ -p YOURPORT:8080 babilling/flappysanta
```
