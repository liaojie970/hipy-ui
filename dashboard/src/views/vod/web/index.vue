<template>
  <div class="preview-container">
    <Header
      @site-changed="handleSiteChanged"
      @site-cleared="handleSiteCleared"
    />
    <div class="preview-content">
      <Menu :category="category" />
      <router-view :key="siteVersion" class="content" />
      <transition name="site-loading-fade">
        <div v-if="switchVisible" class="site-loading">
          <div class="site-loading__panel">
            <template v-if="switchError">
              <i class="el-icon-warning-outline site-loading__icon site-loading__icon--error" />
              <p class="site-loading__title">「{{ switchSiteName }}」加载失败</p>
              <p class="site-loading__hint">{{ switchError }}</p>
              <div class="site-loading__actions">
                <el-button size="small" type="primary" @click="retrySwitch">重试</el-button>
                <el-button size="small" @click="cancelSwitch">返回上一个源</el-button>
              </div>
            </template>
            <template v-else>
              <i class="el-icon-loading site-loading__icon" />
              <p class="site-loading__title">正在切换到「{{ switchSiteName || '默认源' }}」</p>
              <p class="site-loading__hint">{{ loadingHint }}</p>
            </template>
          </div>
        </div>
      </transition>
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

// 同一个源在 TTL 内再次切回时直接复用, 不再重复等待接口
const HOME_CACHE_TTL = 5 * 60 * 1000
// 遮罩最短显示时长, 避免快源切换时一闪而过
const MIN_LOADING_MS = 400
// 换源后旧源的视频 id / 搜索结果在新源里无效, 停在这些页面时直接回分类页
const SOURCE_BOUND_ROUTES = ['VodWebDetail', 'VodWebSearch']

// 源 key -> { time, category, filters, recommend }
const homeCache = new Map()

export default {
  name: 'VodWeb',
  components: { Header, Footer, Menu },
  data() {
    return {
      category: [],
      // 换源状态: '' 空闲 / 'loading' 加载中 / 'error' 失败
      switchState: '',
      switchError: '',
      switchSiteName: '',
      waited: 0,
      // 请求序号, 用于丢弃过期的换源结果(用户连续切换时)
      seq: 0,
      prevSite: null,
      timer: null
    }
  },
  computed: {
    // 换源后 key 变化, 只重新挂载右侧 router-view, 不做整页刷新
    siteVersion() {
      return this.$store.state.vod.siteVersion || 0
    },
    nowSite() {
      return this.$store.state.vod.now_site || {}
    },
    switchVisible() {
      return this.switchState !== ''
    },
    loadingHint() {
      if (this.switchError) return this.switchError
      if (this.waited >= 8) return `该源响应较慢, 正在等待…（已等待 ${this.waited} 秒）`
      return '正在获取分类与首页数据…'
    }
  },
  created() {
    this.getConfig()
  },
  beforeDestroy() {
    this.stopTimer()
  },
  methods: {
    goHome() {
      if (this.$route.name === 'VodWeb') {
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
    // 写入首页数据; bump=true 时重挂载右侧内容区
    applyHomeData(data, bump) {
      this.category = data.category || []
      this.$store.commit('vod/SET_Filters', data.filters || {})
      this.$store.commit('vod/SET_Recommend', data.recommend || [])
      if (!bump) {
        this.goHome()
        return
      }
      // 停在旧源的详情/搜索页时直接回分类页, 不拿旧 id 去请求新源
      if (SOURCE_BOUND_ROUTES.indexOf(this.$route.name) > -1) {
        this.$router.replace('/vod/web/category')
      } else {
        this.goHome()
      }
      this.$store.commit('vod/BUMP_SiteVersion')
    },
    // 拉取当前源的首页数据(分类 / 筛选 / 推荐)
    requestHome(site) {
      return HomeApi().then((resp) => {
        const data = {
          time: Date.now(),
          category: resp.class || [],
          filters: resp.filters || {},
          recommend: resp.list || []
        }
        if (site && site.key) homeCache.set(site.key, data)
        return data
      })
    },
    readCache(key) {
      const cached = key ? homeCache.get(key) : null
      return cached && Date.now() - cached.time < HOME_CACHE_TTL ? cached : null
    },
    // 命中缓存后静默刷新一次: 只更新数据源, 不重挂载页面, 避免二次闪动
    refreshInBackground(key, seq) {
      this.requestHome(this.nowSite).then((data) => {
        if (seq !== this.seq) return
        this.category = data.category
        this.$store.commit('vod/SET_Filters', data.filters)
        this.$store.commit('vod/SET_Recommend', data.recommend)
      }).catch((err) => {
        console.log('静默刷新失败(已保留缓存数据):', err && err.message)
      })
    },
    // 拉配置并决定当前源: 缓存里的源失效时回退到第一个源
    fetchDefaultSite() {
      return ConfigApi().then((config) => {
        console.log('get config cost:', config && config.cost_time)
        const hipySites = (config.sites || []).filter(
          (it) => it.key.startsWith('hipy_py') || it.key.startsWith('hipy_js')
        )
        this.$store.commit('vod/SET_HipySites', hipySites)
        let cacheSite = cache.local.getJSON('hipy_site')
        if (!cacheSite || !hipySites.some((it) => it.key === cacheSite.key)) {
          cacheSite = hipySites[0] || null
          if (cacheSite) cache.local.setJSON('hipy_site', cacheSite)
        }
        return cacheSite
      })
    },
    // 首次进入: 拉配置 -> 选中源 -> 拉首页数据
    getConfig() {
      return this.fetchDefaultSite().then((site) => {
        if (!site) throw new Error('配置里没有可用的数据源')
        this.applySite(site)
        return this.requestHome(site)
      }).then((data) => {
        this.applyHomeData(data, false)
      }).catch((err) => {
        console.error('加载配置或首页数据失败:', err)
        // 首页数据失败时也保证能进入分类页, 避免停留在空白的 /vod/web/
        this.goHome()
      })
    },
    // ===== 换源 =====
    handleSiteChanged(site) {
      this.switchSite(site)
    },
    // 清除缓存: 重新拉配置后回退到配置里的第一个源
    handleSiteCleared() {
      this.switchSite(null)
    },
    retrySwitch() {
      this.switchSite(this.nowSite)
    },
    cancelSwitch() {
      if (this.prevSite && this.prevSite.api) {
        this.switchSite(this.prevSite)
      } else {
        this.finishLoading()
      }
    },
    beginLoading(name) {
      this.switchState = 'loading'
      this.switchError = ''
      this.switchSiteName = name || ''
      this.waited = 0
      this.startTimer()
    },
    finishLoading() {
      this.stopTimer()
      this.switchState = ''
      this.switchError = ''
      this.waited = 0
    },
    failSwitch(err) {
      this.stopTimer()
      const msg = (err && (err.message || err.msg)) || ''
      this.switchState = 'error'
      this.switchError = msg
        ? `接口无响应或返回异常: ${msg}`
        : '接口无响应或返回异常, 请稍后重试'
    },
    startTimer() {
      this.stopTimer()
      this.timer = setInterval(() => {
        this.waited += 1
      }, 1000)
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    /**
     * 换源主流程
     * @param {Object|null} site 目标源; 传 null 表示"清除缓存", 需要重新拉配置
     */
    switchSite(site) {
      if (site && !site.api) return Promise.resolve()
      const seq = ++this.seq
      const fromIdle = this.switchState === ''
      const targetKnown = !!(site && site.api)

      // 目标源已知: 先同步切换单例, 标题会立刻跟着变
      if (targetKnown) {
        if (fromIdle && this.nowSite.key) this.prevSite = this.nowSite
        this.applySite(site)
        const cached = this.readCache(site.key)
        if (cached) {
          // 有缓存: 不显示遮罩, 直接渲染, 再后台静默刷新
          this.applyHomeData(cached, true)
          this.finishLoading()
          this.refreshInBackground(site.key, seq)
          return Promise.resolve()
        }
        this.beginLoading(site.name)
      } else {
        this.beginLoading('默认源')
      }

      const startedAt = Date.now()
      const prepare = targetKnown ? Promise.resolve(site) : this.fetchDefaultSite()
      return prepare.then((target) => {
        if (seq !== this.seq) return
        if (!target || !target.api) throw new Error('配置里没有可用的数据源')
        if (!targetKnown) {
          if (fromIdle && this.nowSite.key) this.prevSite = this.nowSite
          this.applySite(target)
          this.switchSiteName = target.name || ''
          const cached = this.readCache(target.key)
          if (cached) {
            this.applyHomeData(cached, true)
            this.finishLoading()
            this.refreshInBackground(target.key, seq)
            return
          }
        }
        return this.requestHome(target).then((data) => {
          if (seq !== this.seq) return
          this.applyHomeData(data, true)
          const rest = MIN_LOADING_MS - (Date.now() - startedAt)
          if (rest > 0) {
            setTimeout(() => {
              if (seq === this.seq) this.finishLoading()
            }, rest)
          } else {
            this.finishLoading()
          }
        })
      }).catch((err) => {
        if (seq !== this.seq) return
        console.error('切换数据源失败:', err)
        this.failSwitch(err)
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
    position: relative;
    width: 100%;
    height: calc(100% - 72px - 100px);
    .content {
      min-height: calc(100% - 53px);
      max-height: calc(100% - 42px);
      height: 100%;
    }

    // 换源/加载遮罩: 覆盖左侧菜单 + 右侧内容区, 给出明确反馈
    .site-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, .78);
      cursor: progress;

      .site-loading__panel {
        min-width: 240px;
        max-width: 90%;
        padding: 24px 28px;
        text-align: center;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, .12);
      }

      .site-loading__icon {
        font-size: 28px;
        color: #409eff;
      }

      .site-loading__icon--error {
        color: #f56c6c;
      }

      .site-loading__title {
        margin: 12px 0 6px;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        word-break: break-all;
      }

      .site-loading__hint {
        margin: 0;
        font-size: 13px;
        line-height: 20px;
        color: #909399;
      }

      .site-loading__actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 14px;
      }
    }
  }
}

.site-loading-fade-enter-active,
.site-loading-fade-leave-active {
  transition: opacity .2s ease;
}

.site-loading-fade-enter,
.site-loading-fade-leave-to {
  opacity: 0;
}

@media screen and (min-width: 1px) and (max-width: 932px) {
  .content {
    height: calc(100% - 42px) !important;
  }
}
</style>
