const { request } = require('@playwright/test');

(async () => {
  const api = 'http://localhost:8000/api';
  const users = [
    { email: 'test@iteso.mx', password: 'test1234' },
    { email: 'rodrigo@iteso.mx', password: 'rodrigo1234' },
    { email: 'carlos@iteso.mx', password: 'carlos1234' },
    { email: 'maria@iteso.mx', password: 'maria1234' },
    { email: 'jose.chavez@iteso.mx', password: 'ReUse2026!' },
    { email: 'ana.martinez@iteso.mx', password: 'test' },
    { email: 'lucia.fernandez@iteso.mx', password: 'test' },
  ];
  for (const user of users) {
    const ctx = await request.newContext();
    const response = await ctx.post(`${api}/auth/signin/`, { data: user });
    console.log(user.email, response.status(), await response.text());
    await ctx.dispose();
  }
})();
