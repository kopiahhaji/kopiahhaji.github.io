# Iqra Learning Modules

This directory contains the Iqra learning modules for the Digital Dakwah Platform.

## Directory Structure

```
assets/iqra/
├── iqra-1/          # Huruf Hijaiyyah (Arabic Letters)
│   ├── page-1.html  # Introduction & Alif-Ba-Ta-Tsa
│   ├── page-2.html  # Jim-Ha-Kha-Dal
│   ├── page-3.html  # Dzal-Ra-Zay-Sin
│   └── ...
├── iqra-2/          # Baris & Fathah (Fathah Diacritics)
│   ├── page-1.html  # Introduction to Fathah
│   └── ...
├── iqra-3/          # Kasrah & Dhammah
├── iqra-4/          # Tanwin & Sukun
├── iqra-5/          # Mad & Waqaf
└── iqra-6/          # Tajwid Asas (Basic Tajweed)
```

## How to Add Your Iqra Content

1. **Copy your PDF/image files** from `O:\Projects\Files\Buku Iqra' Lengkap (Jilid 1-6)`
2. **Convert to HTML pages** or reference the images directly
3. **Update file paths** in the corresponding directories
4. **Maintain the naming convention**: `page-1.html`, `page-2.html`, etc.

## Module Information

| Module | Focus Topic | Color Theme | Pages |
|--------|-------------|-------------|-------|
| Iqra 1 | Huruf Hijaiyyah | Green (#059669) | ~20 |
| Iqra 2 | Baris & Fathah | Blue (#0891b2) | ~22 |
| Iqra 3 | Kasrah & Dhammah | Purple (#7c3aed) | ~24 |
| Iqra 4 | Tanwin & Sukun | Orange (#ea580c) | ~26 |
| Iqra 5 | Mad & Waqaf | Teal (#0d9488) | ~28 |
| Iqra 6 | Tajwid Asas | Emerald (#059669) | ~30 |

## Integration Notes

The Iqra modules are integrated into the Al-Quran Learning section of `ustaz.html` with:
- Interactive module selection
- Page navigation controls
- Fallback content generation
- Responsive iframe display
- Audio and practice mode placeholders
