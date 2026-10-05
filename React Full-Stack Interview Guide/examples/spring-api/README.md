# spring-api

A small Spring Boot API for projects. It stores data in memory, seeded with 25 projects (ids 1-25). CORS is open to the Vite dev client at `http://localhost:5173` for `/api/**`.

## Run

From the guide's root directory:

```bash
cd "examples/spring-api"
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

## Test

From the same `examples/spring-api` directory:

```bash
mvn verify
```

## curl examples

List projects (`page` >= 0, `size` 1-50, defaults 0 and 10):

```bash
# 200
curl -i "http://localhost:8080/api/projects?page=0&size=5"
# 400: size above 50
curl -i "http://localhost:8080/api/projects?size=100"
```

Get one project:

```bash
# 200
curl -i "http://localhost:8080/api/projects/1"
# 404
curl -i "http://localhost:8080/api/projects/9999"
```

Create a project (`name` required, not blank, max 60 characters). On success the `Location` header points to the new project:

```bash
# 201
curl -i -X POST "http://localhost:8080/api/projects" \
  -H "Content-Type: application/json" \
  -d '{"name":"New project"}'
# 400: blank name
curl -i -X POST "http://localhost:8080/api/projects" \
  -H "Content-Type: application/json" \
  -d '{"name":"   "}'
```

CORS preflight from the dev client:

```bash
# 200 with Access-Control-Allow-Origin: http://localhost:5173
curl -i -X OPTIONS "http://localhost:8080/api/projects" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
# 403: origin not allowed
curl -i -X OPTIONS "http://localhost:8080/api/projects" \
  -H "Origin: http://evil.example" \
  -H "Access-Control-Request-Method: POST"
```
