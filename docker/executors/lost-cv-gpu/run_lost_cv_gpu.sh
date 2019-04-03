docker run --runtime=nvidia --name lost-cv-gpu --network "docker_default" --env-file .env --restart=always -v /home/jaeger/losttest/data:/home/lost l3pcv/lost-cv-gpu bash /entrypoint.sh
