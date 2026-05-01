# CAFE Backend

Express.js backend for the CAFE fullstack application with MySQL database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `.env` with your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=cafe_db
     PORT=5000
     ```

3. **Ensure MySQL is running:**
   - Make sure your MySQL server is running on the specified host
   - Database `cafe_db` must exist and be properly configured

## Running the Server

```bash
npm start
```

Or for development:
```bash
npm run dev
```

The server will run on `http://localhost:5000` (or the PORT specified in `.env`)

## Database Connection

The backend connects to MySQL with credentials from environment variables. Connection errors will be logged to the console.

## API Routes

- `/branches` - Branch management
- `/employees` - Employee management
- `/menu` - Menu items
- `/customers` - Customer management
- `/orders` - Order management
- `/payments` - Payment processing
- `/feedback` - Customer feedback
- `/inventory` - Inventory management
- `/cart` - Shopping cart
- `/register` - User registration
- `/login` - User login
- `/user/:id` - User profile
- `/specials` - Top 3 rated items
- `/stats` - Order statistics
- `/checkout` - Order checkout
