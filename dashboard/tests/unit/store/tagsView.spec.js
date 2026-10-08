import Vue from 'vue'
import Vuex from 'vuex'
import tagsView from '@/store/modules/tagsView'

Vue.use(Vuex)

function createStore() {
  return new Vuex.Store({
    modules: {
      tagsView: {
        namespaced: true,
        state: { visitedViews: [], cachedViews: [] },
        mutations: tagsView.mutations,
        actions: tagsView.actions
      }
    }
  })
}

const view = (over = {}) => ({
  path: '/a',
  name: 'A',
  fullPath: '/a',
  meta: { title: 'A 页' },
  ...over
})

describe('store/modules/tagsView', () => {
  let store

  beforeEach(() => {
    store = createStore()
  })

  describe('visitedViews', () => {
    it('addVisitedView 添加并补全标题', () => {
      store.dispatch('tagsView/addVisitedView', view())
      expect(store.state.tagsView.visitedViews).toHaveLength(1)
      expect(store.state.tagsView.visitedViews[0].title).toBe('A 页')
    })

    it('meta.title 缺失时使用 no-name', () => {
      store.dispatch('tagsView/addVisitedView', view({ meta: {} }))
      expect(store.state.tagsView.visitedViews[0].title).toBe('no-name')
    })

    it('相同 path 不会重复添加', () => {
      store.dispatch('tagsView/addVisitedView', view())
      store.dispatch('tagsView/addVisitedView', view({ name: 'A2' }))
      expect(store.state.tagsView.visitedViews).toHaveLength(1)
    })

    it('delVisitedView 删除指定视图', async() => {
      store.dispatch('tagsView/addVisitedView', view())
      store.dispatch('tagsView/addVisitedView', view({ path: '/b', name: 'B' }))
      const result = await store.dispatch('tagsView/delVisitedView', view())
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('/b')
    })

    it('updateVisitedView 更新同名 path 的视图', () => {
      store.dispatch('tagsView/addVisitedView', view())
      store.dispatch('tagsView/updateVisitedView', view({ meta: { title: '新标题' }}))
      expect(store.state.tagsView.visitedViews[0].meta.title).toBe('新标题')
    })
  })

  describe('cachedViews', () => {
    it('addCachedView 添加组件名', () => {
      store.dispatch('tagsView/addCachedView', view())
      expect(store.state.tagsView.cachedViews).toEqual(['A'])
    })

    it('meta.noCache 为真时不缓存', () => {
      store.dispatch('tagsView/addCachedView', view({ meta: { noCache: true }}))
      expect(store.state.tagsView.cachedViews).toEqual([])
    })

    it('名称重复时不重复添加', () => {
      store.dispatch('tagsView/addCachedView', view())
      store.dispatch('tagsView/addCachedView', view({ path: '/a2' }))
      expect(store.state.tagsView.cachedViews).toEqual(['A'])
    })

    it('delCachedView 删除缓存', async() => {
      store.dispatch('tagsView/addCachedView', view())
      const result = await store.dispatch('tagsView/delCachedView', view())
      expect(result).toEqual([])
    })
  })

  describe('复合操作', () => {
    it('addView 同时加入访问与缓存', () => {
      store.dispatch('tagsView/addView', view())
      expect(store.state.tagsView.visitedViews).toHaveLength(1)
      expect(store.state.tagsView.cachedViews).toEqual(['A'])
    })

    it('delView 同时删除访问与缓存', async() => {
      store.dispatch('tagsView/addView', view())
      store.dispatch('tagsView/addView', view({ path: '/b', name: 'B' }))
      const result = await store.dispatch('tagsView/delView', view())
      expect(result.visitedViews).toHaveLength(1)
      expect(result.cachedViews).toEqual(['B'])
    })

    it('delOthersViews 仅保留当前视图与固定页签', async() => {
      store.dispatch('tagsView/addView', view({ path: '/affix', name: 'Affix', meta: { title: 'x', affix: true }}))
      store.dispatch('tagsView/addView', view())
      store.dispatch('tagsView/addView', view({ path: '/b', name: 'B' }))
      const result = await store.dispatch('tagsView/delOthersViews', view())
      expect(result.visitedViews.map(v => v.path).sort()).toEqual(['/a', '/affix'])
    })

    it('delAllViews 保留固定页签, 清空缓存', async() => {
      store.dispatch('tagsView/addView', view({ path: '/affix', name: 'Affix', meta: { title: 'x', affix: true }}))
      store.dispatch('tagsView/addView', view())
      const result = await store.dispatch('tagsView/delAllViews')
      expect(result.visitedViews).toHaveLength(1)
      expect(result.visitedViews[0].path).toBe('/affix')
      expect(result.cachedViews).toEqual([])
    })
  })
})
