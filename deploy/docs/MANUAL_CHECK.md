# Các lệnh hay dùng

```bash
docker compose -p server-dev -f auth.yml down
docker compose -p server-dev -f auth.yml up -d --build
docker exec -it server-dev-auth /bin/bash
dotnet Cts.AuthServer.dll &
cat Logs/logs.txt 
```