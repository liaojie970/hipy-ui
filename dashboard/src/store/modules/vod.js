// 初始化状态
const state = {
  recommend: [],
  filters: {},
  // 当前配置里可选的 hipy 源列表
  hipy_sites: [],
  // 当前选中的源
  now_site: {},
  // 换源成功后自增,用于强制重新挂载右侧内容区
  siteVersion: 0
}

// 修改状态的方法
const mutations = {
  SET_Filters: (state, filters) => {
    state.filters = filters || {}
  },
  SET_Recommend: (state, recommend) => {
    state.recommend = recommend || []
  },
  SET_HipySites: (state, sites) => {
    state.hipy_sites = sites || []
  },
  SET_NowSite: (state, site) => {
    state.now_site = site || {}
  },
  BUMP_SiteVersion: (state) => {
    state.siteVersion += 1
  }
}

// 包含异步操作或其他逻辑处理的方法
const actions = {
  getfilters({ state }, categoryName) {
    if (Object.prototype.hasOwnProperty.call(state.filters, categoryName)) {
      const tvSeries = state.filters[categoryName]
      console.log(tvSeries)
      return tvSeries
    } else {
      console.log('filters 中不包含键 ' + categoryName)
      return []
    }
  }
}

export default {
  namespaced: true, // 可选：启用命名空间
  state,
  mutations,
  actions
}
