<?php
$method = $_SERVER['REQUEST_METHOD'];
$out = ['method' => $method, 'content_type' => $_SERVER['CONTENT_TYPE'] ?? null, 'post' => $_POST, 'files' => array_keys($_FILES)];
if (in_array($method, ['PUT', 'PATCH', 'DELETE'], true)) {
    try {
        [$post, $files] = request_parse_body();
        $out['parse_ok'] = true;
        $out['parsed_post'] = $post;
        $out['parsed_files'] = array_keys($files);
    } catch (\Throwable $e) {
        $out['parse_ok'] = false;
        $out['parse_error'] = get_class($e) . ': ' . $e->getMessage();
    }
}
echo json_encode($out, JSON_PRETTY_PRINT);
