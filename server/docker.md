# Build and start all 3 services in background mode
```bash
docker-compose up -d --build
```

# Database to run in Docker, but the Server to run locally 
```ps
docker compose up -d mongodb-local mongo-express floci-aws
```

# View server logs
```ps
docker-compose logs -f intellmeet-server
```

# Stop all services
```ps
docker-compose down
```

# mongoDB shell
```ps
docker exec -it intellmeet-mongodb mongosh
```

# aws cli
```bash
# Create an S3 Bucket locally
docker exec -it intellmeet-floci-aws aws s3 mb s3://intellmeet-bucket

# List S3 Buckets
aws --endpoint-url=http://localhost:4566 s3 ls
```