"""
User Story Generator Agent - Main Logic
Generates complete, production-ready user stories for ReUseITESO
"""
import json
import sys
from typing import Optional, List
from pathlib import Path

from models import (
    UserStory, StoryInput, ExistingStory, 
    ImplementationDetails, Domain, DetailLevel
)
from validators import (
    DuplicationChecker, DependencyAnalyzer, 
    StoryValidator, TechnologyValidator
)


class UserStoryGenerator:
    """Main generator class for creating user stories"""
    
    def __init__(self, detail_level: DetailLevel = DetailLevel.DETAILED):
        self.detail_level = detail_level
        self.duplication_checker = DuplicationChecker()
        self.dependency_analyzer = DependencyAnalyzer()
        self.story_validator = StoryValidator()
        self.tech_validator = TechnologyValidator()
    
    def generate(
        self,
        title: str,
        domain: str,
        description: str,
        context: Optional[dict] = None,
        existing_stories: Optional[List[ExistingStory]] = None
    ) -> UserStory:
        """
        Generate a complete user story
        
        Args:
            title: Short, descriptive title
            domain: Core, Marketplace, or Gamification
            description: Detailed description of the feature
            context: Additional context (user type, platform, priority)
            existing_stories: List of existing stories for duplication check
        
        Returns:
            Complete UserStory object
        """
        if existing_stories is None:
            existing_stories = []
        
        # Parse domain
        try:
            domain_enum = Domain[domain.upper()]
        except KeyError:
            domain_enum = None
        
        # Generate user story statement
        user_story = self._generate_user_story_statement(title, description, context)
        
        # Generate detailed description
        detailed_description = self._generate_detailed_description(
            title, description, context
        )
        
        # Generate acceptance criteria
        acceptance_criteria = self._generate_acceptance_criteria(
            title, description, context
        )
        
        # Generate implementation details
        implementation = self._generate_implementation_details(
            title, description, domain, context
        )
        
        # Generate testing notes
        testing_notes = self._generate_testing_notes(title, description)
        
        # Generate test data requirements
        test_data = self._generate_test_data_requirements(title, description, context)
        
        # Generate potential mocks
        mocks = self._generate_potential_mocks(title, description, domain)
        
        # Check for duplicates
        duplicates = self.duplication_checker.check_duplicates(
            title, existing_stories
        )
        
        # Identify dependencies
        dependencies = self.dependency_analyzer.identify_dependencies(
            title, description, existing_stories
        )
        
        # Create story object
        story = UserStory(
            title=title,
            user_story=user_story,
            description=detailed_description,
            acceptance_criteria=acceptance_criteria,
            implementation=implementation,
            testing_notes=testing_notes,
            test_data_required=test_data,
            potential_mocks=mocks,
            dependencies=dependencies,
            possible_duplicates=duplicates,
            domain=domain_enum
        )
        
        # Add assumptions
        story.assumptions = self._generate_assumptions(title, description, context)
        
        # Validate and add warnings
        story.warnings = self._generate_warnings(story, existing_stories)
        
        return story
    
    def _generate_user_story_statement(
        self, title: str, description: str, context: Optional[dict]
    ) -> str:
        """Generate the 'As a... I want... so that...' statement"""
        
        # Determine user type
        user_type = "user"
        if context and "user_type" in context:
            user_type = context["user_type"]
        
        # Extract action from title
        action = title.lower()
        if "can" in action:
            action = action.split("can", 1)[1].strip()
        
        # Infer benefit from description
        benefit = "I can interact with the platform effectively"
        if "so that" in description.lower():
            benefit = description.lower().split("so that", 1)[1].strip()
        elif "to" in description.lower():
            benefit = description.lower().split("to", 1)[1].strip()
        
        return f"As a {user_type}, I want to {action} so that {benefit}."
    
    def _generate_detailed_description(
        self, title: str, description: str, context: Optional[dict]
    ) -> str:
        """Generate detailed description with context"""
        
        parts = [description]
        
        # Add context information
        if context:
            if "platform" in context:
                parts.append(f"\nThis feature is for the {context['platform']} platform.")
            
            if "priority" in context:
                parts.append(f"Priority: {context['priority']}.")
        
        # Add what it does NOT cover
        parts.append(
            "\nThis story focuses on the core functionality. "
            "Advanced features, edge cases, and optimizations may be addressed in separate stories."
        )
        
        return " ".join(parts)
    
    def _generate_acceptance_criteria(
        self, title: str, description: str, context: Optional[dict]
    ) -> List[str]:
        """Generate acceptance criteria checklist"""
        
        criteria = []
        
        # Basic CRUD operations
        if "create" in title.lower() or "publish" in title.lower():
            criteria.extend([
                "User can access the creation form",
                "All required fields are clearly marked",
                "Form validates input before submission",
                "Success message is shown after creation",
                "User is redirected to appropriate page after success"
            ])
        
        if "view" in title.lower() or "see" in title.lower():
            criteria.extend([
                "User can access the view",
                "All relevant information is displayed",
                "Data is formatted correctly",
                "Loading states are shown while fetching data"
            ])
        
        if "edit" in title.lower() or "update" in title.lower():
            criteria.extend([
                "User can access the edit form",
                "Current values are pre-filled",
                "Changes are validated before saving",
                "Success confirmation is shown after update"
            ])
        
        if "delete" in title.lower() or "remove" in title.lower():
            criteria.extend([
                "User can initiate deletion",
                "Confirmation dialog is shown before deletion",
                "Item is removed from the system after confirmation",
                "Success message is displayed"
            ])
        
        # Error handling
        criteria.append("Error messages are clear and actionable")
        
        # If no specific criteria were added, add generic ones
        if len(criteria) < 3:
            criteria = [
                "Feature is accessible to authorized users",
                "All required functionality works as expected",
                "User receives appropriate feedback",
                "Error cases are handled gracefully"
            ]
        
        return criteria[:8]  # Limit to 8 criteria
    
    def _generate_implementation_details(
        self, title: str, description: str, domain: str, context: Optional[dict]
    ) -> ImplementationDetails:
        """Generate implementation details for backend, frontend, and database"""
        
        backend = []
        frontend = []
        database = []
        
        # Backend details
        if "create" in title.lower() or "publish" in title.lower():
            backend.extend([
                "POST endpoint for resource creation",
                "Input validation and sanitization",
                "Business logic for creation rules",
                "Response with created resource ID"
            ])
            database.extend([
                "New table/entity for the resource",
                "Required fields: id, created_at, updated_at",
                "Foreign keys to related entities",
                "Indexes on frequently queried fields"
            ])
        
        if "view" in title.lower() or "list" in title.lower():
            backend.extend([
                "GET endpoint for resource retrieval",
                "Query parameters for filtering/pagination",
                "Response formatting and serialization"
            ])
        
        if "update" in title.lower() or "edit" in title.lower():
            backend.extend([
                "PUT/PATCH endpoint for updates",
                "Validation of update permissions",
                "Partial update support",
                "Optimistic locking if needed"
            ])
        
        if "delete" in title.lower():
            backend.extend([
                "DELETE endpoint",
                "Soft delete vs hard delete decision",
                "Cascade deletion rules",
                "Permission validation"
            ])
        
        # Frontend details
        frontend.extend([
            "Component for main UI",
            "Form validation (if applicable)",
            "Loading and error states",
            "Success/error notifications",
            "Responsive design for mobile and desktop"
        ])
        
        # Add API integration
        if backend:
            frontend.append("API integration with backend endpoints")
        
        return ImplementationDetails(
            backend=backend,
            frontend=frontend,
            database=database
        )
    
    def _generate_testing_notes(self, title: str, description: str) -> List[str]:
        """Generate testing notes"""
        
        notes = [
            "Test with valid data (happy path)",
            "Test with invalid/missing required data",
            "Test with edge cases (empty strings, special characters, very long inputs)",
            "Test error handling and error messages",
            "Test loading states and async behavior"
        ]
        
        if "create" in title.lower():
            notes.append("Test duplicate creation scenarios")
        
        if "delete" in title.lower():
            notes.append("Test deletion of non-existent resources")
        
        if "authentication" in description.lower() or "user" in title.lower():
            notes.append("Test with authenticated and unauthenticated users")
        
        return notes
    
    def _generate_test_data_requirements(
        self, title: str, description: str, context: Optional[dict]
    ) -> List[str]:
        """Generate test data requirements"""
        
        data = []
        
        # User data
        if "user" in title.lower() or "user" in description.lower():
            data.append("Test user accounts (authenticated ITESO users)")
        
        # Item data (for Marketplace)
        if "item" in title.lower() or "item" in description.lower():
            data.extend([
                "Sample items with various categories",
                "Items in different states (published, draft, deleted)"
            ])
        
        # Generic data
        data.extend([
            "Valid input data for all required fields",
            "Invalid input data for validation testing",
            "Edge case data (boundary values, special characters)"
        ])
        
        return data
    
    def _generate_potential_mocks(
        self, title: str, description: str, domain: str
    ) -> List[str]:
        """Identify potential mocks needed"""
        
        mocks = []
        
        # Email service
        if "email" in description.lower() or "notification" in description.lower():
            mocks.append("Email service (SMTP)")
        
        # External APIs
        if "api" in description.lower():
            mocks.append("External API responses")
        
        # File storage
        if "upload" in title.lower() or "image" in description.lower():
            mocks.append("File storage service")
        
        # Authentication
        if "auth" in title.lower() or "login" in description.lower():
            mocks.append("Authentication service")
        
        # Database
        if not mocks:  # If no specific mocks, suggest database
            mocks.append("Database queries for unit tests")
        
        return mocks
    
    def _generate_assumptions(
        self, title: str, description: str, context: Optional[dict]
    ) -> List[str]:
        """Document assumptions made during generation"""
        
        assumptions = [
            "User is authenticated as an ITESO community member",
            "Backend API follows RESTful conventions",
            "Frontend uses Next.js and TypeScript",
            "Database is PostgreSQL"
        ]
        
        if not context or "priority" not in context:
            assumptions.append("Priority level was not specified")
        
        return assumptions
    
    def _generate_warnings(
        self, story: UserStory, existing_stories: List[ExistingStory]
    ) -> List[str]:
        """Generate warnings about the story"""
        
        warnings = []
        
        # Validate format
        is_valid_format, format_issues = self.story_validator.validate_format(story)
        if not is_valid_format:
            warnings.extend(format_issues)
        
        # Check completeness
        is_complete, missing_items = self.story_validator.check_completeness(story)
        if not is_complete:
            warnings.extend(missing_items)
        
        # Check quality
        quality_suggestions = self.story_validator.check_quality(story)
        warnings.extend(quality_suggestions)
        
        # Check for undefined technologies
        tech_warnings = self.tech_validator.check_technologies(story)
        warnings.extend(tech_warnings)
        
        # Check if story is too large
        is_large, large_message = story.is_too_large()
        if is_large:
            warnings.append(f"⚠️ STORY TOO LARGE: {large_message}")
        
        return warnings
    
    def generate_from_input(self, input_data: StoryInput) -> UserStory:
        """Generate story from StoryInput object"""
        return self.generate(
            title=input_data.title,
            domain=input_data.domain,
            description=input_data.description,
            context=input_data.context,
            existing_stories=input_data.existing_stories
        )


def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate complete user stories for ReUseITESO"
    )
    parser.add_argument("--title", help="Story title")
    parser.add_argument("--domain", help="Domain (Core, Marketplace, Gamification)")
    parser.add_argument("--description", help="Story description")
    parser.add_argument("--input", help="Path to input JSON file")
    parser.add_argument("--output", help="Path to output markdown file")
    parser.add_argument("--existing-stories", help="Path to existing stories JSON")
    parser.add_argument("--interactive", action="store_true", help="Interactive mode")
    parser.add_argument("--example", action="store_true", help="Generate example story")
    
    # GitHub integration options
    parser.add_argument("--github", action="store_true", help="Create GitHub Issue from story")
    parser.add_argument("--project", help="GitHub Project name or number to link issue")
    parser.add_argument("--labels", help="Comma-separated labels for GitHub Issue")
    parser.add_argument("--assignee", help="GitHub username to assign the issue")
    
    args = parser.parse_args()
    
    generator = UserStoryGenerator()
    
    def maybe_create_github_issue(story):
        """Helper to create GitHub issue if --github flag is set"""
        if args.github:
            from github_integration import create_issue_from_story
            
            labels = args.labels.split(",") if args.labels else ["user-story"]
            success, message = create_issue_from_story(
                story=story,
                labels=labels,
                project=args.project,
                assignee=args.assignee
            )
            print(message)
            return success
        return True
    
    # Example mode
    if args.example:
        story = generator.generate(
            title="User can publish an item for reuse",
            domain="Marketplace",
            description="Users need to be able to create and publish items so other community members can see and request them",
            context={"user_type": "authenticated ITESO user", "platform": "web"}
        )
        print(story.to_markdown())
        return
    
    # Interactive mode
    if args.interactive:
        print("🤖 User Story Generator - Interactive Mode\n")
        title = input("Story title: ")
        domain = input("Domain (Core/Marketplace/Gamification): ")
        description = input("Description: ")
        
        story = generator.generate(title, domain, description)
        print("\n" + "="*60)
        print(story.to_markdown())
        
        # Validate
        is_valid, errors = story.validate()
        if not is_valid:
            print("\n⚠️ Validation errors:")
            for error in errors:
                print(f"  - {error}")
        
        # Ask to save file
        save_file = input("\n💾 Save to file? (y/n): ").lower().strip()
        if save_file == 'y':
            filename = input("Filename (default: generated-story.md): ").strip()
            if not filename:
                filename = "generated-story.md"
            with open(filename, 'w') as f:
                f.write(story.to_markdown())
            print(f"✅ Saved to {filename}")
        
        # Ask to create GitHub issue
        create_issue = input("\n🐙 Create GitHub Issue? (y/n): ").lower().strip()
        if create_issue == 'y':
            from github_integration import create_issue_from_story, check_github_setup
            
            ready, msg = check_github_setup()
            if not ready:
                print(f"❌ {msg}")
            else:
                project = input("Project name (press Enter to skip): ").strip() or None
                assignee = input("Assignee GitHub username (press Enter to skip): ").strip() or None
                labels_input = input("Labels comma-separated (default: user-story): ").strip()
                labels = labels_input.split(",") if labels_input else ["user-story"]
                
                success, message = create_issue_from_story(
                    story=story,
                    labels=labels,
                    project=project,
                    assignee=assignee
                )
                print(message)
        
        return
    
    # File input mode
    if args.input:
        with open(args.input, 'r') as f:
            data = json.load(f)
        
        # Load existing stories if provided
        existing_stories = []
        if args.existing_stories:
            with open(args.existing_stories, 'r') as f:
                stories_data = json.load(f)
                existing_stories = [
                    ExistingStory(**s) for s in stories_data
                ]
        
        story_input = StoryInput(
            title=data["title"],
            domain=data["domain"],
            description=data["description"],
            context=data.get("context"),
            existing_stories=existing_stories
        )
        
        story = generator.generate_from_input(story_input)
        
        # Output
        output = story.to_markdown()
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"✅ Story generated: {args.output}")
        else:
            print(output)
        
        # Create GitHub issue if requested
        maybe_create_github_issue(story)
        
        return
    
    # Direct arguments mode
    if args.title and args.domain and args.description:
        story = generator.generate(args.title, args.domain, args.description)
        
        output = story.to_markdown()
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"✅ Story generated: {args.output}")
        else:
            print(output)
        
        # Create GitHub issue if requested
        maybe_create_github_issue(story)
        
        return
    
    # No valid input
    parser.print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()
