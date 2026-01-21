# JMeter тесты для ЛР2

## Тестовый план

**Файл:** `concurrent-import-test.jmx`

**Описание:** 3 пользователя одновременно импортируют разные файлы с одинаковыми уникальными полями (имя + дата начала). Только 1 должен успеть, остальные получают ошибку уникальности.

---

## Инструкция по запуску

### 1. Запуск Backend на сервере

```bash
# Подключение к серверу
ssh hel

# Переход в директорию проекта
cd ~/IS/lab2/backend

# Сборка (если нужно)
export JAVA_TOOL_OPTIONS='-Xmx256m'
export MAVEN_OPTS='-Xmx256m'
mvn clean package -DskipTests -q

# Запуск backend
export JAVA_TOOL_OPTIONS='-Xmx256m -Djava.io.tmpdir=/home/studs/s413122/tmp'
nohup java -jar target/worker-management-system-1.0.0.jar > ~/IS/lab2/app.log 2>&1 &

# Проверка что запустился
tail -f ~/IS/lab2/app.log
# Ждём "Started WorkerManagementSystemApplication"
# Ctrl+C для выхода из tail
```

### 2. Создание тестового пользователя (если нет)

```bash
# На сервере
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123", "role": "ADMIN"}'
```

### 3. Очистка БД перед тестом

```bash
# На сервере
psql -h pg -d studs -c "DELETE FROM worker; DELETE FROM import_history;"
```

### 4. Загрузка тестовых файлов на сервер

```bash
# С локальной машины
rsync -avz /Users/myasnov/IS/lab2/jmeter/ hel:~/IS/lab2/jmeter/
```

### 5. Запуск JMeter на сервере (CLI режим)

```bash
# На сервере
cd ~/IS/lab2/jmeter

# Запуск теста в консольном режиме
jmeter -n -t concurrent-import-test.jmx -l results.jtl -e -o report/

# Параметры:
# -n : non-GUI режим (обязательно для сервера без дисплея)
# -t : путь к тестовому плану
# -l : файл для записи результатов
# -e : генерация HTML отчёта после теста
# -o : директория для HTML отчёта
```

**Если JMeter не установлен на сервере:**

```bash
# Скачивание JMeter
cd ~
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.3.tgz
tar -xzf apache-jmeter-5.6.3.tgz

# Добавление в PATH
export PATH=$PATH:~/apache-jmeter-5.6.3/bin

# Запуск
cd ~/IS/lab2/jmeter
jmeter -n -t concurrent-import-test.jmx -l results.jtl
```

### 6. Просмотр результатов

```bash
# Просмотр лога результатов
cat results.jtl

# Или проверка БД
psql -h pg -d studs -c "SELECT COUNT(*) FROM worker;"
# Должен быть 1 (только один импорт успешен)

# История импорта
psql -h pg -d studs -c "SELECT id, status, addedcount FROM import_history;"
# 1 SUCCESS, 2 FAILED (или не записаны из-за отката)
```

---

## Альтернатива: Запуск JMeter локально

Если JMeter установлен локально, можно тестировать через SSH туннель:

```bash
# Терминал 1: SSH туннель
ssh -L 8081:localhost:8081 hel -N

# Терминал 2: Запуск JMeter с GUI
cd /Users/myasnov/IS/lab2/jmeter
jmeter -t concurrent-import-test.jmx
```

---

## Тестовые файлы

| Файл | Уникальные поля | Другие данные |
|------|-----------------|---------------|
| `import_user1.json` | name: "Уникальный Тест", startDate: 2024-12-15 | salary: 50000, DEVELOPER |
| `import_user2.json` | name: "Уникальный Тест", startDate: 2024-12-15 | salary: 60000, ENGINEER |
| `import_user3.json` | name: "Уникальный Тест", startDate: 2024-12-15 | salary: 70000, LEAD_DEVELOPER |

---

## Ожидаемый результат

- **1 поток:** SUCCESS (200) — импорт успешен
- **2 потока:** FAILED (400) — ошибка уникальности: "Работник с именем 'Уникальный Тест' и датой начала работы уже существует"

Это демонстрирует корректную работу:
1. Уровня изоляции транзакций (`SERIALIZABLE`)
2. Программных ограничений уникальности
