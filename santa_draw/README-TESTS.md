# Test Documentation

Bu proje için yazılmış test dosyalarının dokümantasyonu.

## Test Framework

Proje **Vitest** kullanarak test yazılmıştır. Vitest, Vite tabanlı hızlı bir test framework'üdür.

## Kurulum

Test bağımlılıklarını yüklemek için:

```bash
npm install
```

## Test Çalıştırma

### Tüm testleri çalıştır
```bash
npm run test
```

### Watch modunda çalıştır
```bash
npm run test -- --watch
```

### UI ile çalıştır
```bash
npm run test:ui
```

### Coverage raporu ile çalıştır
```bash
npm run test:coverage
```

## Test Dosyaları

### Composables Tests

#### `useDrawForm.test.ts`
- Form validasyonu testleri
- Participant ekleme/düzenleme/silme testleri
- Email duplicate kontrolü testleri
- Required field kontrolü testleri

#### `useManualCreate.test.ts`
- Manuel çekiliş oluşturma testleri
- Minimum participant kontrolü testleri
- API çağrıları testleri
- Confetti animasyonu testleri
- Draw reset testleri

#### `useUserDraws.test.ts`
- User draw fetch testleri
- Draw detail fetch testleri
- Status filtreleme testleri (active, in_progress, completed)
- Error handling testleri

### Component Tests

#### `DrawSuccessModal.test.ts`
- Modal görünürlük testleri
- Custom props testleri
- Event emit testleri
- Default translations testleri

#### `Input.test.ts`
- Input rendering testleri
- Validation message testleri
- Password toggle testleri
- Event emit testleri
- Disabled state testleri

#### `LanguageSwitcher.test.ts`
- Language selection testleri
- Locale change testleri
- UI rendering testleri

## Test Yapısı

Test dosyaları ilgili kaynak dosyalarının yanında `.test.ts` uzantısı ile yer alır:

```
src/
├── composables/
│   └── draw/
│       ├── useDrawForm.ts
│       ├── useDrawForm.test.ts
│       ├── useManualCreate.ts
│       ├── useManualCreate.test.ts
│       ├── useUserDraws.ts
│       └── useUserDraws.test.ts
└── components/
    ├── draw/
    │   ├── DrawSuccessModal.vue
    │   └── DrawSuccessModal.test.ts
    └── ui-kit/
        ├── input/
        │   ├── Input.vue
        │   └── Input.test.ts
        ├── LanguageSwitcher.vue
        └── LanguageSwitcher.test.ts
```

## Mock'lar

Test setup dosyası (`src/test/setup.ts`) aşağıdaki mock'ları içerir:

- `window.matchMedia`
- `localStorage`
- `navigator.clipboard`
- `vue-i18n` (useI18n)
- `@/services/api`
- `canvas-confetti`

## Test Coverage

Test coverage raporu oluşturmak için:

```bash
npm run test:coverage
```

Coverage raporu `coverage/` klasöründe oluşturulur.

## Notlar

- Testler `jsdom` environment'ında çalışır
- Vue component testleri için `@vue/test-utils` kullanılır
- i18n testleri için `createI18n` mock'lanır
- API çağrıları mock'lanır

