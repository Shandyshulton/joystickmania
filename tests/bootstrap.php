<?php

/**
 * Bootstrap PHPUnit.
 *
 * Alasan file ini ada: phpdotenv Laravel bersifat immutable, jadi variabel
 * environment yang sudah ada di shell MENANG atas .env.testing. Kalau shell
 * developer pernah meng-export kredensial produksi (mis.
 * DB_USERNAME=<user_db_produksi>), suite test diam-diam berjalan dengan kredensial
 * produksi. phpunit.xml tetap memaksa host/port/database, jadi satu-satunya yang
 * perlu dibersihkan adalah kunci yang harusnya datang dari .env.testing.
 */
$poisoned = [
    'APP_KEY',
    'DB_USERNAME',
    'DB_PASSWORD',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
    'REQUEST_PAYLOAD_KEY',
];

$found = [];

foreach ($poisoned as $key) {
    if (getenv($key) !== false || isset($_ENV[$key]) || isset($_SERVER[$key])) {
        $found[] = $key;
    }

    putenv($key);
    unset($_ENV[$key], $_SERVER[$key]);
}

if ($found !== []) {
    fwrite(STDERR, sprintf(
        "[phpunit] Membersihkan variabel environment shell: %s. Nilai ini akan diambil dari .env.testing.\n",
        implode(', ', $found),
    ));
}

require __DIR__.'/../vendor/autoload.php';
