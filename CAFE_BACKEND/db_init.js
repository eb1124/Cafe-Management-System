const db = require("./db");

const tables = [
  `CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    manager VARCHAR(255) NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    branchId INT,
    phone VARCHAR(20) NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability TINYINT DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT,
    branchId INT,
    orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalAmount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending'
  )`,

  `CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT,
    amount DECIMAL(10, 2) NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paymentStatus VARCHAR(50) DEFAULT 'Pending'
  )`,

  `CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comments TEXT,
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS inventory (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    supplier VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    item_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL
  )`
];

const autoIncrementColumns = {
  customers: 'id',
  orders: 'id',
  payments: 'id',
  users: 'id'
};

function ensureAutoIncrement(tableName, callback) {
  const idColumn = autoIncrementColumns[tableName];
  if (!idColumn) {
    return callback();
  }

  db.query(`SHOW CREATE TABLE \`${tableName}\``, (err, rows) => {
    if (err) {
      console.error(`❌ Failed to inspect table ${tableName}:`, err.message);
      return callback();
    }

    const createStatement = rows[0]['Create Table'];
    if (/AUTO_INCREMENT/i.test(createStatement)) {
      return callback();
    }

    const alterSql = `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${idColumn}\` INT NOT NULL AUTO_INCREMENT`;
    db.query("SET FOREIGN_KEY_CHECKS=0", (fkErr) => {
      if (fkErr) {
        console.error(`❌ Failed to disable foreign key checks for ${tableName}:`, fkErr.message);
        return callback();
      }

      db.query(alterSql, (alterErr) => {
        if (alterErr) {
          console.error(`❌ Failed to fix AUTO_INCREMENT for ${tableName}.${idColumn}:`, alterErr.message);
        } else {
          console.log(`🔧 Fixed AUTO_INCREMENT on ${tableName}.${idColumn}`);
        }

        db.query("SET FOREIGN_KEY_CHECKS=1", (resetErr) => {
          if (resetErr) {
            console.error(`❌ Failed to re-enable foreign key checks after altering ${tableName}:`, resetErr.message);
          }
          callback();
        });
      });
    });
  });
}

function createTablesSequentially(index = 0) {
  if (index >= tables.length) {
    console.log('✅ All database tables verified/created!');
    return;
  }

  const tableSql = tables[index];
  const tableNameMatch = tableSql.match(/^CREATE TABLE IF NOT EXISTS\s+`?(\w+)`?/i);
  const tableName = tableNameMatch ? tableNameMatch[1] : `table_${index}`;

  db.query(tableSql, (err) => {
    if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error(`❌ Error creating table ${tableName}:`, err.message);
      return createTablesSequentially(index + 1);
    }

    console.log(`✅ Table ${index + 1}/${tables.length} (${tableName}) ready`);
    ensureAutoIncrement(tableName, () => createTablesSequentially(index + 1));
  });
}

createTablesSequentially();
