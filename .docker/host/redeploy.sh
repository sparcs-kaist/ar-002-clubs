REMOTE_REPO="ghcr.io"

IMAGE_NAME_FRONT="ghcr.io/sparcs-kaist/sparcs-clubs-front:latest"
CONTAINER_NAME_FRONT="sparcs-clubs-front"
PORT_NUMBER_FRONT=14000

IMAGE_NAME_BACK="ghcr.io/sparcs-kaist/sparcs-clubs-back:latest"
CONTAINER_NAME_BACK="sparcs-clubs-back"
PORT_NUMBER_BACK=14001

echo $2 | docker login $REMOTE_REPO -u $1 --password-stdin
docker pull $IMAGE_NAME_FRONT
docker pull $IMAGE_NAME_BACK
docker stop $CONTAINER_NAME_FRONT
docker stop $CONTAINER_NAME_BACK
docker system prune -f
docker run -p $PORT_NUMBER_FRONT:80 -d --name=$CONTAINER_NAME_FRONT --restart unless-stopped $IMAGE_NAME_FRONT
docker run -p $PORT_NUMBER_BACK:80 -d --name=$CONTAINER_NAME_BACK --env-file .env.back --restart unless-stopped $IMAGE_NAME_BACK
docker logout