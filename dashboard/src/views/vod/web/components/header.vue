<template>
  <header class="header-container">
    <div class="header-wrap">
      <a class="left-wrap" @click="handleOpenForm">
        <img :src="LogoImg" class="logo">
        <div class="title">{{ title }}</div>
      </a>
      <div class="right-wrap">
        <div class="search-wrap">
          <div class="input-container">
            <input v-model="keywordRef" class="input" type="search" placeholder="请输入关键词" @keydown.enter="handleSearch">
            <span class="search-btn" @click="handleSearch">
              <em>全网搜</em>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 换源对话框 -->
    <el-dialog :title="form_title" :visible.sync="open" :width="dialogWidth" class="change_rule_dialog" append-to-body>
      <el-input v-model="siteFilter" placeholder="请输入站源名称" class="site_filter_input" />
      <el-form ref="form" :model="form" label-width="120px" class="change_rule_form" @submit.native.prevent>
        <div class="button-container">
          <div v-for="(site,index) in filteredSites" :key="index" :ref="site.key === form.new_site.key ? 'currentSite' : ''" class="btn-item">
            <el-button
              :type="form.new_site.key===site.key? 'success':'primary'"
              size="medium"
              @click="handleChangeRule(site)"
            >{{ site.name }}
            </el-button>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer dialog-footer-right">
        <el-button type="danger" @click="handleConfirmClear">清除缓存</el-button>
        <el-button type="primary" @click="handleConfirmChange">确认换源</el-button>
      </div>

    </el-dialog>

  </header>
</template>

<script>
import LogoImg from '@/assets/images/logo.png'
import cache from '@/plugins/cache'

export default {
  name: 'VodWebHeader',
  components: {},
  data() {
    return {
      // 弹出层标题
      form_title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: { sites: [], now_site: {}, new_site: {}},
      LogoImg,
      keywordRef: '',
      siteFilter: ''
    }
  },
  computed: {
    // 标题跟随当前源,换源后由父组件更新 store 自动刷新
    title() {
      const nowSite = this.$store.state.vod.now_site || {}
      return nowSite.name || 'hipy影视'
    },
    filteredSites() {
      // 将 input 和 site.name 都转换为小写，进行包含匹配
      const inputLower = this.siteFilter.toLowerCase()
      return this.siteFilter
        ? this.form.sites.filter((site) => site.name.toLowerCase().includes(inputLower))
        : this.form.sites
    },
    dialogWidth() {
      return window.innerWidth < 768 ? '100%' : '600px'
    }
  },
  watch: {
    open(newVal) {
      if (newVal) this.scrollToCurrentSite()
    }
  },
  created() {
    this.getCache()
  },
  methods: {
    handleSearch() {
      console.log(this.keywordRef)
      if (this.keywordRef !== '') {
        this.$router.push({ path: '/vod/web/search', query: { keyword: this.keywordRef }})
      }
    },
    handleOpenForm() {
      this.open = true
      this.form_title = '请选择数据源'
      this.getData()
    },
    getCache() {
      const storeSite = this.$store.state.vod.now_site || {}
      const cacheSite = storeSite.key ? storeSite : cache.local.getJSON('hipy_site')
      if (cacheSite) {
        this.form.now_site = cacheSite
      }
    },
    getData() {
      console.log('header组件-hipy_sites from store:', this.$store.state.vod.hipy_sites)
      this.form.sites = this.$store.state.vod.hipy_sites || []
      const nowSite = this.$store.state.vod.now_site || {}
      this.form.now_site = nowSite.key ? nowSite : this.form.now_site
      this.form.new_site = this.form.now_site
      if (!this.form.new_site.key && this.form.sites.length > 0) {
        this.form.new_site = this.form.sites[0]
      } else if (this.form.new_site.key && !this.form.sites.some(i => i.key === this.form.new_site.key)) {
        this.form.new_site = this.form.sites[0] || {}
      }
    },
    handleChangeRule(rule) { // 临时换源
      this.form.new_site = rule
      this.scrollToCurrentSite()
    },
    handleConfirmChange() { // 确认换源
      if (!this.form.new_site || !this.form.new_site.key) {
        this.$message.error('请先选择数据源')
        return
      }
      this.form.now_site = this.form.new_site
      cache.local.setJSON('hipy_site', this.form.now_site)
      // 立即关闭弹窗: 加载反馈统一由内容区遮罩给出(缓存命中的源瞬间完成, 不出现遮罩)
      this.open = false
      // 通知父组件软刷新(只重挂载右侧内容区),不再整页跳转
      this.$emit('site-changed', this.form.now_site)
    },
    scrollToCurrentSite() {
      this.$nextTick(() => {
        if (this.$refs.currentSite && this.$refs.currentSite.length > 0) {
          const currentSite = this.$refs.currentSite[0]
          currentSite.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    },
    handleConfirmClear() {
      // 清除缓存
      this.$confirm('确认清除缓存？这将会重置已选首页源为配置里的第一个源', '确认框', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        modalClass: 'custom-confirm', // 自定义样式类
        modalStyle: {
          maxWidth: '90%', // 最大宽度为 90%
          width: 'auto', // 宽度自适应内容
          margin: '0 auto' // 居中对话框
        }
      })
        .then(() => {
          cache.local.remove('hipy_site')
          this.open = false
          // 清除缓存后由父组件重新拉取配置并回退到第一个源,同样只刷新右侧
          this.$emit('site-cleared')
        })
        .catch(() => {
          // 取消操作的处理
        })
    }

  }
}

</script>

<style lang="scss">
.change_rule_dialog .el-dialog__body {
  padding: 0 !important; /* 使用 !important 强制覆盖 */
}
</style>

<style lang="scss" scoped>

.change_rule_form {
  max-height: 400px;
}

.site_filter_input {
  padding: 5px 5px 5px 5px;
}

.dialog-footer-left {
  display: flex;
  justify-content: flex-start; /* 将按钮对齐到左侧 */
}

.dialog-footer-right {
  display: flex;
  justify-content: flex-end; /* 将按钮对齐到右侧 */
}

.custom-confirm {
  max-width: 90%; /* 最大宽度为 90% */
  width: auto; /* 宽度自适应内容 */
}

.button-container {
  width: 100%;
  max-height: 400px;
  //overflow: hidden;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-wrap: wrap;

  .btn-item {
    text-align: center;
    width: calc(33.3%);
    padding: 2px 2px 2px 2px;
    &:nth-child(8) {
      margin-right: 0;
    }
    button {
      width: 95%;
    }
  }
}

.header-container {
  position: relative;
  height: 72px;
  width: 100%;
  background: #fff;
  box-shadow: 0 0 80px rgba(0,0,0,.2);
  z-index: 99;
  .header-wrap {
    position: absolute;
    width: 100%;
    padding: 0 15px;
    margin-top: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .left-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      .logo {
        width: 30px;
        height: 30px;
        // position: relative !important;
      }
      .title {
        margin-left: 10px;
        font-size: 16px;
        font-weight: 700;
      }
    }

    .right-wrap {
      .search-wrap {
        .input-container {
          position: relative;
          height: 40px;
          padding: 0;
          border-bottom: 0;
          border-radius: 20px;
          .input {
            border: 0;
            color: rgba(0, 0, 0, .8);
            background: rgba(0, 0, 0, .05);
            border-radius: 20px;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            width: 100%;
            height: 40px;
            padding: 0 120px 0 15px;
            font-size: 15px;
            line-height: 40px;
            text-align: left;
          }
          .search-btn {
            position: absolute;
            right: 0;
            top: 0;
            width: 82px;
            height: 40px;
            border-radius: 20px;
            cursor: pointer;
            background-image: linear-gradient(90deg, #8cf19d, #a0dfff 46%, #659dff);
            em {
              display: block;
              color: #fff;
              font-size: 15px;
              line-height: 40px;
              text-align: center;
            }
          }
        }
      }

      .nav-list {
        font-size: 14px;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        color: #0c0d0f;
        margin-left: 24px;

        .siteHeader__textBtn {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
          border-radius: 4px;

          div {
            display: flex;
            align-items: center;
            line-height: 18px;
            padding: 6px 8px;
          }
        }

        li {
          cursor: pointer;
          margin-left: 12px;
          list-style: none;
        }
      }
    }
  }
}
</style>
