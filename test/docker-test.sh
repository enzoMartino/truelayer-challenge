#!/bin/bash
set -e

IMAGE_NAME="pokedex-test-img"
CONTAINER_NAME="pokedex-test-container"
PORT=3001

echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🚀 Starting container..."
# Remove if exists (ignore error)
docker rm -f $CONTAINER_NAME 2>/dev/null || true
docker run -d --name $CONTAINER_NAME -p $PORT:3000 -e NODE_ENV=production $IMAGE_NAME

echo "⏳ Waiting for application to start..."
# efficient wait loop
max_retries=30
count=0
while ! curl -s http://localhost:$PORT/health > /dev/null; do
    sleep 1
    count=$((count+1))
    if [ $count -ge $max_retries ]; then
        echo "❌ Application failed to start within $max_retries seconds"
        docker logs $CONTAINER_NAME
        docker rm -f $CONTAINER_NAME
        exit 1
    fi
done

echo "✅ App is up!"

echo "🧪 Testing endpoint..."
RESPONSE=$(curl -s http://localhost:$PORT/v1/pokemon/pikachu)

if echo "$RESPONSE" | grep -q "pikachu"; then
    echo "✅ Test Passed: Pikachu found in response"
else
    echo "❌ Test Failed: Response did not contain 'pikachu'"
    echo "Response: $RESPONSE"
    docker rm -f $CONTAINER_NAME
    exit 1
fi

echo "🧹 Cleaning up..."
docker rm -f $CONTAINER_NAME

echo "✨ Docker verified successfully!"
exit 0
