<?php

require __DIR__ . '/../vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];
$ct = $_SERVER['CONTENT_TYPE'] ?? '';

$sym = Symfony\Component\HttpFoundation\Request::createFromGlobals();
$lar = Illuminate\Http\Request::createFromBase($sym);

echo json_encode([
    'method' => $method,
    'content_type' => $ct,
    'globals_POST' => $_POST,
    'globals_FILES' => array_keys($_FILES),
    'symfony_request_params' => $sym->request->all(),
    'symfony_files' => array_keys($sym->files->all()),
    'laravel_all' => $lar->all(),
    'laravel_files' => array_keys($lar->files->all()),
    'laravel_hasFile_foto' => $lar->hasFile('foto'),
    'content_length' => $_SERVER['CONTENT_LENGTH'] ?? null,
    'php_input_len' => strlen(file_get_contents('php://input')),
], JSON_PRETTY_PRINT);
