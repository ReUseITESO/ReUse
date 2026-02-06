"""
Output builder module for generating the final markdown output.
"""

import json
from typing import Dict, List, Any


class OutputBuilder:
    """Builds the final markdown output following the specified template."""
    
    def __init__(self, sections: Dict[str, Any], generator):
        self.sections = sections
        self.generator = generator
        self.output_lines = []
    
    def build(self) -> str:
        """Build the complete output markdown."""
        self._add_header()
        self._add_summary()
        self._add_entities_and_data_map()
        self._add_test_datasets()
        self._add_mock_definitions()
        self._add_api_payloads()
        self._add_database_seeds()
        self._add_coverage_mapping()
        self._add_risks_and_gaps()
        
        return '\n'.join(self.output_lines)
    
    def _add_header(self):
        """Add the output header."""
        self.output_lines.extend([
            '# Mock & Test Data Agent Output',
            '',
            f'**Generated for:** {self.sections.get("title", "Untitled User Story")}',
            '',
            '---',
            ''
        ])
    
    def _add_summary(self):
        """Add the summary section."""
        # Display domain
        domain_display = self.generator.domain.capitalize() if self.generator.domain else 'Generic'
        
        self.output_lines.extend([
            '## 1. Summary',
            '',
            f'- **User Story Analyzed:** {self.sections.get("title", "Untitled User Story")}',
            f'- **Domain Detected:** {domain_display}',
            '- **Artifacts Generated:**',
            '  - Test Data Sets (Happy Path, Edge Cases, Negative Cases)',
            '  - Mock Definitions',
            '  - API Payloads',
            '  - Database Seeds',
            '  - Coverage Mapping',
            ''
        ])
        
        # Add assumptions
        if self.generator.assumptions:
            self.output_lines.append('- **Assumptions Made:**')
            for assumption in self.generator.assumptions:
                self.output_lines.append(f'  - {assumption}')
            self.output_lines.append('')
        else:
            self.output_lines.append('- **Assumptions Made:** None')
            self.output_lines.append('')
        
        # Add missing sections warning
        missing_sections = self.generator.sections.get('missing_sections', [])
        if missing_sections:
            self.output_lines.append('- **Missing Information:**')
            for section in missing_sections:
                self.output_lines.append(f'  - {section}')
            self.output_lines.append('')
        
        self.output_lines.append('---')
        self.output_lines.append('')
    
    def _add_entities_and_data_map(self):
        """Add entities and data map section."""
        entity_info = self.generator.analyze_entities()
        
        self.output_lines.extend([
            '## 2. Entities & Data Map',
            '',
            f'- **Entities Involved:** {", ".join(entity_info["entities"]) if entity_info["entities"] else "Not explicitly defined"}',
            f'- **Relevant Relationships:** {", ".join(entity_info["relationships"]) if entity_info["relationships"] else "None identified"}',
            '- **Key Fields:**'
        ])
        
        if entity_info['key_fields']:
            for field, field_type in entity_info['key_fields']:
                self.output_lines.append(f'  - `{field}` ({field_type})')
        else:
            self.output_lines.append('  - Not explicitly defined in user story')
        
        self.output_lines.extend(['', '---', ''])
    
    def _add_test_datasets(self):
        """Add test datasets section."""
        datasets = self.generator.generate_datasets()
        
        self.output_lines.extend([
            '## 3. Test Data Sets',
            '',
            '### Dataset A: Happy Path',
            '**Purpose:** Valid data that should result in successful resource creation',
            '',
            '```json',
            json.dumps(datasets['happy_path'], indent=2, ensure_ascii=False),
            '```',
            '',
            '### Dataset B: Edge Cases',
            '**Purpose:** Boundary conditions and unusual but valid inputs',
            '',
            '```json',
            json.dumps(datasets['edge_cases'], indent=2, ensure_ascii=False),
            '```',
            '',
            '### Dataset C: Negative/Error Cases',
            '**Purpose:** Invalid data that should trigger validation errors',
            '',
            '```json',
            json.dumps(datasets['negative_cases'], indent=2, ensure_ascii=False),
            '```',
            '',
            '---',
            ''
        ])
    
    def _add_mock_definitions(self):
        """Add mock definitions section."""
        mocks = self.generator.generate_mocks()
        
        self.output_lines.extend([
            '## 4. Mock Definitions',
            ''
        ])
        
        if not mocks:
            self.output_lines.extend([
                'No mocks identified for this user story.',
                '',
                '---',
                ''
            ])
            return
        
        for i, mock in enumerate(mocks, 1):
            self.output_lines.extend([
                f'### Mock {i}: {mock["name"]}',
                '',
                f'- **Simulates:** {mock["simulates"]}',
                f'- **Why Needed:** {mock["why_needed"]}',
                '- **Response Format:**',
                '',
                '```json',
                json.dumps(mock['response_format'], indent=2, ensure_ascii=False),
                '```',
                '',
                f'- **Variations:** {", ".join(mock["variations"])}',
                ''
            ])
        
        self.output_lines.extend(['---', ''])
    
    def _add_api_payloads(self):
        """Add API mock payloads section."""
        payloads = self.generator.generate_api_payloads()
        
        self.output_lines.extend([
            '## 5. API Mock Payloads',
            '',
            f'**Endpoint:** `{payloads["method"]} {payloads["endpoint"]}`',
            '',
            '### Example Request Payload',
            '',
            '```json',
            json.dumps(payloads['request'], indent=2, ensure_ascii=False),
            '```',
            '',
            '### Example Response Payloads',
            ''
        ])
        
        for status_code, response in payloads['responses'].items():
            self.output_lines.extend([
                f'#### {status_code} - {response["description"]}',
                '',
                '```json',
                json.dumps(response['body'], indent=2, ensure_ascii=False),
                '```',
                ''
            ])
        
        self.output_lines.extend(['---', ''])
    
    def _add_database_seeds(self):
        """Add database seeds section."""
        seeds = self.generator.generate_seeds()
        
        self.output_lines.extend([
            '## 6. Database Seeds',
            '',
            f'- **Entities:** {", ".join(seeds["entities"]) if seeds["entities"] else "Not defined"}',
            ''
        ])
        
        if seeds['data']:
            self.output_lines.append('- **Seed Data:**')
            self.output_lines.append('')
            
            for seed_data in seeds['data']:
                self.output_lines.extend([
                    f'**{seed_data["entity"].upper()}**',
                    '',
                    '```json',
                    json.dumps(seed_data['records'], indent=2, ensure_ascii=False),
                    '```',
                    ''
                ])
                
                # Add integrity notes for this specific entity if available
                if 'integrity_notes' in seed_data:
                    self.output_lines.append('**Integrity Notes:**')
                    for note in seed_data['integrity_notes']:
                        self.output_lines.append(f'  - {note}')
                    self.output_lines.append('')
        
        self.output_lines.extend(['', '---', ''])
    
    def _add_coverage_mapping(self):
        """Add coverage mapping section."""
        coverage = self.generator.map_coverage()
        
        self.output_lines.extend([
            '## 7. Coverage Mapping (AC -> Data/Mocks)',
            '',
            '| Acceptance Criteria | Dataset(s) | Mock(s) | Notes |',
            '|---------------------|------------|---------|-------|'
        ])
        
        for mapping in coverage:
            datasets = ', '.join(mapping['datasets']) if mapping['datasets'] else 'N/A'
            mocks = ', '.join(mapping['mocks']) if mapping['mocks'] else 'N/A'
            notes = mapping['notes'] or 'N/A'
            
            # Truncate long descriptions
            description = mapping['description']
            if len(description) > 50:
                description = description[:47] + '...'
            
            self.output_lines.append(
                f'| {mapping["criteria"]}: {description} | {datasets} | {mocks} | {notes} |'
            )
        
        self.output_lines.extend(['', '---', ''])
    
    def _add_risks_and_gaps(self):
        """Add risks and gaps section."""
        risks = self.generator.identify_risks_and_gaps()
        
        self.output_lines.extend([
            '## 8. Risks & Gaps',
            ''
        ])
        
        # Missing fields
        self.output_lines.append('### Missing Fields')
        if risks['missing_fields']:
            for field in risks['missing_fields']:
                self.output_lines.append(f'- {field}')
        else:
            self.output_lines.append('- None identified')
        self.output_lines.append('')
        
        # Untestable criteria
        self.output_lines.append('### Untestable Criteria')
        if risks['untestable_criteria']:
            for criteria in risks['untestable_criteria']:
                self.output_lines.append(f'- {criteria}')
        else:
            self.output_lines.append('- None identified')
        self.output_lines.append('')
        
        # Unclear dependencies
        self.output_lines.append('### Unclear Dependencies')
        if risks['unclear_dependencies']:
            for dependency in risks['unclear_dependencies']:
                self.output_lines.append(f'- {dependency}')
        else:
            self.output_lines.append('- None identified')
        self.output_lines.append('')
        
        # Recommendations
        self.output_lines.append('### Recommendations')
        if risks['recommendations']:
            for recommendation in risks['recommendations']:
                self.output_lines.append(f'- {recommendation}')
        else:
            self.output_lines.append('- No additional recommendations')
        
        self.output_lines.extend(['', '---', '', '*Generated by Mock & Test Data Agent*'])


def build_output(sections: Dict[str, Any], generator) -> str:
    """Build and return the complete markdown output."""
    builder = OutputBuilder(sections, generator)
    return builder.build()
