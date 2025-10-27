# Image Generation Guide for SteppersLife Mock Data

This guide provides AI image generation prompts and Unsplash search terms to generate category-appropriate images for all mock data.

## Using AI Image Generators

You can use any of these AI image generation services:
- **DALL-E 3** (OpenAI)
- **Midjourney**
- **Stable Diffusion**
- **Adobe Firefly**
- **Leonardo.ai**

## Using Unsplash API

Current implementation uses Unsplash with specific search terms. Replace `UNSPLASH_PHOTO_ID` in URLs:
```
https://images.unsplash.com/photo-{PHOTO_ID}?w=800&q=80
```

---

## Events Images

### AI Prompts for Events:
```
1. "Elegant African American couple dancing Chicago stepping in formal attire at upscale ballroom, warm lighting, photorealistic"
2. "Grand hotel ballroom filled with dancers in elegant formal wear, chandeliers, wide angle"
3. "Sunset cruise ship on lake with dancing silhouettes, romantic evening atmosphere"
4. "Masquerade ball with elegant masks, couples dancing, Halloween themed decor, sophisticated"
5. "Dance class with instructor teaching couple, bright studio, welcoming atmosphere"
6. "Outdoor park event with people dancing, food trucks, summer festival vibes, Chicago skyline"
```

### Unsplash Search Terms:
- `ballroom dancing couples elegant`
- `formal dance event ballroom`
- `luxury cruise ship sunset`
- `masquerade ball elegant`
- `dance class instruction`
- `outdoor park festival chicago`

---

## Magazine Articles Images

### AI Prompts for Magazine:
```
1. "Vintage photo of Chicago stepping dancers from 1970s, sepia tone, historical documentary style"
2. "Calendar with event markers, steppin shoes and music notes, lifestyle photography"
3. "Fashion editorial of elegant stepping outfit, men's suit and women's flowing dress, studio shot"
4. "Diverse group of beginners learning Chicago stepping, encouraging atmosphere, bright colors"
5. "Close-up of DJ turntables with R&B vinyl records, vintage and modern mix"
6. "African American couple in matching dance attire, elegant pose, fashion photography"
```

### Unsplash Search Terms:
- `vintage dance couples 1970s`
- `event calendar planning`
- `elegant fashion formal wear`
- `dance workshop group class`
- `dj turntables vinyl records`
- `couple matching outfits elegant`

---

## Stores/Products Images

### AI Prompts for Products:
```
1. "Black t-shirt with vintage Chicago stepping graphic design, product photography, white background"
2. "Premium men's leather dance shoes with suede sole, studio lighting, ecommerce photo"
3. "Royal blue flowing evening dress on mannequin, dance-friendly fabric, fashion photography"
4. "Vinyl record collection with classic R&B albums for stepping, flat lay photography"
5. "Silver women's dance heels with ankle strap, elegant product shot, white background"
6. "Classic black fedora hat on display stand, timeless style, product photography"
```

### Unsplash Search Terms:
- `black t-shirt mockup graphic`
- `men's leather dress shoes`
- `evening gown blue elegant`
- `vinyl records r&b soul`
- `women's dance heels silver`
- `fedora hat classic style`

---

## Restaurants Images

### AI Prompts for Restaurants:
```
1. "Soul food platter with fried chicken, mac and cheese, collard greens, food photography, appetizing"
2. "Deep dish Chicago pizza close-up, cheese pull, dramatic lighting, food photography"
3. "Crispy fried chicken wings with sauce, garnished, commercial food photography"
4. "Homestyle comfort food plate, warm lighting, southern cooking, inviting presentation"
5. "Hot buffalo wings with celery and ranch, sports bar style, vibrant colors"
```

### Unsplash Search Terms:
- `soul food fried chicken`
- `chicago deep dish pizza`
- `buffalo wings restaurant`
- `comfort food homestyle`
- `chicken wings food photography`

---

## Classes/Courses Images

### AI Prompts for Classes:
```
1. "Beginner dance class with instructor and students, welcoming atmosphere, bright studio"
2. "Advanced dance workshop with professional dancers, dynamic movement, energetic"
3. "Private dance lesson couple with instructor, intimate setting, focused learning"
4. "Group choreography class, synchronized dancers, fun atmosphere, diverse students"
5. "Partner work workshop, dancers practicing technique, supportive environment"
```

### Unsplash Search Terms:
- `dance class beginner lesson`
- `ballroom dance workshop`
- `private dance instruction couple`
- `group dance choreography`
- `partner dance practice`

---

## Services Images

### AI Prompts for Services:
```
1. "Professional DJ setup with turntables and mixer at elegant event, dramatic lighting"
2. "Professional photographer with camera at formal dance event, candid moment"
3. "Videographer with cinema camera filming dance event, professional equipment"
4. "Elegant event venue ballroom with chandeliers, empty and ready for party"
5. "Catering spread with elegant food display, upscale event catering"
6. "Dance instructor demonstrating moves, professional teaching environment"
```

### Unsplash Search Terms:
- `dj equipment turntables event`
- `event photographer camera`
- `videographer cinema camera`
- `elegant ballroom venue empty`
- `catering buffet elegant`
- `dance instructor teaching`

---

## Batch Image Generation Commands

### For DALL-E 3 (Python):
```python
from openai import OpenAI
client = OpenAI()

prompts = [
    "Elegant African American couple dancing Chicago stepping in formal attire...",
    # ... add all prompts
]

for i, prompt in enumerate(prompts):
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1792x1024",
        quality="standard",
        n=1,
    )
    # Save image_url to your mock data
    print(f"Image {i}: {response.data[0].url}")
```

### For Midjourney (Discord Bot):
```
/imagine prompt: Elegant African American couple dancing Chicago stepping in formal attire at upscale ballroom, warm lighting, photorealistic --ar 16:9 --v 6
```

### For Stable Diffusion (Automatic1111):
```
Positive: elegant african american couple, chicago stepping dance, formal attire, upscale ballroom, warm lighting, photorealistic, high quality, 8k
Negative: blurry, low quality, distorted, amateur
Size: 1024x576 (16:9)
```

---

## Best Practices

1. **Consistency**: Use similar lighting and style across images in the same category
2. **Diversity**: Show diverse representation in all images
3. **Quality**: Use high resolution (minimum 800px width for web)
4. **Relevance**: Ensure images match the specific content description
5. **Rights**: Use royalty-free images or properly licensed content
6. **Optimization**: Compress images for web (use tools like TinyPNG)

---

## Quick Replacement Script

To quickly update all mock data images with new URLs:

```bash
# Replace event image
sed -i 's|photo-OLD_ID|photo-NEW_ID|g' lib/mock-data/events.ts

# Or use Node.js script to batch update
node scripts/update-mock-images.js
```

---

## Alternative: Use Pexels API

Pexels also offers free stock photos via API:

```javascript
const PEXELS_API_KEY = 'your_api_key';

fetch('https://api.pexels.com/v1/search?query=ballroom+dancing&per_page=10', {
  headers: { Authorization: PEXELS_API_KEY }
})
.then(res => res.json())
.then(data => console.log(data.photos));
```

---

## Current Image Status

✅ Events: Updated with themed Unsplash images
✅ Magazine: Updated with themed Unsplash images
✅ Stores: Updated with themed Unsplash images
✅ Restaurants: Updated with themed Unsplash images
✅ Classes: Updated with themed Unsplash images
✅ Services: Updated with themed Unsplash images

All mock data images have been updated with category-appropriate Unsplash photos matching the content themes.
