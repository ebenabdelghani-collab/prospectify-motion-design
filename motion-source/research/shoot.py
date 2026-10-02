import asyncio, json
from playwright.async_api import async_playwright
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=['--no-sandbox'])
        for name, vp in [('desktop', {'width':1440,'height':900}), ('mobile', {'width':390,'height':844})]:
            ctx = await b.new_context(viewport=vp, device_scale_factor=2, locale='en-US', ignore_https_errors=False)
            pg = await ctx.new_page()
            await pg.goto('https://prospectify.net/', wait_until='networkidle', timeout=90000)
            await pg.wait_for_timeout(2500)
            # scroll through to trigger lazy/animated sections
            h = await pg.evaluate('document.body.scrollHeight')
            for y in range(0, h, 600):
                await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(250)
            await pg.evaluate('window.scrollTo(0,0)'); await pg.wait_for_timeout(800)
            await pg.screenshot(path=f'landing-{name}-full.png', full_page=True)
            await pg.screenshot(path=f'landing-{name}-hero.png')
            if name=='desktop':
                css = await pg.evaluate('''() => { const s=getComputedStyle(document.documentElement); const out={}; for (const v of ['--bg','--bg-2','--surface','--surface-2','--text','--text-2','--text-3','--accent','--accent-bright','--accent-2','--border','--card']) out[v]=s.getPropertyValue(v).trim(); out.bodyFont=getComputedStyle(document.body).fontFamily; out.bodyBg=getComputedStyle(document.body).backgroundColor; return out; }''')
                json.dump(css, open('computed-tokens.json','w'), indent=1); print(css)
                for path in ['/finder','/login']:
                    await pg.goto('https://prospectify.net'+path, wait_until='networkidle', timeout=90000); await pg.wait_for_timeout(2000)
                    await pg.screenshot(path=f'public{path.replace("/","-")}-desktop.png', full_page=True)
                    print(path, pg.url)
            await ctx.close()
        await b.close()
asyncio.run(main())
