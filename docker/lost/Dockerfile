ARG base_image=gitlab.l3portal.de:5555/l3p-cv/lost/base/lost-base:latest
FROM $base_image
# Add Code 
ADD /docker/lost/entrypoint.sh /
ADD /docker/lost/nginx/prod.conf /etc/nginx/conf.d/default.conf
ADD /backend/ /code/backend
ADD /frontend/ /code/frontend