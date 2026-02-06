"""
Validator script for generated user stories
Checks if a markdown file follows the required format
"""
import sys
import re
from pathlib import Path


class StoryFormatValidator:
    """Validates that a story markdown file has all required sections"""
    
    REQUIRED_SECTIONS = [
        "# ",  # Title
        "## User Story",
        "## Descripción detallada",
        "## Acceptance Criteria",
        "## Implementation Details",
        "## Testing Notes",
        "## Test Data Required",
        "## Potential Mocks",
        "## Dependencies & Duplication Check"
    ]
    
    REQUIRED_SUBSECTIONS = [
        "### Backend",
        "### Frontend",
        "### Database"
    ]
    
    def __init__(self, filepath: str):
        self.filepath = Path(filepath)
        self.content = ""
        self.errors = []
        self.warnings = []
    
    def validate(self) -> bool:
        """
        Validate the story file
        Returns True if valid, False otherwise
        """
        if not self.filepath.exists():
            self.errors.append(f"File not found: {self.filepath}")
            return False
        
        self.content = self.filepath.read_text()
        
        # Check required sections
        self._check_required_sections()
        
        # Check user story format
        self._check_user_story_format()
        
        # Check acceptance criteria format
        self._check_acceptance_criteria()
        
        # Check implementation details
        self._check_implementation_details()
        
        # Check for Given/When/Then (not allowed)
        self._check_for_bdd_format()
        
        return len(self.errors) == 0
    
    def _check_required_sections(self):
        """Check that all required sections are present"""
        for section in self.REQUIRED_SECTIONS:
            if section not in self.content:
                self.errors.append(f"Missing required section: {section}")
    
    def _check_user_story_format(self):
        """Check that user story follows the correct format"""
        user_story_section = self._extract_section("## User Story")
        
        if not user_story_section:
            return
        
        if "As a" not in user_story_section:
            self.errors.append("User story must start with 'As a'")
        
        if "I want" not in user_story_section:
            self.errors.append("User story must include 'I want'")
        
        if "so that" not in user_story_section:
            self.errors.append("User story must include 'so that'")
    
    def _check_acceptance_criteria(self):
        """Check acceptance criteria format"""
        criteria_section = self._extract_section("## Acceptance Criteria")
        
        if not criteria_section:
            return
        
        # Check for checklist format
        if "- [ ]" not in criteria_section:
            self.errors.append("Acceptance criteria must use checklist format (- [ ])")
        
        # Count criteria
        criteria_count = criteria_section.count("- [ ]")
        if criteria_count < 2:
            self.warnings.append(f"Only {criteria_count} acceptance criteria found. Consider adding more.")
        
        if criteria_count > 10:
            self.warnings.append(f"{criteria_count} acceptance criteria found. Story might be too large.")
    
    def _check_implementation_details(self):
        """Check implementation details structure"""
        impl_section = self._extract_section("## Implementation Details")
        
        if not impl_section:
            return
        
        # Check for subsections in the full content (not just extracted section)
        has_backend = "### Backend" in self.content
        has_frontend = "### Frontend" in self.content
        has_database = "### Database" in self.content
        
        if not has_backend and not has_frontend:
            self.errors.append("Implementation details must include Backend or Frontend subsection")
        
        if not has_database:
            self.warnings.append("No Database subsection found. Consider if database changes are needed.")
    
    def _check_for_bdd_format(self):
        """Check that Given/When/Then format is not used"""
        criteria_section = self._extract_section("## Acceptance Criteria")
        
        if not criteria_section:
            return
        
        bdd_keywords = ["Given", "When", "Then", "And"]
        for keyword in bdd_keywords:
            if keyword in criteria_section:
                self.errors.append(
                    f"Acceptance criteria should not use BDD format (found '{keyword}')"
                )
    
    def _extract_section(self, section_header: str) -> str:
        """Extract content of a specific section"""
        pattern = f"{re.escape(section_header)}(.*?)(?=##|$)"
        match = re.search(pattern, self.content, re.DOTALL)
        return match.group(1) if match else ""
    
    def print_results(self):
        """Print validation results"""
        print(f"\n{'='*60}")
        print(f"Validation Results for: {self.filepath.name}")
        print(f"{'='*60}\n")
        
        if not self.errors and not self.warnings:
            print("✅ Story is valid and follows all required formats!\n")
            return
        
        if self.errors:
            print(f"❌ Errors ({len(self.errors)}):")
            for error in self.errors:
                print(f"  - {error}")
            print()
        
        if self.warnings:
            print(f"⚠️  Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  - {warning}")
            print()
        
        if self.errors:
            print("❌ Story validation FAILED\n")
        else:
            print("✅ Story validation PASSED (with warnings)\n")


def main():
    """CLI entry point"""
    if len(sys.argv) < 2:
        print("Usage: python validate_story.py <story-file.md>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    validator = StoryFormatValidator(filepath)
    
    is_valid = validator.validate()
    validator.print_results()
    
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()
