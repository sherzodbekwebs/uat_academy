# UAT Academy — React + Vite

## Ishga tushirish
Node.js 20.19+ yoki 22.12+ tavsiya etiladi.

```bash
npm install
npm run dev
```

Production:
```bash
npm test
npm run build
```
`dist/` Vercel, Netlify yoki statik hostingga joylashtiriladi.

## Ma’lumot va testlar
- API: https://api.uzautotrailer.uz/products
- Snapshot: 2026-10-09; 59 ta model, 1673 texnik qator. API butun massiv qaytardi, pagination wrapper yo‘q.
- Asl javob src/data/products.json da to‘liq saqlangan.
- Javob kaliti RU techSpecs qiymatlari. UZ/EN maydonlaridagi ayrim mazmuniy farqlar tufayli ruscha atamalar saqlangan; interfeys va savol yo‘riqnomasi o‘zbekcha.
- Bir xil maydon nomi turli bo‘limlarda uchrasa, savolda bo‘lim aniq ko‘rsatiladi.
- Testlar texnik qiymatlar va ikkita qiymatli murakkab konfiguratsiya savollaridan tuziladi. Har boshlashda savollar va variantlar aralashtiriladi.
- Noto‘g‘ri variantlar xuddi shu bo‘lim/maydonning boshqa modellardagi qiymatlari yoki yaqin sonli modifikatsiyalardan olingan. Ular fakt sifatida ko‘rsatilmaydi.
- To‘rt modelda techSpecs bo‘sh: ularning testlari faqat katalog toifasi va nomdagi g‘ildirak formulasidan iborat. Batafsil savol uchun API’ni to‘ldirish kerak.
- Narx savolga kiritilmagan. Bo‘sh va ishonchli 3 ta chalg‘ituvchi variant tuzib bo‘lmaydigan matnli maydonlar savolga aylantirilmagan; barchasi O‘rganish jadvalida mavjud.
- 54901 bak hajmi: jadval/tavsif 1300 l, advantages 1400 l. Test savoli faqat jadval qiymatini so‘raydi. Manba va tahlil bo‘limida tekshirish kerak bo‘lgan takror maydonlar bor.
- localStorage faqat shu qurilma/brauzerning natijalarini saqlaydi. Server, parol, shaxsiy ma’lumot va API kaliti talab qilinmaydi.
- API snapshotni yangilash: `curl -L https://api.uzautotrailer.uz/products -o src/data/products.json` so‘ng `npm test && npm run build`. Testlar yangi katalogdan qayta tuziladi.
- Internet rasmlar uchun kerak; savollar paketdagi JSON asosida API vaqtincha ishlamasa ham ochiladi. Rasmlar yuklanmasa karta/test ishlashda davom etadi.

## Tuzilma
`src/engine.js` — savollar, aralashtirish, manba auditi.
`src/main.jsx` — katalog, o‘rganish, test, tezkor izoh, natija va xatolar.
`src/style.css` — responsive interfeys.
`scripts/validate.mjs` — barcha modellarning qamrovi, variantlarning takrorlanmasligi, bir to‘g‘ri javob va manba dalili tekshiruvi.
