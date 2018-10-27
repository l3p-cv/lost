FROM python:3.6-slim-jessie
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
RUN chmod o+r /etc/resolv.conf
RUN apt-get update && apt-get install -y --no-install-recommends python3-venv python3-pip apt-utils wget nano htop vim
RUN pip3 install --upgrade pip

WORKDIR /code
ADD /docker/lost-backend-base/requirements.txt /code
RUN pip3 install -r requirements.txt
