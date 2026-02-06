"""
Generator module for creating test datasets, mocks, seeds, and other test artifacts.
"""

import json
import re
from typing import Dict, List, Any
from uuid import uuid4
from datetime import datetime, timedelta


class TestDataGenerator:
    """Generates test data, mocks, and seeds based on user story analysis."""
    
    def __init__(self, sections: Dict[str, Any]):
        self.sections = sections
        self.entities = []
        self.relationships = []
        self.key_fields = []
        self.assumptions = []
        self.domain = self._extract_domain()
    
    def _extract_domain(self) -> str:
        """Extract and normalize the domain from the user story."""
        domain = self.sections.get('domain', '') or ''
        domain = domain.lower().strip()
        
        # Normalize domain names
        if 'market' in domain:
            return 'marketplace'
        elif 'core' in domain or 'auth' in domain:
            return 'core'
        elif 'gamif' in domain or 'point' in domain or 'achievement' in domain:
            return 'gamification'
        
        # If no domain specified, add warning
        if not domain:
            self.assumptions.append('No Domain specified - using generic data generation')
        
        return domain or 'generic'
    
    def analyze_entities(self):
        """Analyze the user story and extract entities, relationships, and key fields."""
        impl_details = self.sections.get('implementation_details', {})
        database_section = impl_details.get('database', '')
        
        # Extract table/entity names
        entity_matches = re.findall(r'`(\w+)`\s+table', database_section, re.IGNORECASE)
        self.entities = list(set(entity_matches))
        
        # If no entities found in database section, try to infer from title/description
        if not self.entities:
            title = self.sections.get('title', '').lower()
            if 'item' in title or 'publish' in title:
                self.entities.append('Item')
                self.assumptions.append('Assumed Item entity based on user story title')
            if 'user' in title or 'profile' in title:
                self.entities.append('User')
                self.assumptions.append('Assumed User entity based on user story title')
        
        # Extract field information
        if database_section:
            field_matches = re.findall(r'`(\w+)`\s+\(([^)]+)\)', database_section)
            self.key_fields = [(field, field_type) for field, field_type in field_matches]
        
        # Extract relationships (foreign keys)
        fk_matches = re.findall(r'Foreign key.*?to\s+(\w+)', database_section, re.IGNORECASE)
        self.relationships = list(set(fk_matches))
        
        return {
            'entities': self.entities,
            'relationships': self.relationships,
            'key_fields': self.key_fields
        }
    
    def generate_datasets(self) -> Dict[str, Any]:
        """Generate three types of datasets: happy path, edge cases, and negative cases."""
        impl_details = self.sections.get('implementation_details', {})
        backend = impl_details.get('backend', '')
        
        # Extract required fields from backend section
        required_fields = self._extract_required_fields(backend)
        
        # Generate datasets based on domain
        if self.domain == 'marketplace':
            datasets = self._generate_marketplace_datasets(required_fields)
        elif self.domain == 'core':
            datasets = self._generate_core_datasets(required_fields)
        elif self.domain == 'gamification':
            datasets = self._generate_gamification_datasets(required_fields)
        else:
            # Generic fallback
            datasets = {
                'happy_path': self._generate_happy_path(required_fields),
                'edge_cases': self._generate_edge_cases(required_fields),
                'negative_cases': self._generate_negative_cases(required_fields)
            }
        
        return datasets
    
    def _extract_required_fields(self, backend_section: str) -> List[str]:
        """Extract required fields from backend implementation details."""
        required_fields = []
        
        # Look for explicit required fields mention
        required_match = re.findall(r'\(([^)]+)\s+required\)', backend_section, re.IGNORECASE)
        for match in required_match:
            fields = [f.strip() for f in match.split(',')]
            required_fields.extend(fields)
        
        # If no required fields found, assume from validation mentions
        if not required_fields:
            validation_match = re.search(r'validation.*?\(([^)]+)\)', backend_section, re.IGNORECASE)
            if validation_match:
                fields = [f.strip() for f in validation_match.group(1).split(',')]
                required_fields.extend(fields)
        
        # Remove duplicates and return
        return list(set(required_fields))
    
    def _generate_happy_path(self, required_fields: List[str]) -> Dict[str, Any]:
        """Generate valid test data for happy path scenarios."""
        data = {
            'id': str(uuid4()),
            'user_id': str(uuid4()),
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Add required fields with realistic values
        for field in required_fields:
            field_lower = field.lower()
            if 'title' in field_lower:
                data[field] = 'Calculus Textbook - 10th Edition'
            elif 'description' in field_lower:
                data[field] = 'Excellent condition calculus textbook, barely used. Perfect for engineering students.'
            elif 'category' in field_lower:
                data[field] = 'Books'
            elif 'condition' in field_lower:
                data[field] = 'like_new'
            elif 'price' in field_lower:
                data[field] = 0
            elif 'image' in field_lower:
                data[field] = ['https://example.com/image1.jpg']
            else:
                data[field] = f'valid_{field}_value'
        
        return data
    
    def _generate_edge_cases(self, required_fields: List[str]) -> Dict[str, Any]:
        """Generate edge case test data."""
        data = {
            'id': str(uuid4()),
            'user_id': str(uuid4()),
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Add edge case values
        for field in required_fields:
            field_lower = field.lower()
            if 'title' in field_lower:
                data[field] = 'A' * 255  # Maximum length
            elif 'description' in field_lower:
                data[field] = 'Special chars: áéíóú ñ @#$%^&*() 你好 🎉'
            elif 'category' in field_lower:
                data[field] = 'Other'
            elif 'condition' in field_lower:
                data[field] = 'for_parts'
            elif 'price' in field_lower:
                data[field] = 0
            elif 'image' in field_lower:
                data[field] = []  # Empty array
            else:
                data[field] = ''  # Empty string edge case
        
        return data
    
    def _generate_negative_cases(self, required_fields: List[str]) -> Dict[str, Any]:
        """Generate negative test data that should trigger validation errors."""
        data = {}
        
        # Missing required fields
        negative_cases = []
        
        # Case 1: Missing all required fields
        negative_cases.append({
            'case': 'missing_all_required_fields',
            'data': {
                'user_id': str(uuid4())
            },
            'expected_error': '400 Bad Request - Missing required fields'
        })
        
        # Case 2: Invalid data types
        invalid_data = {
            'user_id': str(uuid4())
        }
        for field in required_fields:
            field_lower = field.lower()
            if 'title' in field_lower:
                invalid_data[field] = ''  # Empty string
            elif 'description' in field_lower:
                invalid_data[field] = ''  # Empty string
            elif 'category' in field_lower:
                invalid_data[field] = 'InvalidCategory123'
            elif 'condition' in field_lower:
                invalid_data[field] = 'invalid_condition'
        
        negative_cases.append({
            'case': 'invalid_values',
            'data': invalid_data,
            'expected_error': '400 Bad Request - Invalid field values'
        })
        
        # Case 3: Unauthenticated user
        negative_cases.append({
            'case': 'unauthenticated_user',
            'data': {
                'title': 'Test Item',
                'description': 'Test description',
                'category': 'Books'
            },
            'expected_error': '401 Unauthorized - User must be authenticated'
        })
        
        return negative_cases
    
    def _generate_marketplace_datasets(self, required_fields: List[str]) -> Dict[str, Any]:
        """Generate datasets specific to Marketplace domain."""
        happy_path = {
            'id': str(uuid4()),
            'user_id': str(uuid4()),
            'title': 'Calculadora Científica Casio FX-991',
            'description': 'Calculadora científica en excelente estado, ideal para ingeniería. Incluye manual y estuche.',
            'category': 'school_supplies',
            'condition': 'like_new',
            'status': 'published',
            'images': ['https://storage.reuseiteso.mx/items/calc001.jpg'],
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        edge_cases = {
            'id': str(uuid4()),
            'user_id': str(uuid4()),
            'title': 'A' * 200,  # Very long title
            'description': 'Texto con caracteres especiales: áéíóú ñ @#$% 你好 🎉',
            'category': 'other',
            'condition': 'for_parts',
            'status': 'draft',
            'images': [],  # No images
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        negative_cases = [
            {
                'case': 'missing_required_fields',
                'data': {'user_id': str(uuid4())},
                'expected_error': '400 Bad Request - Missing required fields (title, description, category)'
            },
            {
                'case': 'invalid_category',
                'data': {
                    'user_id': str(uuid4()),
                    'title': 'Test Item',
                    'description': 'Test',
                    'category': 'invalid_category_xyz'
                },
                'expected_error': '400 Bad Request - Invalid category'
            },
            {
                'case': 'unauthenticated_user',
                'data': {
                    'title': 'Libro de Cálculo',
                    'description': 'Libro usado',
                    'category': 'books'
                },
                'expected_error': '401 Unauthorized - Authentication required'
            }
        ]
        
        return {'happy_path': happy_path, 'edge_cases': edge_cases, 'negative_cases': negative_cases}
    
    def _generate_core_datasets(self, required_fields: List[str]) -> Dict[str, Any]:
        """Generate datasets specific to Core domain (users, authentication)."""
        happy_path = {
            'id': str(uuid4()),
            'email': 'estudiante.test@iteso.mx',
            'full_name': 'María González López',
            'role': 'student',
            'status': 'active',
            'institutional_id': '123456',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'last_login': datetime.now().isoformat()
        }
        
        edge_cases = {
            'id': str(uuid4()),
            'email': 'staff.with.very.long.name.test@iteso.mx',
            'full_name': 'José María Fernández-García de la Torre y Pérez',
            'role': 'staff',
            'status': 'active',
            'institutional_id': '999999',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'last_login': None  # Never logged in
        }
        
        negative_cases = [
            {
                'case': 'invalid_email_domain',
                'data': {
                    'email': 'user@gmail.com',
                    'full_name': 'Test User',
                    'role': 'student'
                },
                'expected_error': '400 Bad Request - Email must be from @iteso.mx domain'
            },
            {
                'case': 'missing_required_fields',
                'data': {'email': 'test@iteso.mx'},
                'expected_error': '400 Bad Request - Missing required fields (full_name, role)'
            },
            {
                'case': 'invalid_role',
                'data': {
                    'email': 'test@iteso.mx',
                    'full_name': 'Test User',
                    'role': 'invalid_role'
                },
                'expected_error': '400 Bad Request - Role must be one of: student, staff, admin'
            }
        ]
        
        return {'happy_path': happy_path, 'edge_cases': edge_cases, 'negative_cases': negative_cases}
    
    def _generate_gamification_datasets(self, required_fields: List[str]) -> Dict[str, Any]:
        """Generate datasets specific to Gamification domain (points, achievements)."""
        happy_path = {
            'id': str(uuid4()),
            'user_id': str(uuid4()),
            'points': 10,
            'action': 'item_published',
            'achievement_id': None,
            'description': 'Points awarded for publishing first item',
            'co2_saved_kg': 0.5,
            'created_at': datetime.now().isoformat()
        }
        
        edge_cases = {
            'id': str(uuid4()),
            'user_id': str(uuid4()),
            'points': 100,
            'action': 'challenge_completed',
            'achievement_id': str(uuid4()),
            'description': 'Completed sustainability champion challenge - 50 items donated',
            'co2_saved_kg': 25.0,
            'created_at': datetime.now().isoformat()
        }
        
        negative_cases = [
            {
                'case': 'negative_points',
                'data': {
                    'user_id': str(uuid4()),
                    'points': -10,
                    'action': 'item_published'
                },
                'expected_error': '400 Bad Request - Points must be positive'
            },
            {
                'case': 'invalid_action',
                'data': {
                    'user_id': str(uuid4()),
                    'points': 10,
                    'action': 'invalid_action_type'
                },
                'expected_error': '400 Bad Request - Invalid action type'
            },
            {
                'case': 'missing_user_id',
                'data': {
                    'points': 10,
                    'action': 'item_donated'
                },
                'expected_error': '400 Bad Request - user_id is required'
            }
        ]
        
        return {'happy_path': happy_path, 'edge_cases': edge_cases, 'negative_cases': negative_cases}
    
    def generate_mocks(self) -> List[Dict[str, Any]]:
        """Generate mock definitions based on dependencies and implementation details."""
        mocks = []
        
        impl_details = self.sections.get('implementation_details', {})
        backend = impl_details.get('backend', '')
        potential_mocks = self.sections.get('potential_mocks', '')
        
        # Add domain-specific mocks
        if self.domain == 'marketplace':
            mocks.extend(self._generate_marketplace_mocks(backend, potential_mocks))
        elif self.domain == 'core':
            mocks.extend(self._generate_core_mocks(backend, potential_mocks))
        elif self.domain == 'gamification':
            mocks.extend(self._generate_gamification_mocks(backend, potential_mocks))
        else:
            # Generic mocks
            mocks.extend(self._generate_generic_mocks(backend, potential_mocks))
        
        return mocks
    
    def _generate_marketplace_mocks(self, backend: str, potential_mocks: str) -> List[Dict[str, Any]]:
        """Generate mocks specific to Marketplace domain."""
        mocks = []
        
        # Authentication mock (common)
        if 'authenticated' in backend.lower() or 'auth' in potential_mocks.lower():
            mocks.append({
                'name': 'AuthenticationServiceMock',
                'simulates': 'User authentication and authorization',
                'why_needed': 'Isolate marketplace operations from authentication layer',
                'response_format': {
                    'success': {
                        'user_id': str(uuid4()),
                        'email': 'test.user@iteso.mx',
                        'is_authenticated': True,
                        'role': 'student'
                    },
                    'error': {
                        'is_authenticated': False,
                        'error': 'Invalid or expired token'
                    }
                },
                'variations': ['success', 'unauthorized', 'expired_token']
            })
        
        # Database mock
        if 'database' in potential_mocks.lower() or 'endpoint' in backend.lower():
            mocks.append({
                'name': 'ItemRepositoryMock',
                'simulates': 'Database operations for items (CRUD)',
                'why_needed': 'Isolate business logic from database layer',
                'response_format': {
                    'success': {
                        'id': str(uuid4()),
                        'created': True,
                        'item': {'title': 'Test Item', 'status': 'published'}
                    },
                    'error': {
                        'created': False,
                        'error': 'Duplicate item or constraint violation'
                    }
                },
                'variations': ['success', 'duplicate_error', 'timeout', 'connection_error']
            })
        
        # Image upload mock
        if 'image' in backend.lower() or 'upload' in backend.lower():
            mocks.append({
                'name': 'ImageUploadServiceMock',
                'simulates': 'Image upload and storage service',
                'why_needed': 'Test item creation without actual file uploads',
                'response_format': {
                    'success': {
                        'uploaded': True,
                        'urls': ['https://storage.reuseiteso.mx/items/image1.jpg']
                    },
                    'error': {
                        'uploaded': False,
                        'error': 'Invalid file format or size limit exceeded'
                    }
                },
                'variations': ['success', 'invalid_format', 'size_exceeded', 'storage_full']
            })
        
        return mocks
    
    def _generate_core_mocks(self, backend: str, potential_mocks: str) -> List[Dict[str, Any]]:
        """Generate mocks specific to Core domain (auth, users)."""
        mocks = []
        
        # Institutional authentication service
        if 'institutional' in backend.lower() or 'auth' in potential_mocks.lower():
            mocks.append({
                'name': 'InstitutionalAuthServiceMock',
                'simulates': 'ITESO institutional authentication system',
                'why_needed': 'Test authentication without connecting to real ITESO auth system',
                'response_format': {
                    'success': {
                        'authenticated': True,
                        'user_id': str(uuid4()),
                        'email': 'student@iteso.mx',
                        'institutional_id': '123456',
                        'role': 'student'
                    },
                    'error': {
                        'authenticated': False,
                        'error': 'Invalid credentials or account not found'
                    }
                },
                'variations': ['success', 'invalid_credentials', 'account_suspended', 'system_unavailable']
            })
        
        # Email notification service
        if 'email' in backend.lower() or 'notification' in backend.lower():
            mocks.append({
                'name': 'EmailServiceMock',
                'simulates': 'Email notification service',
                'why_needed': 'Test user registration/notifications without sending real emails',
                'response_format': {
                    'success': {
                        'sent': True,
                        'message_id': str(uuid4())
                    },
                    'error': {
                        'sent': False,
                        'error': 'SMTP server unavailable'
                    }
                },
                'variations': ['success', 'invalid_email', 'smtp_error', 'timeout']
            })
        
        # User repository mock
        if 'database' in potential_mocks.lower():
            mocks.append({
                'name': 'UserRepositoryMock',
                'simulates': 'Database operations for users',
                'why_needed': 'Isolate user management logic from database',
                'response_format': {
                    'success': {
                        'id': str(uuid4()),
                        'created': True,
                        'user': {'email': 'test@iteso.mx', 'role': 'student'}
                    },
                    'error': {
                        'created': False,
                        'error': 'Email already exists'
                    }
                },
                'variations': ['success', 'duplicate_email', 'invalid_data', 'connection_error']
            })
        
        return mocks
    
    def _generate_gamification_mocks(self, backend: str, potential_mocks: str) -> List[Dict[str, Any]]:
        """Generate mocks specific to Gamification domain."""
        mocks = []
        
        # Points service mock
        if 'points' in backend.lower() or 'award' in backend.lower():
            mocks.append({
                'name': 'PointsServiceMock',
                'simulates': 'Points calculation and award service',
                'why_needed': 'Test point awards without dependency on external service',
                'response_format': {
                    'success': {
                        'points_awarded': 10,
                        'total_points': 150,
                        'reason': 'item_published'
                    },
                    'error': {
                        'points_awarded': 0,
                        'error': 'User not found or service unavailable'
                    }
                },
                'variations': ['success', 'user_not_found', 'service_unavailable', 'invalid_action']
            })
        
        # Achievement service mock
        if 'achievement' in backend.lower() or 'badge' in backend.lower():
            mocks.append({
                'name': 'AchievementServiceMock',
                'simulates': 'Achievement tracking and badge awarding',
                'why_needed': 'Test achievement unlocking without external dependencies',
                'response_format': {
                    'success': {
                        'achievement_unlocked': True,
                        'achievement_id': str(uuid4()),
                        'name': 'First Donation',
                        'badge_url': 'https://cdn.reuseiteso.mx/badges/first_donation.png'
                    },
                    'error': {
                        'achievement_unlocked': False,
                        'error': 'Achievement criteria not met'
                    }
                },
                'variations': ['success', 'already_unlocked', 'criteria_not_met', 'service_error']
            })
        
        # Database mock for gamification data
        if 'database' in potential_mocks.lower():
            mocks.append({
                'name': 'GamificationRepositoryMock',
                'simulates': 'Database operations for points and achievements',
                'why_needed': 'Isolate gamification logic from database layer',
                'response_format': {
                    'success': {
                        'saved': True,
                        'record_id': str(uuid4())
                    },
                    'error': {
                        'saved': False,
                        'error': 'Database constraint violation'
                    }
                },
                'variations': ['success', 'constraint_error', 'timeout', 'connection_error']
            })
        
        return mocks
    
    def _generate_generic_mocks(self, backend: str, potential_mocks: str) -> List[Dict[str, Any]]:
        """Generate generic mocks when domain is not specified."""
        mocks = []
        
        # Ensure strings are not None
        backend = backend or ''
        potential_mocks = potential_mocks or ''
        
        # Check for authentication mock
        if 'authenticated' in backend.lower() or 'auth' in potential_mocks.lower():
            mocks.append({
                'name': 'AuthenticationServiceMock',
                'simulates': 'User authentication and session validation',
                'why_needed': 'Test without requiring real authentication service',
                'response_format': {
                    'success': {
                        'user_id': str(uuid4()),
                        'email': 'test.user@iteso.mx',
                        'is_authenticated': True,
                        'roles': ['student']
                    },
                    'error': {
                        'is_authenticated': False,
                        'error': 'Invalid or expired token'
                    }
                },
                'variations': ['success', 'unauthorized', 'expired_token']
            })
        
        # Check for database mock
        if 'database' in potential_mocks.lower():
            mocks.append({
                'name': 'DatabaseMock',
                'simulates': 'Database queries and transactions',
                'why_needed': 'Isolate business logic tests from database layer',
                'response_format': {
                    'success': {
                        'id': str(uuid4()),
                        'created': True,
                        'rows_affected': 1
                    },
                    'error': {
                        'created': False,
                        'error': 'Database constraint violation'
                    }
                },
                'variations': ['success', 'constraint_violation', 'timeout', 'connection_error']
            })
        
        return mocks
    
    def generate_api_payloads(self) -> Dict[str, Any]:
        """Generate API request/response payload examples."""
        impl_details = self.sections.get('implementation_details', {})
        backend = impl_details.get('backend', '')
        
        # Extract endpoint from backend section
        endpoint_match = re.search(r'`([^`]+)`', backend)
        endpoint = endpoint_match.group(1) if endpoint_match else '/api/resource'
        
        payloads = {
            'endpoint': endpoint,
            'method': 'POST',
            'request': {
                'headers': {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer <token>'
                },
                'body': self._generate_happy_path(self._extract_required_fields(backend))
            },
            'responses': {
                '201': {
                    'description': 'Resource created successfully',
                    'body': {
                        'id': str(uuid4()),
                        'message': 'Resource created successfully',
                        'data': self._generate_happy_path(self._extract_required_fields(backend))
                    }
                },
                '400': {
                    'description': 'Bad Request - Invalid or missing fields',
                    'body': {
                        'error': 'Validation failed',
                        'details': [
                            {'field': 'field_name', 'message': 'Field validation error'}
                        ]
                    }
                },
                '401': {
                    'description': 'Unauthorized - User not authenticated',
                    'body': {
                        'error': 'Authentication required',
                        'message': 'You must be logged in to perform this action'
                    }
                },
                '409': {
                    'description': 'Conflict - Duplicate resource',
                    'body': {
                        'error': 'Duplicate entry',
                        'message': 'A resource with similar data already exists'
                    }
                },
                '500': {
                    'description': 'Internal Server Error',
                    'body': {
                        'error': 'Internal server error',
                        'message': 'An unexpected error occurred. Please try again later.'
                    }
                }
            }
        }
        
        return payloads
    
    def generate_seeds(self) -> Dict[str, Any]:
        """Generate database seed data based on domain."""
        seeds = {
            'entities': self.entities,
            'data': []
        }
        
        if self.domain == 'marketplace':
            seeds['data'] = self._generate_marketplace_seeds()
        elif self.domain == 'core':
            seeds['data'] = self._generate_core_seeds()
        elif self.domain == 'gamification':
            seeds['data'] = self._generate_gamification_seeds()
        else:
            seeds['data'] = self._generate_generic_seeds()
        
        return seeds
    
    def _generate_marketplace_seeds(self) -> List[Dict[str, Any]]:
        """Generate seed data for marketplace domain."""
        return [
            {
                'entity': 'items',
                'records': [
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'title': 'Calculus Textbook 8th Edition',
                        'description': 'Like new, minimal highlighting',
                        'category': 'Books',
                        'condition': 'like_new',
                        'status': 'active',
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    },
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'title': 'TI-84 Plus Calculator',
                        'description': 'Fully functional, includes manual',
                        'category': 'Electronics',
                        'condition': 'good',
                        'status': 'active',
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    },
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'title': 'Lab Coat - Medium',
                        'description': 'Clean, white lab coat',
                        'category': 'Clothing',
                        'condition': 'good',
                        'status': 'completed',
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                ],
                'integrity_notes': [
                    'user_id must reference existing user in users table',
                    'category must be from predefined list',
                    'condition must be one of: like_new, good, fair, for_parts',
                    'status must be one of: active, reserved, completed'
                ]
            },
            {
                'entity': 'categories',
                'records': [
                    {'id': str(uuid4()), 'name': 'Books', 'description': 'Textbooks and educational materials'},
                    {'id': str(uuid4()), 'name': 'Electronics', 'description': 'Calculators, laptops, tablets'},
                    {'id': str(uuid4()), 'name': 'Clothing', 'description': 'Lab coats, uniforms'},
                    {'id': str(uuid4()), 'name': 'Furniture', 'description': 'Desks, chairs, shelves'}
                ],
                'integrity_notes': [
                    'name must be unique',
                    'description is required'
                ]
            }
        ]
    
    def _generate_core_seeds(self) -> List[Dict[str, Any]]:
        """Generate seed data for core domain (authentication, users)."""
        return [
            {
                'entity': 'users',
                'records': [
                    {
                        'id': str(uuid4()),
                        'email': 'student1@iteso.mx',
                        'institutional_id': '123456',
                        'role': 'student',
                        'is_verified': True,
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    },
                    {
                        'id': str(uuid4()),
                        'email': 'student2@iteso.mx',
                        'institutional_id': '789012',
                        'role': 'student',
                        'is_verified': True,
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    },
                    {
                        'id': str(uuid4()),
                        'email': 'admin@iteso.mx',
                        'institutional_id': '000001',
                        'role': 'admin',
                        'is_verified': True,
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                ],
                'integrity_notes': [
                    'email must be unique and end with @iteso.mx',
                    'institutional_id must be unique',
                    'role must be one of: student, admin',
                    'is_verified must be true for active users'
                ]
            },
            {
                'entity': 'sessions',
                'records': [
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        'expires_at': (datetime.now() + timedelta(hours=24)).isoformat(),
                        'created_at': datetime.now().isoformat()
                    }
                ],
                'integrity_notes': [
                    'user_id must reference existing user',
                    'token must be unique',
                    'expires_at must be in the future'
                ]
            }
        ]
    
    def _generate_gamification_seeds(self) -> List[Dict[str, Any]]:
        """Generate seed data for gamification domain."""
        return [
            {
                'entity': 'user_points',
                'records': [
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'points': 150,
                        'level': 2,
                        'updated_at': datetime.now().isoformat()
                    },
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'points': 50,
                        'level': 1,
                        'updated_at': datetime.now().isoformat()
                    }
                ],
                'integrity_notes': [
                    'user_id must reference existing user',
                    'points must be >= 0',
                    'level calculated based on points'
                ]
            },
            {
                'entity': 'achievements',
                'records': [
                    {
                        'id': str(uuid4()),
                        'name': 'First Donation',
                        'description': 'Made your first item donation',
                        'points_reward': 10,
                        'icon': 'first_donation.png'
                    },
                    {
                        'id': str(uuid4()),
                        'name': 'Early Adopter',
                        'description': 'One of the first 100 users',
                        'points_reward': 50,
                        'icon': 'early_adopter.png'
                    }
                ],
                'integrity_notes': [
                    'name must be unique',
                    'points_reward must be > 0'
                ]
            },
            {
                'entity': 'user_achievements',
                'records': [
                    {
                        'id': str(uuid4()),
                        'user_id': str(uuid4()),
                        'achievement_id': str(uuid4()),
                        'unlocked_at': datetime.now().isoformat()
                    }
                ],
                'integrity_notes': [
                    'user_id must reference existing user',
                    'achievement_id must reference existing achievement',
                    'Combination of user_id and achievement_id must be unique'
                ]
            }
        ]
    
    def _generate_generic_seeds(self) -> List[Dict[str, Any]]:
        """Generate generic seed data when domain is unknown."""
        return [
            {
                'entity': 'resources',
                'records': [
                    {
                        'id': str(uuid4()),
                        'name': 'Resource 1',
                        'description': 'Sample resource',
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                ],
                'integrity_notes': [
                    'Adjust fields based on actual entity schema'
                ]
            }
        ]
    
    def map_coverage(self) -> List[Dict[str, Any]]:
        """Map acceptance criteria to datasets and mocks."""
        acceptance_criteria = self.sections.get('acceptance_criteria', [])
        
        coverage_map = []
        
        for i, ac in enumerate(acceptance_criteria, 1):
            mapping = {
                'criteria': f'AC-{i}',
                'description': ac,
                'datasets': [],
                'mocks': [],
                'notes': ''
            }
            
            # Map criteria to datasets based on keywords
            ac_lower = ac.lower()
            
            if 'access' in ac_lower or 'form' in ac_lower:
                mapping['datasets'].append('Happy Path')
                mapping['notes'] = 'Test with authenticated user accessing the form'
            
            if 'required' in ac_lower or 'validation' in ac_lower or 'validate' in ac_lower:
                mapping['datasets'].extend(['Happy Path', 'Negative Cases'])
                mapping['notes'] = 'Test with valid data and missing/invalid fields'
            
            if 'success' in ac_lower or 'message' in ac_lower:
                mapping['datasets'].append('Happy Path')
                mapping['mocks'].append('DatabaseMock')
                mapping['notes'] = 'Verify success response and message display'
            
            if 'redirect' in ac_lower:
                mapping['datasets'].append('Happy Path')
                mapping['notes'] = 'Verify redirect behavior after successful action'
            
            if 'error' in ac_lower:
                mapping['datasets'].append('Negative Cases')
                mapping['mocks'].append('DatabaseMock')
                mapping['notes'] = 'Test error handling and user-friendly messages'
            
            # If no specific mapping found, use Happy Path as default
            if not mapping['datasets']:
                mapping['datasets'].append('Happy Path')
                mapping['notes'] = 'Requires manual test case definition'
            
            coverage_map.append(mapping)
        
        return coverage_map
    
    def identify_risks_and_gaps(self) -> Dict[str, List[str]]:
        """Identify risks, gaps, and recommendations."""
        risks_and_gaps = {
            'missing_fields': [],
            'untestable_criteria': [],
            'unclear_dependencies': [],
            'recommendations': []
        }
        
        # Check for missing domain
        if not self.domain or self.domain == 'generic':
            risks_and_gaps['recommendations'].append(
                'Domain not specified - add "Domain: marketplace/core/gamification" for better test data generation'
            )
        
        # Check for missing implementation details
        impl_details = self.sections.get('implementation_details', {})
        if not impl_details.get('backend'):
            risks_and_gaps['missing_fields'].append('Backend implementation details missing')
        if not impl_details.get('frontend'):
            risks_and_gaps['missing_fields'].append('Frontend implementation details missing')
        if not impl_details.get('database'):
            risks_and_gaps['missing_fields'].append('Database schema details missing')
        
        # Check for vague acceptance criteria
        acceptance_criteria = self.sections.get('acceptance_criteria', [])
        for ac in acceptance_criteria:
            if len(ac.split()) < 4:
                risks_and_gaps['untestable_criteria'].append(f'"{ac}" - Too vague, needs more detail')
        
        # Check for unclear dependencies
        if not self.sections.get('dependencies'):
            risks_and_gaps['unclear_dependencies'].append('No dependency information provided')
        
        # Recommendations
        if not self.sections.get('test_data_required'):
            risks_and_gaps['recommendations'].append('Add Test Data Required section with specific examples')
        
        if not self.sections.get('potential_mocks'):
            risks_and_gaps['recommendations'].append('Identify and document potential mocks needed for testing')
        
        if self.assumptions:
            risks_and_gaps['recommendations'].append('Validate assumptions with the team before implementation')
        
        return risks_and_gaps
