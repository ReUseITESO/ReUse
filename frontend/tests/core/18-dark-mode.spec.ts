import { test, expect, type Page } from '@playwright/test';

const HOME_URL = '/';

/*
Pasos implementados (MCP Playwright):
1. Abrir home y ubicar el toggle visible por aria-label.
2. Validar alternancia claro/oscuro y etiqueta accesible del boton.
3. Validar persistencia tras recarga.
4. Validar degradacion ante error de localStorage para key "theme".
5. Validar acceso por teclado (Enter).
6. Validar preferencia inicial de sistema (dark/light).
7. Validar sincronizacion de tema entre pestanas.
*/

async function goToHome(page: Page) {
	await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
}

async function getVisibleThemeToggle(page: Page) {
	const toggle = page.locator('button[aria-label^="Cambiar a modo"]:visible').first();
	await expect(toggle).toBeVisible();
	return toggle;
}

async function readThemeState(page: Page) {
	return page.evaluate(() => ({
		isDark: document.documentElement.classList.contains('dark'),
		htmlClass: document.documentElement.className,
		storedTheme: localStorage.getItem('theme'),
		labels: Array.from(document.querySelectorAll('button[aria-label^="Cambiar a modo"]')).map(btn =>
			btn.getAttribute('aria-label'),
		),
	}));
}

test.describe('TEST-CORE-18 - Dark mode toggle E2E', () => {
	test.beforeEach(async ({ page }) => {
		await goToHome(page);
		await page.evaluate(() => localStorage.removeItem('theme'));
		await page.reload({ waitUntil: 'domcontentloaded' });
	});

	test('happy path: It alternates between light and dark using the visible toggle.', async ({ page }) => {
		const toggle = await getVisibleThemeToggle(page);

		const initialState = await readThemeState(page);
		expect(initialState.isDark).toBe(false);
		expect(initialState.storedTheme).toBeNull();
		expect(initialState.labels[0]).toContain('oscuro');

		await toggle.click();
		const afterFirstClick = await readThemeState(page);
		expect(afterFirstClick.isDark).toBe(true);
		expect(afterFirstClick.storedTheme).toBe('dark');
		expect(afterFirstClick.labels[0]).toContain('claro');

		await toggle.click();
		const afterSecondClick = await readThemeState(page);
		expect(afterSecondClick.isDark).toBe(false);
		expect(afterSecondClick.storedTheme).toBe('light');
		expect(afterSecondClick.labels[0]).toContain('oscuro');
	});

	test('medium path: persists preference after reload', async ({ page }) => {
		const toggle = await getVisibleThemeToggle(page);
		await toggle.click();

		await page.reload({ waitUntil: 'domcontentloaded' });
		const afterReload = await readThemeState(page);

		expect(afterReload.isDark).toBe(true);
		expect(afterReload.storedTheme).toBe('dark');
	});

	test('error scenario: localStorage theme failure and UI remains functional', async ({ browser }) => {
		const context = await browser.newContext();

		await context.addInitScript(() => {
			const nativeSetItem = Storage.prototype.setItem;
			Storage.prototype.setItem = function (key, value) {
				if (key === 'theme') {
					throw new Error('Simulated localStorage failure for theme key');
				}
				return nativeSetItem.call(this, key, value);
			};
		});

		const page = await context.newPage();
		await goToHome(page);

		const toggle = await getVisibleThemeToggle(page);
		await toggle.click();

		const state = await readThemeState(page);
		expect(state.isDark).toBe(true);
		expect(state.storedTheme).toBeNull();

		await context.close();
	});

	test('additional case: accessible by keyboard (Enter)', async ({ page }) => {
		const toggle = await getVisibleThemeToggle(page);
		await toggle.focus();
		await page.keyboard.press('Enter');

		const state = await readThemeState(page);
		expect(state.isDark).toBe(true);
		expect(state.storedTheme).toBe('dark');
	});

	test('additional case: respects prefers-color-scheme on first visit', async ({ browser }) => {
		const darkContext = await browser.newContext({ colorScheme: 'dark' });
		const darkPage = await darkContext.newPage();
		await goToHome(darkPage);
		await darkPage.evaluate(() => localStorage.removeItem('theme'));
		await darkPage.reload({ waitUntil: 'domcontentloaded' });

		const darkState = await readThemeState(darkPage);
		expect(darkState.isDark).toBe(true);
		expect(darkState.storedTheme).toBeNull();
		await darkContext.close();

		const lightContext = await browser.newContext({ colorScheme: 'light' });
		const lightPage = await lightContext.newPage();
		await goToHome(lightPage);
		await lightPage.evaluate(() => localStorage.removeItem('theme'));
		await lightPage.reload({ waitUntil: 'domcontentloaded' });

		const lightState = await readThemeState(lightPage);
		expect(lightState.isDark).toBe(false);
		expect(lightState.storedTheme).toBeNull();
		await lightContext.close();
	});

	test('additional case: synchronizes the theme between tabs of the same context', async ({ browser }) => {
		const context = await browser.newContext();
		const firstPage = await context.newPage();
		const secondPage = await context.newPage();

		await goToHome(firstPage);
		await goToHome(secondPage);

		await firstPage.evaluate(() => localStorage.setItem('theme', 'light'));
		await firstPage.reload({ waitUntil: 'domcontentloaded' });
		await secondPage.reload({ waitUntil: 'domcontentloaded' });

		const toggle = await getVisibleThemeToggle(firstPage);
		await toggle.click();

		await secondPage.waitForFunction(() => document.documentElement.classList.contains('dark'));
		const secondState = await readThemeState(secondPage);

		expect(secondState.isDark).toBe(true);
		expect(secondState.storedTheme).toBe('dark');

		await context.close();
	});
});
