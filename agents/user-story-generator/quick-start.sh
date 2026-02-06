#!/bin/bash

# Quick Start Script for User Story Generator Agent
# This script helps you quickly generate a user story

echo "🤖 User Story Generator - Quick Start"
echo "======================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✅ Python 3 found"
echo ""

# Show options
echo "Choose an option:"
echo "1. Generate example story"
echo "2. Interactive mode"
echo "3. Generate from input file"
echo ""
read -p "Enter option (1-3): " option

case $option in
    1)
        echo ""
        echo "Generating example story..."
        python3 src/generator.py --example
        ;;
    2)
        echo ""
        python3 src/generator.py --interactive
        ;;
    3)
        echo ""
        read -p "Enter input file path (default: examples/input-example.json): " input_file
        input_file=${input_file:-examples/input-example.json}
        
        read -p "Enter output file path (default: generated-story.md): " output_file
        output_file=${output_file:-generated-story.md}
        
        python3 src/generator.py --input "$input_file" --output "$output_file"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
