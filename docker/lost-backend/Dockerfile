ARG base_image=gitlab.l3portal.de:5555/l3p-cv/lost/base/backend:0.1
FROM $base_image
ADD /docker/lost-backend/entrypoint.sh /
ADD /backend/lostapi /code/lostapi
ADD /backend/lostcore/ /code/lostcore