<template>
  <div id="docs-navbar">
    <container>
      View docs for

      <select v-model="sourceChoice">
        <option v-for="source in sources" :value="source.id" :key="source.id">{{ source.name }}</option>
      </select>

      <transition name="fade" mode="out-in" @enter="updateTagChoice">
        <select v-if="tags" v-model="tagChoice" :key="source.id">
          <option v-for="tag in tags" :value="tag" :key="tag">{{ tag }}</option>
        </select>
        <loading v-else />
      </transition>

      <transition name="fade" mode="out-in" @enter="updateLangChoice">
        <select v-if="tags" v-model="langChoice" :key="source.id">
          <option v-for="lang in langs" :value="lang.id" :key="lang.id">{{ lang.name }}</option>
        </select>
        <loading v-else />
      </transition>

      <input v-model.trim="search" type="search" placeholder="Search" @keypress.enter="goToSearch" />
      <router-link :to="{ name: 'docs-search' }"><em class="fa fa-search"></em></router-link>
    </container>
  </div>
</template>

<script>
import { SHITS } from '../../util';

export default {
  name: 'docs-navbar',
  props: ['sources', 'source'],

  data() {
    return {
      sourceChoice: this.source.id,
      tagChoice: null,
      tags: null,
      langChoice: null,
      langs: null,
      search: this.$route.query.q,
    };
  },

  methods: {
    loadTags() {
      this.tags = this.source.tags;
      if (!this.tags) {
        const startSource = this.source;
        this.source.fetchTags().then(tags => {
          if (this.source.id === startSource.id) this.tags = tags;
        });
      }
    },

    async loadLangs() {
      const json = res => {
        if (!res.ok) throw new Error('Failed to fetch langs data file from GitHub');
        return res.json();
      };
      const repo = 'https://raw.githubusercontent.com/discordjs-japan/i18n';
      const stats = await fetch(`${repo}/master/stats.json`).then(json);
      const defaultLang = { 'en-US': { id: null, name: 'English' } };
      const availableLangMap = stats
        .map(({ path, name }) => ({ id: path, name }))
        .reduce((map, lang) => ({ ...map, [lang.id]: lang }), defaultLang);
      this.langs = availableLangMap;
    },

    updateTagChoice() {
      if (this.tags) this.tagChoice = this.$route.params.tag || this.source.recentTag || this.source.defaultTag;
    },

    updateLangChoice() {
      if (this.langs) this.langChoice = this.$route.query.lang || null;
    },

    goToSearch() {
      if (this.$route.name !== 'docs-search') this.$router.push({ name: 'docs-search', query: { q: this.search } });
    },
  },

  watch: {
    sourceChoice(src) {
      if (this.$route.params.source !== src) this.$router.push({ name: 'docs-source', params: { source: src } });
    },

    tagChoice(tag) {
      if (tag && this.$route.params.tag !== tag) {
        SHITS.switching = true;
        this.$router.push({ name: this.$route.name, params: { ...this.$route.params, tag }, query: this.$route.query });
      }
    },

    langChoice(lang) {
      // TODO: save lang to localStorage
      // TODO: auto detect useragent language
      if (this.$route.query.lang !== lang) {
        console.log('Lang changed', lang);
        const query = { ...this.$route.query, lang };
        // Delete lang query for default language
        if (!query.lang) delete query.lang;
        this.$router.push({ name: this.$route.name, query });
      }
    },

    source(source) {
      this.sourceChoice = source.id;
      this.tagChoice = null;
      this.loadTags();
    },

    search(q) {
      if (this.$route.query.q) this.$router.replace({ name: 'docs-search', query: { q } });
      else this.$router.push({ name: 'docs-search', query: { q } });
    },

    $route(to) {
      if (this.tagChoice && to.params.tag && this.tagChoice !== to.params.tag) this.tagChoice = to.params.tag;
    },
  },

  created() {
    this.loadTags();
    this.loadLangs();
  },

  mounted() {
    this.updateTagChoice();
    this.updateLangChoice();
  },
};
</script>

<style lang="scss">
  @import '../../styles/theming';
  @import '../../styles/mq';

  $bg: lighten($color-navbar-bg, 6.5%);

  #docs-navbar {
    padding: 16px;
    background: lighten($color-navbar-bg, 6.5%);
    color: #aaa;
    font-size: 0.9rem;

    select, input {
      display: inline-block;
      background: lighten($color-navbar-bg, 6.5%);
      color: white;
      font-family: $font-regular;
      font-size: 0.85rem;
      border: 1px solid #aaa;
    }

    select {
      margin-left: 6px;
    }

    input {
      display: block;
      float: right;
      padding: 3px 2px;
      border: none;
      border-bottom: 1px solid #aaa;
      transition: border-color 0.3s;

      &:focus {
        border-color: $color-primary;
        outline: none;
      }

      @include mq($until: tablet) {
        display: none;
      }
    }

    a {
      float: right;
      color: white;

      @include mq($from: tablet) {
        display: none;
      }
    }

    .sk-folding-cube {
      position: relative;
      top: 3px;
      left: 10px;
      width: 16px;
      height: 16px;
    }
  }
</style>
