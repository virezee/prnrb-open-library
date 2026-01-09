# **📚 MRERN Open Library**
An **Open Library System** powered by the **PRNRB Stack** (**PostgreSQL, Redis, NestJS, React, Bun**), fetching book data from the **Open Library API**.

---

## **🌟 Key Features**
- 📖 **Browse & Search Books**
- 🔗 **Internal GraphQL Implementation**
- ⚡ **State Management with Redux**
- 🔐 **Opaque-Based Authentication**
- 📧 **Email Verification**
- 🔑 **Google OAuth 2.0**

---

## **📋 Prerequisites**
Before setting up the project, ensure you have the following installed:
- 🐘 **PostgreSQL** → [Download](https://www.postgresql.org/download/)
- 🐋 **Docker** → [Download](https://docs.docker.com/get-started/get-docker/)
- 🟥 **Redis Stack** → [Download (via Docker)](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-stack/docker/)
- ✉️ **Mailpit** → [Download (via Docker)](https://mailpit.axllent.org/docs/install/docker/)
- 🥟 **Bun** → [Download](https://bun.com/)

---

## **📂 Clone & Setup**
###  1️⃣ Clone the Repository 🔄
```sh
git clone https://github.com/virezee/prnrb-open-library.git
cd prnrb-open-library
```

### 2️⃣ Install Dependencies 🛠️
#### ⚙️ Backend 🌐
```sh
cd server
bun i
```

#### 🖥️ Frontend 📱
```sh
cd ../client
bun i
```

###  3️⃣ Configure Environment Variables 🔧
Copy the `.env.example` files to `.env` in both the **backend** and **frontend** directories.
Each environment file must be placed in its respective service directory:  
- Backend → `server/.env`
- Frontend → `client/.env`

#### ⚙️ Backend 🌐
Navigate to the project root and create `.env` inside `server/` directory:
```sh
cd ..

# Linux/macOS
cp server/.env.example server/.env

# Windows (cmd)
copy server\.env.example server\.env

# Windows (PowerShell)
Copy-Item server/.env.example server/.env 
```

Modify `.env` with your configuration:
```env
DB_URL=postgresql://<your_database_user>:<your_database_password>@<your_database_host>:5432/prnrb_open_library?schema=<your_schema>
REDIS_URL=redis://<your_redis_username_if_any>:<your_redis_password>@<your_host>:6379
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@prnrb-open-library.net
DOMAIN=localhost
PORT=3000
CLIENT_PORT=5173
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
PEPPER=<your_pepper>
```
> [!NOTE]
> **Replace values inside <...> with your actual configuration credentials (Databases, Email, Google OAuth, etc.).**

#### 🖥️ Frontend 📱
Create `.env` inside `client/` directory:
```sh
# Linux/macOS
cp client/.env.example client/.env

# Windows (cmd)
copy client\.env.example client\.env

# Windows (PowerShell)
Copy-Item client/.env.example client/.env
```

---

## **🚀 Running the Application**
### **🚧 Development Mode**
#### ⚙️ Backend 🌐
```sh
cd server
docker run -d --name redis-stack --restart unless-stopped -e REDIS_ARGS="--requirepass <your_redis_password>" -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
docker run -d --name=mailpit --restart unless-stopped -e TZ=Europe/London -p 8025:8025 -p 1025:1025 axllent/mailpit
bun run start:dev
```
> [!NOTE]
> **Mailpit will run on http://localhost:8025 to preview verification codes.**

#### 🖥️ Frontend 📱
```sh
cd ../client
bun run dev
```

### **🏭 Production Mode**
Before running the application in production, make sure to modify the `.env` in both `server/.env` and `client/.env`.

For `server/.env`:
```sh
PORT=3001
CLIENT_PORT=3000
```
For `client/.env`:
```sh
VITE_SERVER_PORT=3001
```
> [!IMPORTANT]
> **Make sure to keep the rest of your `.env` configurations intact.**

#### ⚙️ Backend 🌐
```sh
cd ../server
bun run build
bun run start
```

#### 🖥️ Frontend 📱
```sh
cd ../client
bun run build
bunx serve -s dist
```

---

## **🐳 Running with Docker (Optional)**
If you prefer running the application inside Docker containers, modify the `.env` in both `server/.env` and `client/.env`.
### 1️⃣ Configure Environment Variables 🔧
For `server/.env`:
```env
DB_HOST=DB_URL=postgresql://<your_database_user>:<your_database_password>@host.docker.internal:5432/prnrb_open_library?schema=<your_schema>
REDIS_URL=redis://<your_redis_username_if_any>:<your_redis_password>@redis:6379
MAIL_HOST=mailpit
PORT=3001
CLIENT_PORT=3000
```
For `client/.env`:
```env
VITE_SERVER_PORT=3001
```
> [!IMPORTANT]
> **Make sure to keep the rest of your `.env` configurations intact.**

### 2️⃣ Start Containers 🚢
```sh
docker compose up -d
```

### 3️⃣ Stop Containers ⛔
```sh
docker compose down -v
```

---

### 🙌 Acknowledgments
Special thanks to Open Library API for providing free and open access to book data.

---

### 👤 Author
Developed by [Zee](https://github.com/virezee). Feel free to contribute or provide feedback!