.PHONY: start stop dev help

# Путь к приложению
APP_DIR = powerlift-tracker

# Запуск dev сервера на порту 3000
start:
	@echo "🚀 Запускаю dev сервер на порту 3000..."
	@cd $(APP_DIR) && npm run dev -- --port 3000

# Остановка dev сервера
stop:
	@echo "🛑 Останавливаю dev сервер..."
	@-pkill -f "next dev" 2>/dev/null && echo "✅ Сервер остановлен" || echo "⚠️  Сервер уже остановлен"
	@-pkill -f "node.*next" 2>/dev/null || true

# Алиас для start
dev: start

# Показать доступные команды
help:
	@echo "📋 Доступные команды:"
	@echo "  make start  - Запустить dev сервер на порту 3000"
	@echo "  make stop   - Остановить dev сервер"
	@echo "  make dev    - Алиас для start"
	@echo "  make help   - Показать эту справку"

