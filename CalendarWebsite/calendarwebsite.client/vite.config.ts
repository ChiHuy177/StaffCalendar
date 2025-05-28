import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';
import tailwindcss from '@tailwindcss/vite'


const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "calendarwebsite.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

// Chỉ tạo chứng chỉ trong môi trường development
if (process.env.NODE_ENV === 'development') {
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        if (0 !== child_process.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit', }).status) {
            throw new Error("Could not create certificate.");
        }
    }
}

const target = process.env.NODE_ENV === 'development' ?
    process.env.VITE_API_URL : 'https://staffcalendarserver-may.onrender.com'; // URL backend từ Render


export default defineConfig({
    base: '/',
    plugins: [plugin(),
    tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist', // Thư mục đầu ra
    },
    server: {
        https: process.env.NODE_ENV === 'development' ? {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        } : undefined,
        proxy: {

            '^/api': {
                target,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '')

            },
        },
        port: 50857,

    }
})
