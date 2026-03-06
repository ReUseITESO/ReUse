# Gamification - Points Feature

## Overview
Feature that allows authenticated ITESO users to view their total points balance in their profile and dashboard.

**Status:** ✅ Complete (90% - Production ready with mock auth)

**Priority:** High

---

## Implementation Summary

### ✅ Completed Features

#### Backend
- ✅ `GET /api/gamification/points/` - Current user's points
- ✅ `GET /api/gamification/points/<user_id>/` - Specific user's points
- ✅ Mock authentication middleware integration
- ✅ CORS configuration for development
- ✅ Comprehensive test suite (11 tests)

#### Frontend
- ✅ Dashboard page (`/dashboard`) with points display
- ✅ Profile page (`/profile`) with points display
- ✅ Loading states (skeleton animation)
- ✅ Error handling (401, 404, network errors)
- ✅ Warning when no user selected
- ✅ Reactive user switching (no reload needed)
- ✅ Responsive design (mobile & desktop)
- ✅ Manual testing guide

---

## File Structure

```
backend/
├── gamification/
│   ├── views/
│   │   └── points.py              # Points API views
│   ├── urls.py                     # Gamification routes
│   └── tests/
│       └── test_points_views.py   # Backend tests (11 tests)
└── config/
    └── settings.py                 # CORS config

frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Dashboard with points
│   │   └── profile/
│   │       └── page.tsx           # Profile with points
│   ├── components/
│   │   └── gamification/
│   │       └── PointsBalance.tsx  # Points display component
│   ├── hooks/
│   │   └── useUserPoints.ts       # Points data fetching hook
│   └── types/
│       └── gamification.ts        # TypeScript types

docs/
└── testing/
    └── gamification-points-testing.md  # Testing guide
```

---

## API Documentation

### Get Current User Points
**Endpoint:** `GET /api/gamification/points/`

**Auth Required:** Yes (X-Mock-User-Id header in dev)

**Success Response (200 OK):**
```json
{
  "points": 150
}
```

**Error Responses:**
- `401 Unauthorized` - No auth header or invalid user
- `500 Internal Server Error` - Server error

---

### Get Specific User Points
**Endpoint:** `GET /api/gamification/points/<user_id>/`

**Auth Required:** No

**Success Response (200 OK):**
```json
{
  "points": 200
}
```

**Error Responses:**
- `404 Not Found` - User doesn't exist

---

## Usage

### Backend Setup
```bash
cd backend
python manage.py create_mock_users  # Create test users
python manage.py test gamification.tests  # Run tests
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Accessing the Feature
1. Open http://localhost:3000
2. Select a user from the dropdown (Ana García, Carlos López, María Torres)
3. Navigate to **Dashboard** or **Perfil** from the menu
4. View points balance

---

## Testing

### Run Backend Tests
```bash
cd backend
python manage.py test gamification.tests.test_points_views -v 2
```

**Test Coverage:**
- Authentication (2 tests)
- Happy path (3 tests)
- Data format (2 tests)
- User lookup (2 tests)
- Edge cases (2 tests)

**All 11 tests should pass ✅**

### Manual Testing
See [Testing Guide](../testing/gamification-points-testing.md) for complete checklist.

Quick verification:
1. Load dashboard without user → Warning shown
2. Select Ana García → Points display (150)
3. Switch to Carlos López → Points update (80)
4. Open profile page → Points visible there too

---

## User Story Fulfillment

| Criterion | Status | Evidence |
|-----------|--------|----------|
| User can access the view | ✅ | Dashboard + Profile pages |
| All relevant information displayed | ✅ | Points, label, description, icon |
| Data formatted correctly | ✅ | Number display, fallback to 0 |
| Loading states shown | ✅ | Skeleton animation |
| Error messages clear | ✅ | Specific messages for 401, 404 |

**Overall Completion: 90%**

---

## Technical Details

### Authentication (Development)
Uses `MockAuthMiddleware` with `X-Mock-User-Id` header.

**Header:** `X-Mock-User-Id: 1`

**Flow:**
1. Frontend stores selected user ID in localStorage
2. API client adds header to all requests
3. Middleware attaches user to `request.mock_user`
4. View reads from `request.mock_user`

### Data Model
Points stored in `core.User` model:
```python
class User(AbstractUser):
    points = models.IntegerField(default=0)
    # ... other fields
```

### Frontend State Management
- `useMockAuth()` - Current user context
- `useUserPoints(userId)` - Points data fetching
- Auto-refetch when userId changes

---

## Known Limitations

1. **JWT Auth:** Currently using mock auth for development
   - TODO: Integrate with real JWT authentication
   - Mock auth middleware should be disabled in production

2. **Frontend Tests:** No automated tests yet
   - Test framework not configured
   - Manual testing checklist provided instead

3. **Real-time Updates:** Points don't update automatically
   - User must refresh or switch users to see changes
   - Consider WebSocket for live updates

4. **Profile View:** Basic implementation
   - Could be enhanced with more user details
   - Badge display pending

---

## Future Enhancements

### High Priority
- [ ] Replace mock auth with JWT authentication
- [ ] Add automated frontend tests (Jest + React Testing Library)
- [ ] Set up CI/CD pipeline for tests

### Medium Priority
- [ ] Real-time points updates (WebSocket)
- [ ] Points history/transaction log
- [ ] Animations on point changes
- [ ] Export test data fixtures

### Low Priority
- [ ] Points leaderboard
- [ ] Points analytics dashboard
- [ ] Share achievements on social media

---

## Troubleshooting

### Points not loading
1. Check user is selected in dropdown
2. Verify backend is running (`python manage.py runserver`)
3. Check console for CORS errors
4. Verify user exists in database

### CORS Error
Ensure `CORS_ALLOW_HEADERS` includes `x-mock-user-id` in `settings.py`:
```python
CORS_ALLOW_HEADERS = [
    # ... other headers
    "x-mock-user-id",
]
```

### User not found
Create mock users:
```bash
python manage.py create_mock_users
```

---

## Related Documentation
- [User Story](../../agents/user-story-generator/examples/output-example.md)
- [Testing Guide](../testing/gamification-points-testing.md)
- [API Docs](http://localhost:8000/api/docs/)
- [Frontend Writing Rules](../../reglas_de_escritura_front.md)
- [Backend Writing Rules](../../reglas_de_escritura_back.md)

---

## Contributors
Implementation Date: March 1, 2026

---

## License
Part of ReUseITESO platform
