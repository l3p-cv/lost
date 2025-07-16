FROM node:24.0.0-slim
COPY --from=oven/bun:debian /usr/local/bin/bun /usr/local/bin/bun

# install nginx
RUN apt update && apt install -y nginx
ADD nginx.conf /etc/nginx/sites-available/default

# install dependencies
WORKDIR /code/lost
ADD lost/package.json .
RUN bun install

# add project sourcecode
ADD lost /code/lost

RUN bun run build

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
