# Noel Baba karakteri

Uygulamadaki Noel Baba gerçek zamanlı 3D'dir (three.js). Görünüm ve hareket kodda, model Blender'da üretilir.

| Dosya | Ne işe yarar |
|---|---|
| `build_character.py` | Modeli sıfırdan kurar (sakal tutamları, kürk, şapka, toka…) ve `export_glb()` ile web'e aktarır |
| `build_santa.py` | Blender içinde mod önizlemesi (wave / thinking / sad / celebrate) ve `reset_pose()` |
| `santa.blend` | Kaynak sahne |
| `web/santa-lab.html` | Geliştirme sayfası: 4 modu yan yana canlı gösterir, durağan kareleri üretir |
| `../src/components/christmas/santa3d/santaStage.ts` | three.js motoru: toon gölgelendirme, kontur, prosedürel animasyon |
| `../src/components/christmas/SantaCharacter.vue` | Sayfalarda kullanılan bileşen |

## Modeli değiştirmek

1. Blender'da `santa.blend`'i aç, Scripting sekmesinde:
   ```python
   P = "/.../letsraffle-web/art/"
   ns = {}
   exec(open(P + "build_character.py").read(), ns)
   exec(open(P + "build_santa.py").read(), ns)
   ns["build_character"](); ns["toon_scene"]()
   ns["export_glb"](P + "renders/santa_raw.glb")
   ```
2. Sıkıştır: `npm run santa:pack` → `src/assets/characters/santa.glb` (~630 KB, gzip ile ~380 KB)
3. Kontrol: `npm run dev` → http://localhost:5173/art/web/santa-lab.html

## Durağan kareler

Hareket azaltma tercihi olanlar, WebGL olmayan cihazlar ve model yüklenene kadar gösterilen
`src/assets/characters/santa-<mood>-still.webp` dosyaları `santa-lab.html?still=<mood>&t=<saniye>&w=240&dpr=2`
sayfasının ekran görüntüsünden alınır (şeffaf arka plan).

## Hareketleri ayarlamak

Tüm hareketler `santaStage.ts` içindeki `MOODS` fonksiyonlarındadır (zaman → poz).
Göz kırpma, bakış, nefes, şapka/ponpon yay fiziği ve tıklama tepkisi modlardan bağımsız katmanlardır.
