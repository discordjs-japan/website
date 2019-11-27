import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
  silentTranslationWarn: true,
});

export default i18n;

const loadedLanguages = [];

function setI18nLanguage(lang) {
  i18n.locale = lang;
  return lang;
}

const endpoint = 'https://raw.githubusercontent.com/discordjs-japan/i18n';

const json = res => {
  if (!res.ok) throw new Error('Failed to fetch lang data file from GitHub');
  return res.json();
};

export async function loadLanguageAsync(lang, repo, tag) {
  // Unset lang
  if (!lang) return setI18nLanguage(null);

  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    return setI18nLanguage(lang);
  }

  const url = `/master/content/${lang}/docs/${repo}/${tag}.json`;
  const messages = await fetch(endpoint + url).then(json);

  i18n.setLocaleMessage(lang, messages);
  loadedLanguages.push(lang);
  return setI18nLanguage(lang);
}
