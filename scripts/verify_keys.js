const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const languages = ['en', 'fr', 'de', 'es', 'ar', 'zh', 'hi'];

// Helper to flatten object keys
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

// Read en.json as source of truth
const enPath = path.join(localesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = new Set(flattenKeys(enContent));

console.log(`Source of truth (en) has ${enKeys.size} keys.`);

let hasErrors = false;

languages.forEach(lang => {
  if (lang === 'en') return;

  const langPath = path.join(localesDir, `${lang}.json`);
  if (!fs.existsSync(langPath)) {
    console.error(`❌ Missing file: ${lang}.json`);
    hasErrors = true;
    return;
  }

  try {
    const langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const langKeys = new Set(flattenKeys(langContent));

    // Check for missing keys
    const missingKeys = [...enKeys].filter(key => !langKeys.has(key));

    if (missingKeys.length > 0) {
      console.error(`❌ ${lang}.json is missing ${missingKeys.length} keys:`);
      missingKeys.forEach(k => console.log(`   - ${k}`));
      hasErrors = true;
    } else {
      console.log(`✅ ${lang}.json is complete.`);
    }
  } catch (e) {
    console.error(`❌ Error parsing ${lang}.json: ${e.message}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log('🎉 All languages are consistent!');
}
