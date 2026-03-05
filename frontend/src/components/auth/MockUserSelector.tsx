'use client';

import { useMockAuth } from '@/context/MockAuthContext';

export default function MockUserSelector() {
  const { currentUser, availableUsers, isAuthenticated, login, logout } = useMockAuth();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    if (value === '') {
      logout();
    } else {
      login(Number(value));
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      {isAuthenticated && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {currentUser?.name}
        </span>
      )}
      <select
        id="mock-user-select"
        aria-label="Seleccionar usuario"
        value={currentUser?.id ?? ''}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">Sin usuario</option>
        {availableUsers.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
