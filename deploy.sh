#!/bin/bash
set -e

echo "🚀 بدء عملية النشر..."

# Build locally
echo "📦 بناء المشروع..."
pnpm build

# Package dist folder
echo "📦 ضغط الملفات..."
tar czf dist.tar.gz dist/

# Upload to server
echo "📤 رفع الملفات إلى الخادم..."
scp -i ~/.ssh/id_manual_test dist.tar.gz root@72.61.201.103:/tmp/

# Extract and restart on server
echo "🔄 تحديث الخادم..."
ssh -i ~/.ssh/id_manual_test root@72.61.201.103 << 'ENDSSH'
cd /var/www/munazzam
rm -rf dist
tar xzf /tmp/dist.tar.gz
rm /tmp/dist.tar.gz
pm2 restart munazzam
ENDSSH

# Cleanup
rm dist.tar.gz

echo "✅ تم النشر بنجاح!"
echo "🌐 الموقع: http://72.61.201.103"
