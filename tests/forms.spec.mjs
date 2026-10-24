// End-to-end guard for every form on the site.
//
// Why this exists: for a month after launch the Subscribe box showed "You're on the
// list" without sending anything anywhere. This suite loads the *built* site
// (dist/app.js, exactly what GitHub Pages serves), fills in every form on every
// page, and fails unless a real submission leaves the browser.
//
//   npm test            (builds first, then runs this)
//
// Network is intercepted: nothing reaches Web3Forms or Substack during the test.

import { test, expect } from "@playwright/test";

const RELAY = "https://api.web3forms.com/submit";
const SUBSTACK = /https:\/\/collinwallace\.substack\.com\/subscribe/;

// Every EmailCapture placement on the site, by page. If you add or remove one,
// update this table — the test also asserts the *count* so a lost box is noticed.
const CAPTURE_BOXES = {
  home:    { subscribe: 2, waitlist: 1 },   // hero (one of several layouts) + final block; book waitlist
  writing: { subscribe: 2, waitlist: 0 },
  book:    { subscribe: 0, waitlist: 2 },
  about:   { subscribe: 1, waitlist: 0 },
};

async function interceptRelay(page) {
  const posts = [];
  await page.route(RELAY, async (route) => {
    const req = route.request();
    posts.push(JSON.parse(req.postData() || "{}"));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "ok" }) });
  });
  return posts;
}

async function interceptSubstack(page) {
  const hits = [];
  await page.route(SUBSTACK, async (route) => {
    hits.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/html", body: "<title>substack stub</title>" });
  });
  return hits;
}

// Fields are `<div class="field"><label>…</label><input/></div>` with no `for=`,
// so locate by the label's text rather than accessible name.
function field(scope, label) {
  return scope.locator(`.field:has(label:text-is("${label}"))`).locator("input, textarea, select").first();
}

async function open(page, route) {
  await page.goto(`/#/${route}`);
  await page.waitForSelector("#root .header", { timeout: 15000 });
  // Pages lazy-load CMS JSON; give forms a beat to render.
  await page.waitForTimeout(300);
}

test.describe("newsletter + waitlist boxes", () => {
  for (const [route, counts] of Object.entries(CAPTURE_BOXES)) {
    test(`${route}: every capture box relays to Web3Forms and hands off to Substack`, async ({ page }) => {
      await open(page, route);
      const forms = page.locator("form.capture");
      const n = await forms.count();
      expect(n, `expected ${counts.subscribe + counts.waitlist} capture boxes on /${route}, found ${n}`)
        .toBe(counts.subscribe + counts.waitlist);
      for (const kind of ["subscribe", "waitlist"]) {
        expect(await page.locator(`form.capture[data-form="${kind}"]`).count(), `${kind} boxes on /${route}`).toBe(counts[kind]);
      }

      for (let i = 0; i < n; i++) {
        await open(page, route); // fresh page per box: a submit navigates away
        const posts = await interceptRelay(page);
        const hits = await interceptSubstack(page);
        const form = page.locator("form.capture").nth(i);
        const kind = await form.getAttribute("data-form");
        const email = `test+${route}-${i}@example.com`;
        await form.scrollIntoViewIfNeeded();
        await form.locator('input[type="email"]').fill(email);
        await form.locator('button[type="submit"]').click();
        await page.waitForURL(SUBSTACK, { timeout: 10000 });

        expect(posts, `box #${i} on /${route} must POST to Web3Forms`).toHaveLength(1);
        expect(posts[0].access_key, "access key from data/site/forms.json").toMatch(/^[0-9a-f-]{36}$/);
        expect(posts[0].email).toBe(email);
        expect(posts[0].form).toBe(kind);
        expect(posts[0].subject).toContain("[collinwallace.com]");
        expect(hits, `box #${i} on /${route} must hand off to Substack`).toHaveLength(1);
        expect(hits[0]).toContain("email=" + encodeURIComponent(email));
      }
    });
  }

  test("relay outage still hands off to Substack (signup never dropped)", async ({ page }) => {
    await open(page, "home");
    await page.route(RELAY, (route) => route.abort("failed"));
    const hits = await interceptSubstack(page);
    const form = page.locator("form.capture").first();
    await form.locator('input[type="email"]').fill("outage@example.com");
    await form.locator('button[type="submit"]').click();
    await page.waitForURL(SUBSTACK, { timeout: 10000 });
    expect(hits).toHaveLength(1);
  });
});

test.describe("contact + speaking forms", () => {
  test("contact form relays every field", async ({ page }) => {
    await open(page, "contact");
    const posts = await interceptRelay(page);
    await field(page, "What is this about?").selectOption("press");
    await field(page, "Name").fill("Test Person");
    await field(page, "Email").fill("press@example.com");
    await field(page, "Outlet").fill("The Example Times");
    await field(page, "Message").fill("Hello from the test suite.");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.locator(".capture-success")).toContainText("Message received");
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      form: "Contact — Press", name: "Test Person", email: "press@example.com",
      outlet: "The Example Times", message: "Hello from the test suite.", replyto: "press@example.com",
    });
  });

  test("speaking inquiry relays every field", async ({ page }) => {
    await open(page, "speaking");
    const posts = await interceptRelay(page);
    const form = page.locator("#inquiry form");
    await field(form, "Your name").fill("Event Host");
    await field(form, "Email").fill("host@example.com");
    await field(form, "Organization").fill("Example Corp");
    await field(form, "Event name").fill("Example Summit");
    await field(form, "Audience size").selectOption("200–1,000");
    await field(form, "Topic interest").selectOption({ index: 1 });
    await field(form, "Message").fill("We'd love to have you.");
    await form.getByRole("button", { name: /send inquiry/i }).click();
    await expect(page.locator(".capture-success")).toContainText("message received");
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      form: "Speaking inquiry", name: "Event Host", email: "host@example.com",
      organization: "Example Corp", event: "Example Summit", audience_size: "200–1,000", message: "We'd love to have you.",
    });
  });

  test("contact form shows an error (not a false success) when the relay fails", async ({ page }) => {
    await open(page, "contact");
    await page.route(RELAY, (route) => route.fulfill({ status: 500, body: "{}" }));
    await field(page, "Name").fill("Test Person");
    await field(page, "Email").fill("x@example.com");
    await field(page, "Message").fill("Hi");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.locator("form p.small")).toContainText("Something went wrong");
    await expect(page.locator(".capture-success")).toHaveCount(0);
  });
});

test("no form on the site can succeed without a network submission", async ({ page }) => {
  // Belt and braces: sweep every page, submit every <form>, and insist that each
  // one either POSTs to the relay or navigates to Substack. Catches a future form
  // that is added without being wired up, even if the tables above aren't updated.
  for (const route of ["home", "writing", "book", "speaking", "about", "contact"]) {
    await open(page, route);
    const n = await page.locator("form").count();
    for (let i = 0; i < n; i++) {
      await open(page, route);
      const posts = await interceptRelay(page);
      const hits = await interceptSubstack(page);
      const form = page.locator("form").nth(i);
      await form.scrollIntoViewIfNeeded();
      for (const input of await form.locator("input:not([type=checkbox]):not([type=hidden]), textarea").all()) {
        const type = (await input.getAttribute("type")) || "text";
        if (type === "date") continue;
        await input.fill(type === "email" ? `sweep-${route}-${i}@example.com` : "sweep");
      }
      await form.locator('button[type="submit"]').click();
      await Promise.race([
        page.waitForURL(SUBSTACK, { timeout: 5000 }).catch(() => {}),
        page.waitForResponse(RELAY, { timeout: 5000 }).catch(() => {}),
      ]);
      await page.waitForTimeout(200);
      expect(posts.length + hits.length, `form #${i} on /${route} submitted nothing`).toBeGreaterThan(0);
    }
  }
});
