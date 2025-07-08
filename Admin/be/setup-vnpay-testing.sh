#!/bin/bash

# Script to setup VNPay testing with ngrok
# Run this script to automatically setup ngrok tunnel for VNPay testing

echo "🚀 VNPay Testing Setup Script"
echo "=============================="

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed or not in PATH"
    echo "Please download ngrok from: https://ngrok.com/download"
    echo "Extract it and add to your PATH"
    exit 1
fi

echo "✅ ngrok found"

# Start ngrok tunnel
echo "🔧 Starting ngrok tunnel to localhost:8080..."
echo "Please wait for ngrok to start..."

# Run ngrok in background and capture output
ngrok http 8080 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 5

# Extract the public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok\.io')

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "Please check if ngrok started correctly"
    kill $NGROK_PID
    exit 1
fi

echo "✅ ngrok tunnel created: $NGROK_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update your application.properties with:"
echo "   vnpay.return-url=$NGROK_URL/api/payments/vnpay/callback"
echo ""
echo "2. Restart your Spring Boot application"
echo ""
echo "3. Test VNPay payment with the ngrok URL"
echo ""
echo "🌐 ngrok Web Interface: http://localhost:4040"
echo "📊 View request logs and details there"
echo ""
echo "⚠️  Keep this terminal open while testing VNPay"
echo "Press Ctrl+C to stop ngrok tunnel"

# Keep the script running
wait $NGROK_PID
