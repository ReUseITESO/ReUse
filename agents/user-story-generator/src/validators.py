"""
Validators and checkers for User Story Generator
"""
from typing import List, Tuple
from difflib import SequenceMatcher
from models import UserStory, ExistingStory


class DuplicationChecker:
    """Check for duplicate or similar stories"""
    
    SIMILARITY_THRESHOLD = 0.7  # 70% similarity triggers warning
    
    @staticmethod
    def check_duplicates(
        new_story_title: str,
        existing_stories: List[ExistingStory]
    ) -> List[str]:
        """
        Check if the new story is similar to existing ones
        Returns list of potential duplicates
        """
        duplicates = []
        
        for existing in existing_stories:
            similarity = DuplicationChecker._calculate_similarity(
                new_story_title.lower(),
                existing.title.lower()
            )
            
            if similarity >= DuplicationChecker.SIMILARITY_THRESHOLD:
                duplicates.append(
                    f"{existing.id}: {existing.title} (similarity: {similarity:.0%})"
                )
        
        return duplicates
    
    @staticmethod
    def _calculate_similarity(str1: str, str2: str) -> float:
        """Calculate similarity ratio between two strings"""
        return SequenceMatcher(None, str1, str2).ratio()


class DependencyAnalyzer:
    """Analyze dependencies between stories"""
    
    # Keywords that suggest dependencies
    DEPENDENCY_KEYWORDS = {
        "authentication": ["Core", "user", "login", "session"],
        "authorization": ["Core", "permission", "role", "access"],
        "user profile": ["Core", "user", "account"],
        "item": ["Marketplace", "publish", "create"],
        "search": ["Marketplace", "filter", "query"],
        "transaction": ["Marketplace", "exchange", "donate", "buy"],
        "points": ["Gamification", "reward", "score"],
        "achievement": ["Gamification", "badge", "unlock"],
    }
    
    @staticmethod
    def identify_dependencies(
        story_title: str,
        story_description: str,
        existing_stories: List[ExistingStory]
    ) -> List[str]:
        """
        Identify potential dependencies based on keywords and existing stories
        """
        dependencies = []
        text = f"{story_title} {story_description}".lower()
        
        # Check for keyword-based dependencies
        for feature, keywords in DependencyAnalyzer.DEPENDENCY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                # Find related existing stories
                related = [
                    story for story in existing_stories
                    if any(keyword in story.title.lower() for keyword in keywords)
                ]
                
                for story in related:
                    dep_msg = f"{story.id}: {story.title} (required for {feature})"
                    if dep_msg not in dependencies:
                        dependencies.append(dep_msg)
        
        return dependencies


class StoryValidator:
    """Validate user story completeness and quality"""
    
    @staticmethod
    def validate_format(story: UserStory) -> Tuple[bool, List[str]]:
        """
        Validate that the story follows the required format
        Returns: (is_valid, list_of_issues)
        """
        issues = []
        
        # Validate user story format
        if not story.user_story.startswith("As a"):
            issues.append("User story must start with 'As a'")
        
        if "I want" not in story.user_story:
            issues.append("User story must include 'I want'")
        
        if "so that" not in story.user_story:
            issues.append("User story must include 'so that'")
        
        # Validate acceptance criteria format
        for criterion in story.acceptance_criteria:
            # Check for Given/When/Then (not allowed)
            if any(word in criterion.lower() for word in ["given", "when", "then"]):
                issues.append(
                    f"Acceptance criteria should not use Given/When/Then: '{criterion}'"
                )
            
            # Check if it's actionable
            if len(criterion.split()) < 3:
                issues.append(f"Acceptance criterion too vague: '{criterion}'")
        
        # Validate implementation details structure
        if not story.implementation.backend and not story.implementation.frontend:
            issues.append("Implementation details must include backend or frontend")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def check_completeness(story: UserStory) -> Tuple[bool, List[str]]:
        """
        Check if all required sections are present and meaningful
        """
        missing = []
        
        if not story.title:
            missing.append("Title is missing")
        
        if not story.user_story:
            missing.append("User story is missing")
        
        if not story.description or len(story.description) < 50:
            missing.append("Description is too short (minimum 50 characters)")
        
        if len(story.acceptance_criteria) < 2:
            missing.append("At least 2 acceptance criteria required")
        
        if not story.implementation.backend and not story.implementation.frontend:
            missing.append("Implementation details are missing")
        
        if not story.testing_notes:
            missing.append("Testing notes are missing")
        
        if not story.test_data_required:
            missing.append("Test data requirements are missing")
        
        # Potential mocks can be empty, but should be explicitly stated
        
        return len(missing) == 0, missing
    
    @staticmethod
    def check_quality(story: UserStory) -> List[str]:
        """
        Check quality indicators and return suggestions
        """
        suggestions = []
        
        # Check if title is too generic
        generic_words = ["manage", "handle", "process", "do", "make"]
        if any(word in story.title.lower() for word in generic_words):
            suggestions.append(
                "Title seems generic. Consider being more specific about the action."
            )
        
        # Check if acceptance criteria are measurable
        vague_words = ["properly", "correctly", "well", "good", "nice"]
        for criterion in story.acceptance_criteria:
            if any(word in criterion.lower() for word in vague_words):
                suggestions.append(
                    f"Acceptance criterion may be too vague: '{criterion}'"
                )
        
        # Check if story is too large
        is_large, message = story.is_too_large()
        if is_large:
            suggestions.append(message)
        
        # Check if testing notes are specific enough
        if len(story.testing_notes) < 3:
            suggestions.append(
                "Consider adding more testing notes (normal cases, edge cases, errors)"
            )
        
        return suggestions


class TechnologyValidator:
    """Validate that no undefined technologies are assumed"""
    
    ALLOWED_TECHNOLOGIES = {
        "backend": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis"],
        "frontend": ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        "testing": ["pytest", "Jest", "React Testing Library"],
        "infrastructure": ["Docker", "AWS", "GitHub Actions"]
    }
    
    @staticmethod
    def check_technologies(story: UserStory) -> List[str]:
        """
        Check if story assumes technologies not defined in the project
        Returns list of warnings
        """
        warnings = []
        
        all_text = " ".join([
            story.description,
            *story.implementation.backend,
            *story.implementation.frontend,
            *story.implementation.database
        ]).lower()
        
        # Common technology names that might be assumed
        common_techs = [
            "mongodb", "mysql", "graphql", "rest", "grpc",
            "angular", "vue", "svelte", "django", "flask"
        ]
        
        for tech in common_techs:
            if tech in all_text:
                # Check if it's in allowed list
                is_allowed = any(
                    tech.lower() in [t.lower() for t in techs]
                    for techs in TechnologyValidator.ALLOWED_TECHNOLOGIES.values()
                )
                
                if not is_allowed:
                    warnings.append(
                        f"Story assumes '{tech}' which is not defined in project stack"
                    )
        
        return warnings
