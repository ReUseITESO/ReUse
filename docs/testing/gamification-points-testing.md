# Testing Guide for Gamification Points Feature

## Backend Tests

### Location
`backend/gamification/tests/test_points_views.py`

### Running Tests
```bash
cd backend
python manage.py test gamification.tests.test_points_views
```

### Test Coverage

#### Authentication Tests (✅ Implemented)
- ✅ Unauthenticated request returns 401
- ✅ Invalid user ID returns 401

#### Happy Path Tests (✅ Implemented)
- ✅ Authenticated user gets correct points
- ✅ Different users see their own points
- ✅ User with 0 points gets valid response

#### Data Format Tests (✅ Implemented)
- ✅ Response has correct JSON structure
- ✅ Points field is numeric (not string)

#### User Lookup Tests (✅ Implemented)
- ✅ Can retrieve points for specific user by ID
- ✅ Non-existent user returns 404

### Expected Results
All tests should pass. Run with:
```bash
python manage.py test gamification.tests -v 2
```

---

## Frontend Tests

### Testing Framework Setup Required

**Current Status:** No testing framework configured

**Recommended Setup:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### Test Cases to Implement

#### PointsBalance Component Tests

**File to create:** `frontend/src/components/gamification/__tests__/PointsBalance.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import PointsBalance from '../PointsBalance';
import { MockAuthProvider } from '@/context/MockAuthContext';

describe('PointsBalance', () => {
  it('shows loading state initially', () => {
    // Test: should show "Cargando puntos..."
  });

  it('shows warning when no user is selected', () => {
    // Test: should show "Sin usuario seleccionado"
  });

  it('displays points correctly when loaded', () => {
    // Test: should show "150" when user has 150 points
  });

  it('shows error message with retry button', () => {
    // Test: should show error and "Reintentar" button
  });

  it('displays 0 when points is null', () => {
    // Test: fallback to 0 is working
  });
});
```

#### useUserPoints Hook Tests

**File to create:** `frontend/src/hooks/__tests__/useUserPoints.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUserPoints } from '../useUserPoints';

describe('useUserPoints', () => {
  it('fetches points when userId is provided', () => {
    // Test: API call is made with correct userId
  });

  it('sets error when no userId provided', () => {
    // Test: error message when userId is null
  });

  it('refetches points when userId changes', () => {
    // Test: changing user triggers new fetch
  });
});
```

---

## Manual Testing Checklist

### User Story Acceptance Criteria

#### ✅ 1. User can access the view
- [ ] Navigate to `/dashboard` - points visible
- [ ] Navigate to `/profile` - points visible
- [ ] Both pages accessible from navigation menu

#### ✅ 2. All relevant information is displayed
- [ ] Total points number is visible
- [ ] Label "Puntos Acumulados" is shown
- [ ] Description text about earning points is displayed
- [ ] Star icon (⭐) is present

#### ✅ 3. Data is formatted correctly
- [ ] Points display as whole numbers (150, not 150.00)
- [ ] Shows "0" when user has no points
- [ ] Large, readable font size
- [ ] Proper alignment and spacing

#### ✅ 4. Loading states are shown while fetching data
- [ ] Skeleton animation appears on initial load
- [ ] "Cargando puntos..." text is visible
- [ ] Loading state appears when switching users

#### ✅ 5. Error messages are clear and actionable
- [ ] "Sin usuario seleccionado" warning when not authenticated
- [ ] Clear message when API fails
- [ ] "Reintentar" button appears on error
- [ ] Error messages are in Spanish
- [ ] Different messages for different error types (401, 404)

### User Switching Tests

1. **Load dashboard without user:**
   - [ ] Should show yellow warning box

2. **Select Ana García:**
   - [ ] Points update to 150 (or current value)
   - [ ] No page reload needed

3. **Switch to Carlos López:**
   - [ ] Points update to 80 (or current value)
   - [ ] Transition is smooth

4. **Switch to María Torres:**
   - [ ] Points update to current value
   - [ ] No console errors

5. **Switch to "Sin usuario":**
   - [ ] Warning message appears
   - [ ] No API errors in console

### Responsive Design Tests

- [ ] Desktop (1920px): Layout looks good
- [ ] Laptop (1280px): Layout looks good
- [ ] Tablet (768px): Component is readable
- [ ] Mobile (375px): Content fits without horizontal scroll

### Edge Cases

- [ ] User with 0 points: Displays "0"
- [ ] User with 9999+ points: Number fits in container
- [ ] Slow network: Loading state persists appropriately
- [ ] API down: Error message shown with retry option
- [ ] Multiple rapid user switches: No race conditions

### API Integration Tests

1. **Test endpoint directly:**
```bash
curl -H "X-Mock-User-Id: 1" http://localhost:8000/api/gamification/points/
```
Expected: `{"points": 150}`

2. **Test without auth:**
```bash
curl http://localhost:8000/api/gamification/points/
```
Expected: 401 error

3. **Test with invalid user:**
```bash
curl -H "X-Mock-User-Id: 99999" http://localhost:8000/api/gamification/points/
```
Expected: 401 error

---

## Performance Tests

- [ ] Initial load time < 2 seconds
- [ ] User switch response < 500ms
- [ ] No memory leaks when switching users repeatedly
- [ ] API calls are not duplicated

---

## Accessibility Tests

- [ ] Can navigate with keyboard only
- [ ] Focus states are visible
- [ ] Screen reader announces point changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Error messages are announced by screen reader

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Test Data Setup

### Quick setup command:
```bash
cd backend
python manage.py create_mock_users
```

This creates:
- Ana García (ID: 1) → 120 points
- Carlos López (ID: 2) → 80 points  
- María Torres (ID: 3) → 200 points

### Update points manually:
```bash
python manage.py shell -c "from core.models import User; u = User.objects.get(id=1); u.points = 500; u.save()"
```
