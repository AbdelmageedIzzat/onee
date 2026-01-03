/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',       // لتوليد نسخة static
  basePath: '/onee',      // اسم المستودع على GitHub
  images: {
    unoptimized: true     // ضروري عند التصدير لـ GitHub Pages
  }
};

module.exports = nextConfig;
