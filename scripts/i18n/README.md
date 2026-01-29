# 🌍 Pokechill i18n System

System for internationalization (i18n) of Pokechill with lazy loading and translation progress tracking.

## 📁 Structure

```
scripts/
├── i18n.js                    # Core i18n system
├── i18n-integration.js        # Integration with game UI
└── i18n/
    ├── ui/
    │   ├── en.js             # English UI (base language)
    │   └── fr.js             # French UI
    ├── moves/
    │   └── fr.js             # French moves translations
    ├── items/
    │   └── fr.js             # French items translations
    ├── abilities/
    │   └── fr.js             # French abilities translations
    └── pokemon/
        └── fr.js             # French Pokémon names
```

## 🎯 How to Add Translations

### Adding a New Language

1. Create translation files in each category folder:
   - `scripts/i18n/ui/[lang].js`
   - `scripts/i18n/moves/[lang].js`
   - `scripts/i18n/items/[lang].js`
   - `scripts/i18n/abilities/[lang].js`
   - `scripts/i18n/pokemon/[lang].js`

2. Add language option in `index.html`:
```html
<option value="[lang]">[Language Name] (<span id="lang-[lang]-progress">0</span>%)</option>
```

3. Update stats initialization in `scripts/i18n.js`:
```javascript
stats: {
    en: { ui: 0, moves: 0, items: 0, abilities: 0, pokemon: 0 },
    fr: { ui: 0, moves: 0, items: 0, abilities: 0, pokemon: 0 },
    [lang]: { ui: 0, moves: 0, items: 0, abilities: 0, pokemon: 0 }
}
```

### Adding Translations to Existing Language

Example for moves (`scripts/i18n/moves/fr.js`):

```javascript
i18n.register('moves', 'fr', {
    quickAttack: {
        name: "Vive-Attaque",
        info: "Attaque en priorité"
    },
    tackle: {
        name: "Charge",
        info: "Charge l'ennemi"
    },
    // Add more...
});
```

Example for UI (`scripts/i18n/ui/fr.js`):

```javascript
i18n.register('ui', 'fr', {
    settings: "Paramètres",
    exportData: "Exporter les données",
    // Add more...
});
```

## 🔧 API Usage

### In HTML
```html
<!-- Automatic translation -->
<span data-i18n="settings">Settings</span>

<!-- JavaScript context -->
<div onclick="showMessage(i18n.t('message'))">Click</div>
```

### In JavaScript
```javascript
// UI translation
i18n.t('settings')                    // → "Paramètres" (FR) or "Settings" (EN)

// Move translations
i18n.getMoveName('quickAttack')       // → "Vive-Attaque" (FR) or "Quick Attack" (EN)
i18n.getMoveInfo('quickAttack')       // → "Attaque en priorité" (FR) or "Attacks first" (EN)

// Item translations
i18n.getItemName('potion')            // → "Potion"
i18n.getItemInfo('potion')            // → "Restaure 20 PV" (FR)

// Ability translations
i18n.getAbilityName('intimidate')     // → "Intimidation" (FR)
i18n.getAbilityInfo('intimidate')     // → Translation or original

// Pokémon names
i18n.getPokemonName('bulbasaur')      // → "Bulbizarre" (FR) or "Bulbasaur" (EN)

// Check translation progress
i18n.getProgress('fr')                // → 15 (percentage)
```

## ✨ Features

- **Lazy Loading**: Only loads translation files for the selected language
- **Automatic Fallback**: Falls back to English if translation is missing
- **Progress Tracking**: Shows completion percentage for each language
- **Modular**: Easy to add new categories or languages
- **No Breaking Changes**: Works with existing code, untranslated content stays in English

## 🎮 For Contributors

### Priority Translation Order

1. **UI (High Priority)**: Menus, buttons, settings - most visible to users
2. **Common Moves**: Top 50-100 most used moves
3. **Common Items**: Pokéballs, potions, common held items
4. **Common Abilities**: Most frequently seen abilities
5. **Pokémon Names**: Start with Gen 1-2, expand gradually

### Translation Guidelines

- Keep translations concise (especially for UI)
- Use official Pokémon translations when available
- For moves/abilities without official translations, be consistent with style
- Test translations in-game to ensure they fit in UI elements
- Add comments for context when needed

## 📊 Current Progress

| Language | UI | Moves | Items | Abilities | Pokémon | Total |
|----------|-----|-------|-------|-----------|---------|-------|
| English  | 100% | 100% | 100% | 100% | 100% | 100% |
| Français | ~40% | ~1% | ~2% | ~2% | ~3% | ~10% |

*Percentages are automatically calculated and displayed in-game*

## 🤝 Contributing

1. Pick a translation category (moves, items, abilities, etc.)
2. Add translations to the appropriate file in `scripts/i18n/[category]/[lang].js`
3. Test in-game by changing language in Settings
4. Submit PR with your translations
5. Progress percentage updates automatically!

---

**Note**: This is a community project. All translations are welcome, even partial contributions!
