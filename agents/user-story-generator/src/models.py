"""
Data models for User Story Generator Agent
"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from enum import Enum


class Domain(Enum):
    """Functional domains in ReUseITESO"""
    CORE = "Core"
    MARKETPLACE = "Marketplace"
    GAMIFICATION = "Gamification"


class DetailLevel(Enum):
    """Level of detail for generated stories"""
    BASIC = "basic"
    DETAILED = "detailed"
    COMPREHENSIVE = "comprehensive"


@dataclass
class ImplementationDetails:
    """Implementation details for a user story"""
    backend: List[str] = field(default_factory=list)
    frontend: List[str] = field(default_factory=list)
    database: List[str] = field(default_factory=list)


@dataclass
class ExistingStory:
    """Represents an existing user story for duplication checking"""
    id: str
    title: str
    domain: str
    description: Optional[str] = None
    
    def __str__(self):
        return f"{self.id}: {self.title} ({self.domain})"


@dataclass
class UserStory:
    """Complete user story structure"""
    
    # Required fields
    title: str
    user_story: str  # As a... I want... so that...
    description: str
    acceptance_criteria: List[str]
    
    # Implementation details
    implementation: ImplementationDetails
    
    # Testing
    testing_notes: List[str]
    test_data_required: List[str]
    potential_mocks: List[str]
    
    # Dependencies
    dependencies: List[str] = field(default_factory=list)
    possible_duplicates: List[str] = field(default_factory=list)
    
    # Metadata
    domain: Optional[Domain] = None
    assumptions: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    
    def validate(self) -> tuple[bool, List[str]]:
        """
        Validate that the story has all required sections
        Returns: (is_valid, list_of_errors)
        """
        errors = []
        
        if not self.title or len(self.title) < 5:
            errors.append("Title is too short or missing")
        
        if not self.user_story or "As a" not in self.user_story:
            errors.append("User story must follow 'As a... I want... so that...' format")
        
        if not self.description or len(self.description) < 20:
            errors.append("Description is too short or missing")
        
        if not self.acceptance_criteria or len(self.acceptance_criteria) < 2:
            errors.append("At least 2 acceptance criteria are required")
        
        # Check for Given/When/Then format (not allowed)
        for criterion in self.acceptance_criteria:
            if any(word in criterion.lower() for word in ["given", "when", "then"]):
                errors.append(f"Acceptance criteria should not use Given/When/Then format: {criterion}")
        
        if not self.implementation.backend and not self.implementation.frontend:
            errors.append("Implementation details are missing for both backend and frontend")
        
        if not self.testing_notes:
            errors.append("Testing notes are required")
        
        if not self.test_data_required:
            errors.append("Test data requirements are missing")
        
        return len(errors) == 0, errors
    
    def to_markdown(self) -> str:
        """Generate markdown output for the user story"""
        md = []
        
        # Title
        md.append(f"# {self.title}\n")
        
        if self.domain:
            md.append(f"**Domain:** {self.domain.value}\n")
        
        # User Story
        md.append("## User Story\n")
        md.append(f"{self.user_story}\n")
        
        # Description
        md.append("## Descripción detallada\n")
        md.append(f"{self.description}\n")
        
        # Acceptance Criteria
        md.append("## Acceptance Criteria\n")
        for criterion in self.acceptance_criteria:
            md.append(f"- [ ] {criterion}")
        md.append("")
        
        # Implementation Details
        md.append("## Implementation Details\n")
        
        if self.implementation.backend:
            md.append("### Backend")
            for item in self.implementation.backend:
                md.append(f"- {item}")
            md.append("")
        
        if self.implementation.frontend:
            md.append("### Frontend")
            for item in self.implementation.frontend:
                md.append(f"- {item}")
            md.append("")
        
        if self.implementation.database:
            md.append("### Database")
            for item in self.implementation.database:
                md.append(f"- {item}")
            md.append("")
        
        # Testing Notes
        md.append("## Testing Notes\n")
        for note in self.testing_notes:
            md.append(f"- {note}")
        md.append("")
        
        # Test Data Required
        md.append("## Test Data Required\n")
        for data in self.test_data_required:
            md.append(f"- {data}")
        md.append("")
        
        # Potential Mocks
        md.append("## Potential Mocks\n")
        if self.potential_mocks:
            for mock in self.potential_mocks:
                md.append(f"- {mock}")
        else:
            md.append("- None identified")
        md.append("")
        
        # Dependencies & Duplication Check
        md.append("## Dependencies & Duplication Check\n")
        
        if self.dependencies:
            md.append("**Dependencies:**")
            for dep in self.dependencies:
                md.append(f"- {dep}")
        else:
            md.append("**Dependencies:** None identified")
        
        md.append("")
        
        if self.possible_duplicates:
            md.append("**Possible duplicates:**")
            for dup in self.possible_duplicates:
                md.append(f"- ⚠️ {dup}")
        else:
            md.append("**Possible duplicates:** None")
        
        md.append("")
        
        # Assumptions (if any)
        if self.assumptions:
            md.append("## Assumptions\n")
            for assumption in self.assumptions:
                md.append(f"- {assumption}")
            md.append("")
        
        # Warnings (if any)
        if self.warnings:
            md.append("## ⚠️ Warnings\n")
            for warning in self.warnings:
                md.append(f"- {warning}")
            md.append("")
        
        return "\n".join(md)
    
    def is_too_large(self) -> tuple[bool, Optional[str]]:
        """
        Check if the story is too large and should be split
        Returns: (is_too_large, suggestion)
        """
        total_items = (
            len(self.acceptance_criteria) +
            len(self.implementation.backend) +
            len(self.implementation.frontend) +
            len(self.implementation.database)
        )
        
        if total_items > 15:
            return True, "This story has too many implementation items. Consider splitting into smaller stories."
        
        if len(self.acceptance_criteria) > 8:
            return True, "This story has too many acceptance criteria. Consider splitting by feature area."
        
        return False, None


@dataclass
class StoryInput:
    """Input data for generating a user story"""
    title: str
    domain: str
    description: str
    context: Optional[Dict[str, str]] = None
    existing_stories: List[ExistingStory] = field(default_factory=list)
    detail_level: DetailLevel = DetailLevel.DETAILED
