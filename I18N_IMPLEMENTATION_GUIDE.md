# i18n Implementation Guide

## ✅ Completed Setup

1. **i18n Libraries Installed**: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
2. **Configuration**: `frontend/src/i18n/config.ts` - Configured with English (en) and French (fr)
3. **Translation Files**: 
   - `frontend/src/i18n/locales/en/translation.json` - English translations
   - `frontend/src/i18n/locales/fr/translation.json` - French translations
4. **Language Switcher**: `frontend/src/components/common/LanguageSwitcher.tsx` - Added to Navbar
5. **Initial Components Updated**:
   - Sidebar (navigation items)
   - Navbar (profile menu)
   - AdminDashboard (example page)

## 📝 How to Use Translations

### Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### With Variables

```tsx
const { t } = useTranslation();
const userName = 'John';

// Translation key: "dashboard.welcome": "Welcome back, {{name}}!"
<h1>{t('dashboard.welcome', { name: userName })}</h1>
```

### Translation Keys Structure

All keys are organized by feature area:
- `common.*` - Common UI elements (buttons, labels, etc.)
- `auth.*` - Authentication pages
- `dashboard.*` - Dashboard pages
- `players.*` - Player management
- `matches.*` - Match management
- `stats.*` - Statistics
- `teams.*` - Team management
- `users.*` - User management
- `scout.*` - Scout-specific pages
- `navigation.*` - Navigation items
- `errors.*` - Error messages

## 🔄 Remaining Work

### Components to Update

1. **Common Components** (Priority: High)
   - `Button.tsx` - Button labels
   - `Modal.tsx` - Modal titles, buttons
   - `ConfirmDialog.tsx` - Dialog messages
   - `EmptyState.tsx` - Empty state messages
   - `LoadingSpinner.tsx` - Loading text
   - `Input.tsx` - Placeholders, labels
   - `Select.tsx` - Placeholders
   - `Table.tsx` - Table headers

2. **Layout Components** (Priority: High)
   - `PageHeader.tsx` - Titles, subtitles
   - `Breadcrumb.tsx` - Breadcrumb labels

3. **Page Components** (Priority: Medium)
   - All admin pages (`PlayersPage`, `TeamsPage`, `MatchesPage`, `UsersPage`)
   - All player pages (`PlayerDashboard`, `PlayerStatsPage`, `PlayerMatchesPage`)
   - All scout pages (`ScoutDashboard`, `ScoutPlayersPage`, `PlayerDetailPage`)
   - Auth pages (`LoginPage`, `RegisterPage`)

4. **Form Components** (Priority: Medium)
   - `PlayerModal.tsx`
   - `MatchModal.tsx`
   - `StatsEntryModal.tsx`
   - All form labels, placeholders, validation messages

### Pattern to Follow

1. **Import useTranslation**:
   ```tsx
   import { useTranslation } from 'react-i18next';
   ```

2. **Get translation function**:
   ```tsx
   const { t } = useTranslation();
   ```

3. **Replace hardcoded strings**:
   ```tsx
   // Before
   <button>Save</button>
   
   // After
   <button>{t('common.save')}</button>
   ```

4. **Update placeholders**:
   ```tsx
   // Before
   <input placeholder="Search players..." />
   
   // After
   <input placeholder={t('players.searchPlayers')} />
   ```

5. **Update error/success messages**:
   ```tsx
   // Before
   showError('Failed to load players');
   
   // After
   showError(t('errors.failedToLoad', { item: t('players.title') }));
   ```

## 🧪 Testing

1. **Language Switching**:
   - Click language switcher in navbar
   - Verify all text changes
   - Refresh page - language should persist

2. **All Pages**:
   - Test each page in both languages
   - Verify no hardcoded English strings remain
   - Check forms, buttons, labels, placeholders

3. **Dynamic Content**:
   - Test translations with variables
   - Verify proper formatting

## 📚 Translation File Structure

Translation files are organized by feature. When adding new strings:

1. Add to English file first (`en/translation.json`)
2. Add corresponding French translation (`fr/translation.json`)
3. Use nested objects for organization
4. Use descriptive key names

Example:
```json
{
  "players": {
    "title": "Players",
    "addPlayer": "Add Player",
    "searchPlayers": "Search players by name...",
    "noPlayersFound": "No players found"
  }
}
```

## 🎯 Next Steps

1. Systematically go through each component
2. Replace all hardcoded strings
3. Test in both languages
4. Add missing translation keys as needed
5. Verify language persistence

## 💡 Tips

- Use translation keys that match the component/page structure
- Keep keys descriptive but concise
- Group related translations together
- Test frequently during implementation
- Use TypeScript for type safety (optional: create types for translation keys)

