#!/bin/bash

# Format all files in specified directories using Prettier
echo "Running Prettier on src, scripts,"

npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}" \
                     "scripts/**/*.{sh,py,js,json}"

echo "Formatting complete!"