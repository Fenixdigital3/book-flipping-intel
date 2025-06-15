
.PHONY: help install test test-unit test-integration lint format run docker-build docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  install          Install dependencies"
	@echo "  test             Run all tests"
	@echo "  test-unit        Run unit tests only"
	@echo "  test-integration Run integration tests only"
	@echo "  lint             Run code linting"
	@echo "  format           Format code"
	@echo "  run              Run development server"
	@echo "  docker-build     Build Docker image"
	@echo "  docker-up        Start Docker services"
	@echo "  docker-down      Stop Docker services"

install:
	pip install -r requirements.txt

test:
	pytest

test-unit:
	pytest tests/unit/ -m "not slow"

test-integration:
	pytest tests/integration/

lint:
	flake8 app tests

format:
	black app tests

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

docker-build:
	docker build -t book-arbitrage-api .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f
