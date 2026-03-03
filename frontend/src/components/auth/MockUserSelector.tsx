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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {currentUser?.name}
        </span>
      )}
      <select
        id="mock-user-select"
        aria-label="Seleccionar usuario"
        value={currentUser?.id ?? ''}
        onChange={handleChange}
        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white transition-colors focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        <option value="" className="bg-iteso-900 text-white">
          Sin usuario
        </option>
        {availableUsers.map(user => (
          <option key={user.id} value={user.id} className="bg-iteso-900 text-white">
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
