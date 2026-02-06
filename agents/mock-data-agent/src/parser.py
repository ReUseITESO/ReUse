"""
Parser module for reading and extracting sections from user story markdown files.
"""

import re
from typing import Dict, List, Optional


class UserStoryParser:
    """Parses user story markdown files and extracts structured information."""
    
    def __init__(self, content: str):
        self.content = content
        self.sections = {}
        self.missing_sections = []
    
    def parse(self) -> Dict[str, any]:
        """Parse the markdown content and extract all sections."""
        self.sections['title'] = self._extract_title()
        self.sections['domain'] = self._extract_domain()
        self.sections['user_story'] = self._extract_section('User Story')
        self.sections['description'] = (self._extract_section('Descripción detallada') or
                                        self._extract_section('Detailed Description') or
                                        self._extract_section('Detail descriptión') or
                                        self._extract_section('Description'))
        self.sections['acceptance_criteria'] = self._extract_checklist('Acceptance Criteria')
        self.sections['implementation_details'] = self._extract_implementation_details()
        self.sections['testing_notes'] = self._extract_section('Testing Notes')
        self.sections['test_data_required'] = self._extract_section('Test Data Required')
        self.sections['potential_mocks'] = self._extract_section('Potential Mocks')
        self.sections['dependencies'] = self._extract_section('Dependencies & Duplication Check') or self._extract_section('Dependencies')
        self.sections['assumptions'] = self._extract_section('Assumptions')
        
        self._identify_missing_sections()
        
        return self.sections
    
    def _extract_title(self) -> str:
        """Extract the main title from the markdown."""
        match = re.search(r'^#\s+(.+)$', self.content, re.MULTILINE)
        if match:
            return match.group(1).strip()
        self.missing_sections.append('Title')
        return 'Untitled User Story'
    
    def _extract_domain(self) -> Optional[str]:
        """Extract the domain if specified."""
        match = re.search(r'\*\*Domain:\*\*\s+(.+)', self.content)
        if match:
            return match.group(1).strip()
        return None
    
    def _extract_section(self, section_name: str) -> Optional[str]:
        """Extract content from a specific section."""
        pattern = rf'##\s+{re.escape(section_name)}\s*\n(.*?)(?=\n##|\Z)'
        match = re.search(pattern, self.content, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1).strip()
            return content if content else None
        return None
    
    def _extract_checklist(self, section_name: str) -> List[str]:
        """Extract checklist items from a section."""
        section_content = self._extract_section(section_name)
        if not section_content:
            self.missing_sections.append(section_name)
            return []
        
        # Extract all checklist items
        items = re.findall(r'-\s+\[[ x]\]\s+(.+)', section_content)
        return items
    
    def _extract_implementation_details(self) -> Dict[str, str]:
        """Extract implementation details for Backend, Frontend, and Database."""
        details = {}
        section_content = self._extract_section('Implementation Details')
        
        if not section_content:
            self.missing_sections.append('Implementation Details')
            return details
        
        # Extract Backend section
        backend_match = re.search(r'###\s+Backend\s*\n(.*?)(?=\n###|\Z)', section_content, re.DOTALL)
        if backend_match:
            details['backend'] = backend_match.group(1).strip()
        
        # Extract Frontend section
        frontend_match = re.search(r'###\s+Frontend\s*\n(.*?)(?=\n###|\Z)', section_content, re.DOTALL)
        if frontend_match:
            details['frontend'] = frontend_match.group(1).strip()
        
        # Extract Database section
        database_match = re.search(r'###\s+Database\s*\n(.*?)(?=\n###|\Z)', section_content, re.DOTALL)
        if database_match:
            details['database'] = database_match.group(1).strip()
        
        return details
    
    def _identify_missing_sections(self):
        """Identify which required sections are missing."""
        required_sections = [
            'title', 'user_story', 'description', 'acceptance_criteria', 
            'implementation_details', 'testing_notes'
        ]
        
        for section in required_sections:
            if section not in self.sections or not self.sections[section]:
                if section not in self.missing_sections:
                    self.missing_sections.append(section)
    
    def get_missing_sections(self) -> List[str]:
        """Return list of missing sections."""
        return self.missing_sections


def parse_user_story(file_path: str) -> Dict[str, any]:
    """Parse a user story markdown file and return structured data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parser = UserStoryParser(content)
    return parser.parse()
