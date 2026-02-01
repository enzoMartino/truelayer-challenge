#!/bin/bash
set -e

echo "🐳 Starting Docker Compose..."
# Clean start
docker-compose down -v --remove-orphans 2>/dev/null || true
docker-compose up -d --build

PORT=3000

echo "⏳ Waiting for application to start on port $PORT..."
# efficient wait loop
max_retries=30
count=0
while ! curl -s http://localhost:$PORT/health > /dev/null; do
    sleep 1
    count=$((count+1))
    if [ $count -ge $max_retries ]; then
        echo "❌ Application failed to start within $max_retries seconds"
        docker-compose logs
        docker-compose down
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
    docker-compose down
    exit 1
fi

echo "🧹 Cleaning up..."
docker-compose down

echo "✨ Docker Compose verified successfully!"
exit 0
