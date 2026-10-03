#!/usr/bin/env python3
"""Fetch openly-licensed photos (Openverse: CC0 / Public Domain / CC BY) for the film's demo businesses.
Writes public/final/photos/<key>_<n>.jpg (max 1400 px) + public/final/photos/CREDITS.json."""
import io, json, os, time, urllib.parse, urllib.request
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public/final/photos')
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'}
Q = {
    'pizza': 'wood fired pizza', 'pasta': 'fresh pasta dish', 'trattoria': 'italian restaurant interior', 'oven': 'pizza oven fire',
    'tiramisu': 'tiramisu dessert', 'wine': 'restaurant table wine', 'chef': 'chef kitchen cooking', 'brunch': 'brunch plate',
    'nails': 'nail salon manicure', 'barber': 'barber shop haircut', 'cafe': 'coffee shop latte', 'tacos': 'tacos plate',
    'bbq': 'barbecue brisket', 'gym': 'gym interior weights', 'florist': 'flower bouquet florist', 'flowers': 'flower shop',
    'bakery': 'bakery bread', 'noodles': 'ramen noodles bowl', 'dental': 'dental clinic', 'yoga': 'yoga studio',
    'storefront': 'restaurant storefront street', 'bar': 'cocktail bar', 'salad': 'salad bowl', 'burger': 'burger restaurant',
}
N = int(os.environ.get('N', 6))
credits = {}
for key, q in Q.items():
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license': 'cc0,pdm,by', 'page_size': 20, 'aspect_ratio': '', 'size': 'large'})
    try:
        res = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))['results']
    except Exception as e:
        print('search fail', key, e); continue
    got = 0
    for r in sorted(res, key=lambda r: (r['license'] not in ('cc0', 'pdm'), -(r.get('width') or 0))):
        if got >= N: break
        if (r.get('width') or 0) < 900: continue
        try:
            data = urllib.request.urlopen(urllib.request.Request(r['url'], headers=UA), timeout=30).read()
            im = Image.open(io.BytesIO(data)).convert('RGB')
        except Exception:
            continue
        im.thumbnail((1400, 1400))
        name = f'{key}_{got}.jpg'
        im.save(os.path.join(OUT, name), quality=88)
        credits[name] = {'title': r.get('title'), 'creator': r.get('creator'), 'license': r['license'], 'license_version': r.get('license_version'), 'source': r.get('foreign_landing_url'), 'license_url': r.get('license_url')}
        got += 1
    print(key, got)
    time.sleep(0.5)
json.dump(credits, open(os.path.join(OUT, 'CREDITS.json'), 'w'), indent=1)
