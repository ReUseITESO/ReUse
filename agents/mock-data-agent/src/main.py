"""
Main agent script for generating mock and test data from user stories.
"""

import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from parser import UserStoryParser
from generator import TestDataGenerator
from output_builder import build_output


def main():
    """Main entry point for the mock data agent."""
    
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python main.py <input_file.md> [output_file.md]")
        print("\nExample:")
        print("  python main.py ../example/input.md generated-output.md")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    # Create output directory if it doesn't exist
    output_dir = Path(__file__).parent.parent / 'output'
    output_dir.mkdir(exist_ok=True)
    
    # Determine output file path
    if len(sys.argv) > 2:
        output_filename = sys.argv[2]
    else:
        # Generate default filename from input file
        input_filename = Path(input_file).stem
        output_filename = f"{input_filename}-output.md"
    
    output_file = output_dir / output_filename
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)
    
    print("Mock & Test Data Agent")
    print("=" * 50)
    print(f"Reading input file: {input_file}")
    
    # Read and parse the input file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading input file: {e}")
        sys.exit(1)
    
    # Parse the user story
    print("Parsing user story...")
    parser = UserStoryParser(content)
    sections = parser.parse()
    
    # Check for missing sections
    missing_sections = parser.get_missing_sections()
    if missing_sections:
        print(f"Warning: Missing sections detected: {', '.join(missing_sections)}")
        print("The agent will continue but will make assumptions where needed.")
    
    # Store missing sections in the sections dict for the generator
    sections['missing_sections'] = missing_sections
    
    # Generate test data and mocks
    print("Generating test data and mocks...")
    generator = TestDataGenerator(sections)
    
    # Build the output
    print("Building output...")
    output_content = build_output(sections, generator)
    
    # Write the output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(output_content)
        print(f"Output generated successfully: {output_file}")
    except Exception as e:
        print(f"Error writing output file: {e}")
        sys.exit(1)
    
    # Print summary
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  - User Story: {sections.get('title', 'Untitled')}")
    print(f"  - Entities Identified: {len(generator.entities)}")
    print(f"  - Datasets Generated: 3 (Happy Path, Edge Cases, Negative Cases)")
    print(f"  - Mocks Created: {len(generator.generate_mocks())}")
    print(f"  - Assumptions Made: {len(generator.assumptions)}")
    
    if missing_sections:
        print(f"  - Missing Sections: {len(missing_sections)}")
    
    print("\nDone!")


if __name__ == '__main__':
    main()
