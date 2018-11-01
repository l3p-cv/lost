FROM nginx:latest

# Install Backend Dependencies
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
RUN apt-get update && apt-get install -y --no-install-recommends python3.5 python3-pip python3-setuptools cron apt-utils wget
RUN pip install --upgrade pip
RUN apt-get update && apt-get install -y --no-install-recommends python3-dev build-essential libigraph0-dev netcat nano htop
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg vim

WORKDIR /code
ADD /docker/lost-base/requirements.txt /code/
RUN pip install -r requirements.txt
