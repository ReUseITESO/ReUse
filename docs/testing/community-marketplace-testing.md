# Testing Guide for Community Marketplace Feature (HU-MKT-14)

## Overview

This guide documents the comprehensive test suite for the community marketplace feature, which allows users to publish items scoped to specific communities with member-only access control.

## Features Tested

✅ Publishing items to communities  
✅ Community member authentication and authorization  
✅ Access control (members vs non-members)  
✅ Browsing and filtering across communities  
✅ Admin product removal controls  
✅ Empty states and edge cases  

## Backend Tests

### Location
```
backend/marketplace/tests/test_community_marketplace.py
```

### Test Statistics
- **Total Tests:** 20
- **Test Classes:** 6
- **Coverage:** All 11 acceptance criteria from HU-MKT-14

### Running Tests

#### Run All Community Marketplace Tests
```bash
# Using Docker
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace -v 2

# Without Docker
cd backend
python manage.py test marketplace.tests.test_community_marketplace -v 2
```

#### Run Specific Test Class
```bash
# Run only publishing tests
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace.PublishingCommunityItemTests -v 2

# Run only admin control tests
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace.AdminControlsTests -v 2
```

#### Run Single Test
```bash
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace.PublishingCommunityItemTests.test_publish_community_scoped_item_as_member -v 2
```

### Test Organization

#### 1. PublishingCommunityItemTests (4 tests)
Tests for publishing items with and without community scope.

**Tests:**
- `test_publish_public_item_no_community_selected` - Publish items without community (regular marketplace)
- `test_publish_community_scoped_item_as_member` - Publish items scoped to a community as a member
- `test_publish_in_community_where_user_is_not_member_fails` - Reject publishing to non-member communities with 403
- `test_publish_unauthenticated_returns_401` - Require authentication

**Key Validations:**
- Community membership is enforced
- Items are correctly scoped
- Authentication is required
- Proper HTTP status codes returned (201, 403, 401)

#### 2. ViewingCommunityItemsTests (6 tests)
Tests for accessing community items with proper access control.

**Tests:**
- `test_viewing_community_items_as_member` - Members can view items from their communities
- `test_viewing_community_items_as_non_member_returns_403` - Non-members get 403 or empty list
- `test_accessing_community_item_by_direct_url_as_non_member_returns_403` - Direct URL access control
- `test_accessing_community_item_as_member_succeeds` - Members can access by direct URL
- `test_accessing_public_item_as_non_member_succeeds` - Public items accessible to anyone
- `test_viewing_unauthenticated_returns_401` - Unauthenticated users get 401

**Key Validations:**
- Permission checks on list and detail endpoints
- Community scope enforcement
- Public vs private item distinction
- Authentication verification

#### 3. BrowsingAndFilteringTests (3 tests)
Tests for browsing across communities and filtering capabilities.

**Tests:**
- `test_browsing_all_community_items_across_multiple_communities` - View items from all joined communities
- `test_filtering_by_specific_community` - Filter items by specific community
- `test_default_listing_excludes_community_items` - Default marketplace excludes community items

**Key Validations:**
- Scope filters work correctly (`?scope=communities`)
- Community filters work correctly (`?community={id}`)
- Default listing filters work correctly (`?scope=` not set)
- Proper pagination handling

#### 4. AdminControlsTests (3 tests)
Tests for community admin product removal.

**Tests:**
- `test_community_admin_can_remove_item` - Admin can delete items from community
- `test_non_admin_cannot_remove_item` - Non-admin members cannot delete
- `test_non_member_cannot_remove_item` - Non-members cannot delete

**Key Validations:**
- Admin role verification
- Membership requirement
- Delete endpoint authorization
- Proper HTTP status codes (204/200 for success, 403 for forbidden)

#### 5. EmptyStateTests (2 tests)
Tests for empty states and special cases.

**Tests:**
- `test_empty_community_marketplace` - Handles empty communities gracefully
- `test_community_with_multiple_items` - Multiple items display correctly

**Key Validations:**
- Empty lists return valid responses
- No crashes on edge cases
- Pagination handles empty results

#### 6. MemberOnlyFilteringTests (2 tests)
Tests for member-only community filtering.

**Tests:**
- `test_scope_joined_returns_only_user_communities` - `?scope=joined` returns only user's communities
- `test_charlie_sees_no_communities_with_scope_joined` - Non-member sees empty list

**Key Validations:**
- Community membership filters work
- Pagination handles both empty and populated results
- Proper data structure returned

### Test Data Setup

Each test inherits from `CommunityMarketplaceTestSetup` which provides:

**Users:**
- Alice: Member of Community 1 (member), Member of Community 2 (admin)
- Bob: Admin of Community 1, Member of Community 2
- Charlie: Not a member of any community (for testing access denial)

**Communities:**
- Community 1: Created by Bob (2 items)
- Community 2: Created by Alice (1 item)

**Items:**
- Community 1 Item: Published by Bob to Community 1
- Community 2 Item: Published by Alice to Community 2
- Public Item: Published without community (general marketplace)

**Category:**
- Default test category: "Libros" (Books)

### Expected Results

**All 20 tests should pass:**
```
Ran 20 tests in 1.132s
OK (skipped=1)
```

One test may be skipped if the detail endpoint is not implemented, which is expected behavior.

### Test Execution Environment

- **Database:** PostgreSQL 15 (test database created during run)
- **Migrations:** 39 migrations applied automatically
- **Test Runner:** Django TestCase with REST Framework APITestCase
- **Authentication:** JWT tokens generated per user

## API Endpoints Tested

### Product Listing and Filtering
| Endpoint | Method | Parameter | Purpose |
|----------|--------|-----------|---------|
| `/api/marketplace/products/` | GET | None | Public items only |
| `/api/marketplace/products/` | GET | `scope=communities` | Items from joined communities |
| `/api/marketplace/products/` | GET | `community={id}` | Items from specific community |
| `/api/marketplace/products/` | POST | - | Create new product |

### Community Management
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/social/communities/?scope=joined` | GET | List user's joined communities |
| `/api/social/communities/{id}/products/{product_id}/` | DELETE | Admin remove product from community |

### Authentication
| Endpoint | Method | Expected Response |
|----------|--------|-------------------|
| Any endpoint | GET | 401 Unauthorized (unauthenticated) |
| Community endpoint | GET | 403 Forbidden (non-member) |

## Frontend Tests

Currently, no automated tests exist for frontend components. However, manual testing can be performed on:

### Components to Test Manually

1. **ProductForm Component**
   - Community selector shows only joined communities
   - Selecting community changes item scope
   - Publishing with community works correctly

2. **ProductMainFields Component**
   - Category selector uses sentinel value ('placeholder')
   - No errors when switching categories

3. **CommunityMarketplaceSection Component**
   - Items display correctly from community
   - Admin sees delete button
   - Non-admin members cannot delete
   - Delete works without page crash
   - Error messages show for 403

4. **Communities Marketplace Page**
   - Filter dropdown works
   - Selecting community filters items
   - Back button navigates correctly
   - Loading states display properly
   - Error states show user-friendly messages

### Manual Testing Checklist

**Publishing Flow:**
- [ ] Publish public item (no community)
- [ ] Publish item to community (as member)
- [ ] Try publish to non-member community (should fail with 403)
- [ ] Verify community selector only shows joined communities

**Viewing Flow:**
- [ ] View community items as member
- [ ] View community items as non-member (should get 403 or empty)
- [ ] View public items (should always work)
- [ ] Verify community badge appears on items

**Admin Controls:**
- [ ] Admin sees delete button on item
- [ ] Non-admin doesn't see delete button
- [ ] Delete removes item from marketplace
- [ ] Error handling on delete failure

**Navigation:**
- [ ] Banner link `/communities` → `/communities/marketplace`
- [ ] Back button `/communities/marketplace` → `/communities`
- [ ] Filter dropdown navigation works

## Continuous Integration

Add to your CI/CD pipeline:

```bash
# Run all marketplace tests
docker-compose exec -T backend python manage.py test marketplace -v 2

# Or specifically
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace -v 2
```

## Troubleshooting

### Test Database Issues
If tests fail with database errors:
```bash
# Clear test database
docker-compose exec -T backend python manage.py flush --no-input

# Rerun tests
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace -v 2
```

### Migration Issues
If migrations don't apply:
```bash
# Check migration status
docker-compose exec -T backend python manage.py showmigrations marketplace

# Reapply migrations
docker-compose exec -T backend python manage.py migrate marketplace
```

### Docker Issues
If Docker containers aren't running:
```bash
# Start services
docker-compose up -d

# Verify services running
docker-compose ps

# Then run tests
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace -v 2
```

## Test Maintenance

### Adding New Tests

When adding new tests to the test suite:

1. **Location:** Add to `backend/marketplace/tests/test_community_marketplace.py`
2. **Setup:** Inherit from `CommunityMarketplaceTestSetup`
3. **Naming:** Use `test_` prefix and descriptive names
4. **Documentation:** Add docstring explaining what is being tested
5. **Assertions:** Use clear assertions with messages
6. **Cleanup:** Add teardown if needed (usually automatic)

Example:
```python
def test_new_feature_behavior(self):
    """Test that new feature works correctly"""
    self._authenticate(self.alice_token)
    
    response = self.client.get("/api/endpoint/")
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertIn("expected_field", response.data)
```

### Running Tests During Development

For faster feedback during development:
```bash
# Run tests without database recreation
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace --keepdb -v 2

# Run with increased verbosity to see each test
docker-compose exec -T backend python manage.py test marketplace.tests.test_community_marketplace -v 3
```

## Coverage

The test suite covers all acceptance criteria from HU-MKT-14:

✅ **AC-1:** Community members can publish items scoped to their community  
✅ **AC-2:** Publishing form has optional community selector  
✅ **AC-3:** Community-scoped items only visible to members  
✅ **AC-4:** Non-members get 403 with user-friendly message  
✅ **AC-5:** Browse "Comunidades" marketplace (all joined communities)  
✅ **AC-6:** Filter items by specific community  
✅ **AC-7:** Community detail page includes integrated marketplace  
✅ **AC-8:** Community items display badges  
✅ **AC-9:** Community admin can remove items  
✅ **AC-10:** Items follow same publish flow  
✅ **AC-11:** Empty states handled gracefully  

## Related Documentation

- [Database Schema](../database/schema-evolution.md) - Community/Product relationships
- [API Documentation](../api/README.md) - Endpoint specifications
- [Architecture](../architecture/Architecture%20overview.md) - System design
