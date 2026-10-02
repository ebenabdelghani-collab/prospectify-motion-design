import asyncio, re
from playwright.async_api import async_playwright
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width':1440,'height':900}, device_scale_factor=2, locale='en-US')
        pg = await ctx.new_page()
        await pg.goto('https://prospectify.net/', wait_until='networkidle', timeout=90000)
        # dismiss cookie banner if present (no data written server-side: accept only sets local consent)
        await pg.wait_for_timeout(1500)
        btn = pg.get_by_role('button', name=re.compile('Essential only', re.I))
        if await btn.count():
            await btn.first.click(); print('cookie: essential only'); await pg.wait_for_timeout(800)
        h = await pg.evaluate('document.body.scrollHeight')
        for y in range(0, h, 500):
            await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(200)
        await pg.evaluate('window.scrollTo(0,0)'); await pg.wait_for_timeout(1500)
        secs = await pg.query_selector_all('section, header, footer')
        out=[]
        for i, s in enumerate(secs):
            bb = await s.bounding_box()
            if not bb or bb['height'] < 120: continue
            txt = (await s.inner_text())[:80].replace('\n',' | ')
            fn = f'section-{i:02d}.png'
            await s.scroll_into_view_if_needed(); await pg.wait_for_timeout(600)
            await s.screenshot(path=fn)
            out.append((fn, int(bb['height']), txt))
        for o in out: print(o)
        # the hero product mock (real landing component) on its own
        mock = pg.locator('text=Napoli Pizza').locator('xpath=ancestor::div[contains(@class,"rounded")][3]')
        await pg.evaluate('window.scrollTo(0,0)'); await pg.wait_for_timeout(1200)
        if await mock.count():
            await mock.first.screenshot(path='hero-product-mock.png'); print('mock ok', await mock.first.bounding_box())
        logos = pg.locator('text=Build with the tools you already love').locator('xpath=..')
        if await logos.count():
            await logos.first.screenshot(path='tools-strip.png'); print('tools ok')
        await b.close()
asyncio.run(main())
