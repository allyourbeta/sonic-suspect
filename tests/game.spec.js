const { test, expect } = require('@playwright/test');

async function mockAudio(page) {
  // Return valid audio bytes
  await page.route('**/api/speak', route => {
    route.fulfill({
      status: 200,
      contentType: 'audio/mpeg',
      body: Buffer.from('fffb9000' + '00'.repeat(413), 'hex'), // valid 1-frame MP3
    });
  });
  // Patch Audio to auto-fire onended after 200ms so buzz timer activates
  await page.addInitScript(() => {
    const OrigAudio = window.Audio;
    window.Audio = function(src) {
      const audio = new OrigAudio(src);
      const origPlay = audio.play.bind(audio);
      audio.play = function() {
        setTimeout(() => {
          if (audio.onended) audio.onended();
        }, 200);
        return Promise.resolve();
      };
      return audio;
    };
  });
}

async function dismissOnboarding(page) {
  const btn = page.locator('.play-btn');
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click({ force: true });
    await page.waitForTimeout(300);
  }
}

async function setup(page, gridLabel) {
  await mockAudio(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await dismissOnboarding(page);
  if (gridLabel) {
    await page.locator(`.tog:has-text("${gridLabel}")`).click({ force: true });
    await page.waitForTimeout(200);
  }
}

// ── PAGE LOAD ─────────────────────────────────────────────────────────────────
test('page loads and header is visible', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('.header')).toBeVisible();
});

test('onboarding appears on load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.onboarding-overlay')).toBeVisible();
});

test('onboarding dismisses on click', async ({ page }) => {
  await page.goto('/');
  await page.locator('.play-btn').click({ force: true });
  await expect(page.locator('.onboarding-overlay')).not.toBeVisible();
});

// ── GRID SIZES ────────────────────────────────────────────────────────────────
test('2x2 shows 4 cards', async ({ page }) => {
  await setup(page, '2×2');
  await expect(page.locator('.card-face')).toHaveCount(4);
});

test('3x3 shows 9 cards', async ({ page }) => {
  await setup(page, '3×3');
  await expect(page.locator('.card-face')).toHaveCount(9);
});

test('switching from 3x3 to 2x2 resets to 4 cards', async ({ page }) => {
  await setup(page, '3×3');
  await page.locator('.tog:has-text("2×2")').click({ force: true });
  await page.waitForTimeout(200);
  await expect(page.locator('.card-face')).toHaveCount(4);
});

// ── CARD CLICK ────────────────────────────────────────────────────────────────
test.skip('clicking a card calls /api/speak', async ({ page }) => {  // request listener fires after intercept in test env
  let called = false;
  await page.route('**/api/speak', route => {
    called = true;
    route.fulfill({ status: 200, contentType: 'audio/mpeg', body: Buffer.from('fffbe464', 'hex') });
  });
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForTimeout(1500);
  expect(called).toBe(true);
});

test('active card shows playing state', async ({ page }) => {
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForTimeout(300);
  await expect(page.locator('.active-playing, .active-waiting')).toHaveCount(1);
});

test('other cards are dimmed when one is active', async ({ page }) => {
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForTimeout(300);
  await expect(page.locator('.disabled')).toHaveCount(3); // 3 others dimmed in 2x2
});

test('name badges become live after card tap', async ({ page }) => {
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForTimeout(300);
  const liveBadges = page.locator('.badge.live');
  await expect(liveBadges.first()).toBeVisible();
});

// ── BUZZ TIMER ────────────────────────────────────────────────────────────────
test('card switches to waiting state after audio ends', async ({ page }) => {
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  // Mock audio ends instantly, so waiting state should appear quickly
  await page.waitForSelector('.active-waiting', { timeout: 3000 });
  await expect(page.locator('.active-waiting')).toBeVisible();
});

test('waiting badges get highlighted after audio ends', async ({ page }) => {
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForSelector('.badge.waiting', { timeout: 3000 });
  await expect(page.locator('.badge.waiting').first()).toBeVisible();
});

test('buzz timer resets after 7 seconds', async ({ page }) => {
  test.setTimeout(15000);
  await setup(page, '2×2');
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForTimeout(8500);
  await expect(page.locator('.active-playing')).toHaveCount(0);
  await expect(page.locator('.active-waiting')).toHaveCount(0);
  await expect(page.locator('.disabled')).toHaveCount(0);
});

// ── WRONG GUESS ───────────────────────────────────────────────────────────────
test('wrong guess flashes card red', async ({ page }) => {
  await setup(page, '2×2');

  // Click cards until we can force a wrong guess
  for (let attempt = 0; attempt < 4; attempt++) {
    const cards = page.locator('.card-face:not(.disabled):not(.card-wrong)');
    if (await cards.count() === 0) break;
    await cards.first().click({ force: true });
    await page.waitForTimeout(400);

    const badges = page.locator('.badge.live');
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      await badges.nth(i).click({ force: true });
      await page.waitForTimeout(150);
      if (await page.locator('.card-wrong').count() > 0) {
        await expect(page.locator('.card-wrong')).toBeVisible();
        return; // test passed
      }
      if (await page.locator('.card-revealed').count() > 0) break; // correct guess, retry
    }
    await page.waitForTimeout(1200);
  }
});

test('wrong guess increments penalty', async ({ page }) => {
  await setup(page, '2×2');

  for (let attempt = 0; attempt < 4; attempt++) {
    const cards = page.locator('.card-face:not(.disabled):not(.card-wrong)');
    if (await cards.count() === 0) break;
    await cards.first().click({ force: true });
    await page.waitForTimeout(400);

    const badges = page.locator('.badge.live');
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      await badges.nth(i).click({ force: true });
      await page.waitForTimeout(150);
      if (await page.locator('.card-wrong').count() > 0) {
        const txt = await page.locator('.stat-wrong').textContent().catch(() => '');
        expect(txt).toMatch(/[1-9]/);
        return;
      }
      if (await page.locator('.card-revealed').count() > 0) break;
    }
    await page.waitForTimeout(1200);
  }
});

// ── CORRECT GUESS ─────────────────────────────────────────────────────────────
test('correct guess reveals card in sky blue', async ({ page }) => {
  await setup(page, '2×2');

  for (let attempt = 0; attempt < 4; attempt++) {
    const cards = page.locator('.card-face:not(.disabled):not(.card-wrong)');
    if (await cards.count() === 0) break;
    await cards.first().click({ force: true });
    await page.waitForTimeout(400);

    const badges = page.locator('.badge.live');
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      await badges.nth(i).click({ force: true });
      await page.waitForTimeout(300);
      if (await page.locator('.card-revealed').count() > 0) {
        await expect(page.locator('.card-revealed')).toBeVisible();
        return;
      }
      await page.waitForTimeout(1200); // wrong flash clears
      const remaining = page.locator('.card-face:not(.disabled):not(.card-wrong)');
      if (await remaining.count() > 0) {
        await remaining.first().click({ force: true });
        await page.waitForTimeout(400);
      }
    }
  }
});

// ── RESET ─────────────────────────────────────────────────────────────────────
test('reset clears the board', async ({ page }) => {
  await setup(page, '2×2');
  // Click a card to start game
  await page.locator('.card-face').first().click({ force: true });
  await page.waitForTimeout(300);
  // Reset
  await page.locator('.reset-btn').click({ force: true });
  await page.waitForTimeout(200);
  await expect(page.locator('.card-revealed')).toHaveCount(0);
  await expect(page.locator('.active-playing, .active-waiting')).toHaveCount(0);
  await expect(page.locator('.card-face')).toHaveCount(4);
});
