<?php
// db.php - simple PDO helper. Configure DB_* constants in this file or via environment.
// Edit these values to match your MySQL server.

if (!defined('DB_HOST')) {
  define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
}
if (!defined('DB_NAME')) {
  define('DB_NAME', getenv('DB_NAME') ?: 'royalsandnobles');
}
if (!defined('DB_USER')) {
  define('DB_USER', getenv('DB_USER') ?: 'root');
}
if (!defined('DB_PASS')) {
  define('DB_PASS', getenv('DB_PASS') ?: '');
}

function getDbConnection() {
  static $pdo = null;
  if ($pdo) return $pdo;
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
  try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
  } catch (Exception $e) {
    error_log('DB connect error: ' . $e->getMessage());
    throw $e;
  }
}

?>
