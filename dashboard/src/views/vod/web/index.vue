<template>
  <div class="preview-container">
    <Header @site-changed="handleSiteChanged" @site-cleared="handleSiteCleared" />
    <div class="preview-content">
      <Menu :category="category" />
      <router-view :key="siteVersion" class="content" />
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from '@/views/vod/web/components/header.vue'
import Footer from '@/views/vod/web/components/footer.vue'
import Menu from '@/views/vod/web/components/menu.vue'

import {
  HomeApi, ConfigApi, now_site
} from '@/api/vod/web'

import cache from '@/plugins/cache'

export default {
  name: 'VodWeb',
  components: { Header, Footer, Menu },
  data() {
    return {
      category: []
    }
  },
  computed: {
    // 换源后 key 变化,只重新挂载右侧 router-view,不做整页刷新
    siteVersion() {
      return this.$store.state.vod.siteVersion || 0
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    goHome() {
      if (this.$route.name === 'VodWeb') {
        console.log('自动跳转到分类页的首页')
        this.$router.push({
          path: '/vod/web/category',
          query: {}
        })
      }
    },
    // 把选中的源同步到请求单例 now_site 和 store
    applySite(site) {
      if (!site || !site.api) return
      now_site.api_url = site.api
      now_site.extend = site.ext
      this.$store.commit('vod/SET_NowSite', site)
    },
    // 确认换源: 重新拉配置和首页数据,然后只重挂载右侧内容区
    handleSiteChanged() {
      this.getConfig(true)
    },
    // 清除缓存: 缓存已被移除,getConfig 会自动选回配置里的第一个源
    handleSiteCleared() {
      this.getConfig(true)
    },
    getConfig(isRefresh = false) {
      const done = () => {
        if (isRefresh) this.$store.commit('vod/BUMP_SiteVersion')
      }
      return ConfigApi().then((resp) => {
        const config = resp
        console.log('config:', config)
        if (config.sites) {
          console.log('get config cost:', config.cost_time)
          const hipy_sites = config.sites.filter(it => it.key.startsWith('hipy_py') || it.key.startsWith('hipy_js'))
          console.log('hipy_sites from config:', hipy_sites)
          this.$store.commit('vod/SET_HipySites', hipy_sites)

          // 缓存的源不存在于最新配置里(或缓存被清除)时,回退到第一个源
          let cacheSite = cache.local.getJSON('hipy_site')
          if (!cacheSite || !hipy_sites.some(it => it.key === cacheSite.key)) {
            cacheSite = hipy_sites[0] || null
            if (cacheSite) {
              cache.local.setJSON('hipy_site', cacheSite)
            }
          }
          if (cacheSite) {
            console.log('now_site:', cacheSite)
            this.applySite(cacheSite)
          }
        }
        return this.getData()
      }).then(done, (err) => {
        console.error('加载配置或首页数据失败:', err)
        // 首页数据失败时也保证能进入分类页,避免停留在空白的 /vod/web/
        this.goHome()
        done()
      })
    },
    getData() {
      return HomeApi().then((resp) => {
        this.category = resp.class || []
        this.$store.commit('vod/SET_Filters', resp.filters || {})
        this.$store.commit('vod/SET_Recommend', resp.list || [])
        this.goHome()
      })
    }
  }
}

</script>

<style lang="scss" scoped>
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .preview-content {
    width: 100%;
    height: calc(100% - 72px - 100px);
    .content {
      min-height: calc(100% - 53px);
      max-height: calc(100% - 42px);
      height: 100%;
    }
  }
}

@media screen and (min-width: 1px) and (max-width: 932px) {
  .content {
    height: calc(100% - 42px) !important;
  }
}
</style>
