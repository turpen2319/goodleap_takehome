# Spin up all services
app:
    docker compose up --build

# Run backend only
backend:
    docker compose up --build backend

# Run frontend only
frontend:
    docker compose up --build frontend

# Stop all services
down:
    docker compose down
