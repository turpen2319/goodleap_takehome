# Spin up all services
app: backend

# Run backend
backend:
    docker compose up --build backend

# Stop all services
down:
    docker compose down
