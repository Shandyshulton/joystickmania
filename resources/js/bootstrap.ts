import axios from 'axios';
import { router } from '@inertiajs/react';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF token untuk request POST/PUT/DELETE
const token = document.head.querySelector<HTMLMetaElement>(
    'meta[name="csrf-token"]',
);

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error(
        'CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token',
    );
}

// Konfirmasi sebelum keluar jika ada perubahan belum tersimpan
let confirming = false;

router.on('start', () => {
    confirming = true;
});

router.on('success', () => {
    confirming = false;
});

window.addEventListener('beforeunload', (event) => {
    if (confirming) {
        event.preventDefault();
    }
});
