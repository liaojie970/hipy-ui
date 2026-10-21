<template>
  <div class="app-container">
    <el-alert
      v-if="currentProvider && !hasCookie"
      title="当前站点尚未配置登录 Cookie, 搜索结果可能不完整且播放清晰度受限, 请先到【采集站点】配置。"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 12px"
    />
    <el-form :inline="true" label-width="80px" @submit.native.prevent>
      <el-form-item label="站点">
        <el-select v-model="providerCode" placeholder="请选择站点" style="width: 180px" @change="onProviderChange">
          <el-option v-for="p in providers" :key="p.code" :label="p.name" :value="p.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="入库分类">
        <el-select v-model="categoryId" placeholder="未分类" clearable style="width: 180px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="入库后">
        <el-select v-model="importStatus" style="width: 130px">
          <el-option label="待审核" :value="0" />
          <el-option label="直接通过" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="前台">
        <el-select v-model="importVisible" style="width: 110px">
          <el-option label="可见" :value="1" />
          <el-option label="隐藏" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- ===== 关键词搜索 ===== -->
      <el-tab-pane label="关键词搜索" name="search">
        <el-form :inline="true" @submit.native.prevent>
          <el-form-item>
            <el-input
              v-model="keyword"
              placeholder="输入关键词, 如: 儿童科普 / 唐诗三百首"
              style="width: 320px"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" :loading="searching" @click="handleSearch">搜索
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="success"
              icon="el-icon-plus"
              :loading="importing"
              :disabled="!selected.length || importing"
              @click="handleBatchImport()"
            >
              批量入库({{ selected.length }})
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="skipExisting" :disabled="importing">跳过已入库</el-checkbox>
          </el-form-item>
        </el-form>

        <el-table v-loading="searching || importing" :data="searchList" @selection-change="onSelect">
          <el-table-column type="selection" width="55" align="center" :selectable="rowSelectable" />
          <el-table-column label="封面" align="center" width="120">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.cover"
                :src="scope.row.cover"
                fit="cover"
                style="width: 96px; height: 54px"
                :preview-src-list="[scope.row.cover]"
              />
            </template>
          </el-table-column>
          <el-table-column label="标题" align="left" prop="title" :show-overflow-tooltip="true" min-width="240" />
          <el-table-column label="UP主" align="center" prop="up_name" width="140" :show-overflow-tooltip="true" />
          <el-table-column label="时长" align="center" width="100">
            <template slot-scope="scope">{{ formatDuration(scope.row.duration) }}</template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="90">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.imported" type="success" size="mini">已入库</el-tag>
              <el-tag v-else type="info" size="mini">未入库</el-tag>
            </template>
          </el-table-column>
          <el-table-column width="130" class-name="small-padding fixed-width op-column" label="操作" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-plus"
                :disabled="importing || (skipExisting && scope.row.imported)"
                @click="handleBatchImport([scope.row])"
              >
                入库
              </el-button>
              <el-button size="mini" type="text" icon="el-icon-link" @click="openSource(scope.row)">原片</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="searchTotal>0"
          :total="searchTotal"
          :page.sync="searchPage"
          :limit.sync="searchPageSize"
          :page-sizes="[10,20,30,50]"
          @pagination="doSearch"
        />
      </el-tab-pane>

      <!-- ===== 粘贴链接 ===== -->
      <el-tab-pane label="粘贴链接" name="resolve">
        <el-form @submit.native.prevent>
          <el-form-item>
            <el-input
              v-model="linkText"
              type="textarea"
              :rows="4"
              placeholder="每行一个链接或 BV 号, 例如:&#10;https://www.bilibili.com/video/BV1GJ411x7h7&#10;BV1GMaG6MELJ"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-magic-stick" :loading="resolving" @click="handleResolve">
              解析链接
            </el-button>
            <el-button
              type="success"
              icon="el-icon-plus"
              :loading="importing"
              :disabled="!resolvedSelected.length || importing"
              @click="handleBatchImport(resolvedSelected)"
            >批量入库({{ resolvedSelected.length }})
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="skipExisting" :disabled="importing">跳过已入库</el-checkbox>
          </el-form-item>
        </el-form>

        <el-table v-loading="resolving || importing" :data="resolvedList" @selection-change="onResolvedSelect">
          <el-table-column type="selection" width="55" align="center" :selectable="rowSelectable" />
          <el-table-column label="封面" align="center" width="120">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.cover"
                :src="scope.row.cover"
                fit="cover"
                style="width: 96px; height: 54px"
                :preview-src-list="[scope.row.cover]"
              />
            </template>
          </el-table-column>
          <el-table-column label="标题" align="left" prop="title" :show-overflow-tooltip="true" min-width="220" />
          <el-table-column label="UP主" align="center" prop="up_name" width="130" />
          <el-table-column label="集数" align="center" width="80">
            <template slot-scope="scope">{{ (scope.row.episodes || []).length }}</template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="90">
            <template slot-scope="scope">
              <el-tag v-if="scope.row._error" type="danger" size="mini">失败</el-tag>
              <el-tag v-else-if="scope.row.imported" type="success" size="mini">已入库</el-tag>
              <el-tag v-else type="info" size="mini">未入库</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="说明" align="left" width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              <span style="color: #f56c6c">{{ scope.row._error }}</span>
            </template>
          </el-table-column>
          <el-table-column width="80" class-name="small-padding fixed-width op-column" label="操作" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button
                v-if="!scope.row._error"
                size="mini"
                type="text"
                icon="el-icon-plus"
                :disabled="importing"
                @click="handleBatchImport([scope.row])"
              >入库
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 入库结果 -->
    <el-dialog title="入库结果" :visible.sync="resultOpen" width="620px" append-to-body>
      <p style="margin:0 0 12px">
        新增 <b style="color: #67c23a">{{ result.created || 0 }}</b> 条,
        更新 <b style="color: #409eff">{{ result.updated || 0 }}</b> 条,
        已跳过 <b style="color: #e6a23c">{{ (result.skipped || []).length }}</b> 条,
        失败 <b style="color: #f56c6c">{{ (result.errors || []).length }}</b> 条
      </p>
      <el-alert
        v-if="(result.skipped || []).length"
        type="warning"
        :closable="false"
        show-icon
        :title="'本次有 ' + result.skipped.length + ' 条已在库中, 已自动跳过; 若需刷新其信息请先取消勾选「跳过已入库」'"
        style="margin-bottom: 12px"
      />
      <el-table v-if="(result.errors || []).length" :data="result.errors" max-height="300">
        <el-table-column label="标识" prop="media_id" width="180" />
        <el-table-column label="原因" prop="error" show-overflow-tooltip />
      </el-table>
    </el-dialog>

    <!-- 未选择分类时, 入库前引导选择或新建分类 -->
    <el-dialog
      title="请选择入库分类"
      :visible.sync="categoryDialogOpen"
      width="460px"
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <p style="margin: 0 0 12px; color: #909399">
        未选择分类会入库为「未分类」, 请从下方选择已有分类, 或直接输入新分类名。
      </p>
      <el-select
        v-model="categoryPickId"
        filterable
        allow-create
        default-first-option
        clearable
        placeholder="选择或输入新分类名"
        style="width: 100%"
      >
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <div slot="footer">
        <el-button :disabled="categorySaving" @click="cancelCategory">取消</el-button>
        <el-button type="primary" :loading="categorySaving" @click="confirmCategory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProviders } from '@/api/curated/providers'
import { listCategories, addCategory } from '@/api/curated/categories'
import { batchImport } from '@/api/curated/media'
import { searchMedia, resolveUrl } from '@/api/curated/import'

export default {
  name: 'CuratedImport',
  data() {
    return {
      providers: [],
      categories: [],
      providerCode: undefined,
      categoryId: undefined,
      categoryDialogOpen: false,
      categoryPickId: undefined,
      categorySaving: false,
      pendingRows: [],
      importStatus: 1,
      importVisible: 1,
      activeTab: 'search',
      keyword: '',
      searching: false,
      searchList: [],
      searchTotal: 0,
      searchPage: 1,
      searchPageSize: 20,
      selected: [],
      linkText: '',
      resolving: false,
      resolvedList: [],
      resolvedSelected: [],
      resultOpen: false,
      importing: false,
      skipExisting: true,
      result: { success: [], skipped: [], errors: [], created: 0, updated: 0 }
    }
  },
  computed: {
    currentProvider() {
      return this.providers.find(p => p.code === this.providerCode)
    },
    hasCookie() {
      const p = this.currentProvider
      return !!(p && p.config && p.config.cookie)
    }
  },
  created() {
    listProviders({ page: 1, page_size: 100 }).then(res => {
      this.providers = (res.data.list || []).filter(p => p.status === 1)
      const enabled = this.providers.filter(p => p.config && p.config.cookie)
      this.providerCode = (enabled[0] || this.providers[0] || {}).code
    })
    listCategories({ page: 1, page_size: 200 }).then(res => {
      this.categories = res.data.list || []
    })
  },
  methods: {
    onProviderChange() {
      this.searchList = []
      this.searchTotal = 0
      this.resolvedList = []
    },
    formatDuration(sec) {
      sec = parseInt(sec || 0)
      const h = Math.floor(sec / 3600)
      const m = Math.floor((sec % 3600) / 60)
      const s = sec % 60
      const pad = n => (n < 10 ? '0' + n : '' + n)
      return (h > 0 ? h + ':' : '') + pad(m) + ':' + pad(s)
    },
    openSource(row) {
      if (row.source_url) window.open(row.source_url)
    },
    handleSearch() {
      if (!this.providerCode) return this.msgError('请先选择站点')
      if (!this.keyword) return this.msgError('请输入关键词')
      this.searchPage = 1
      this.doSearch()
    },
    doSearch() {
      this.searching = true
      searchMedia({
        provider_code: this.providerCode,
        keyword: this.keyword,
        page: this.searchPage,
        page_size: this.searchPageSize
      }).then(res => {
        this.searchList = (res.data.list || []).map(it => Object.assign({}, it, { provider_code: this.providerCode }))
        this.searchTotal = res.data.total || 0
        this.searching = false
      }).catch(() => {
        this.searching = false
      })
    },
    onSelect(selection) {
      this.selected = selection
    },
    onResolvedSelect(selection) {
      this.resolvedSelected = selection.filter(i => !i._error)
    },
    handleResolve() {
      if (!this.providerCode) return this.msgError('请先选择站点')
      const lines = (this.linkText || '').split('\n').map(s => s.trim()).filter(Boolean)
      if (!lines.length) return this.msgError('请粘贴至少一个链接')
      this.resolving = true
      this.resolvedList = []
      const tasks = lines.map(url => resolveUrl({ provider_code: this.providerCode, url: url })
        .then(res => Object.assign({}, res.data, { provider_code: this.providerCode }))
        .catch(err => ({ _error: (err && err.message) || '解析失败', source_url: url })))
      Promise.all(tasks).then(list => {
        this.resolvedList = list
        this.resolving = false
      })
    },
    rowSelectable(row) {
      // 勾选「跳过已入库」时, 已入库的行不可再选, 避免无效操作
      return !(this.skipExisting && row.imported)
    },
    handleBatchImport(rows) {
      rows = rows && rows.length ? rows : this.selected
      if (!this.providerCode) return this.msgError('请先选择站点')
      if (!rows || !rows.length) return this.msgError('请先勾选要入库的内容')
      // 前端先做一次跳过: 勾选「跳过已入库」时, 已入库的行直接不提交, 减少无效请求
      if (this.skipExisting) {
        const before = rows.length
        rows = rows.filter(r => !r.imported)
        if (!rows.length) {
          return this.$message.warning(before + ' 条均已入库, 已全部跳过')
        }
      }
      // 入库前检查分类: 为空则暂存待入库行, 弹窗引导选择/新建分类, 不发起任何写请求
      if (this.isCategoryEmpty()) {
        this.pendingRows = rows.slice()
        this.categoryPickId = undefined
        this.categoryDialogOpen = true
        return
      }
      this.doImport(rows)
    },
    // 分类是否为空(undefined / null / '')
    isCategoryEmpty() {
      return this.categoryId === undefined || this.categoryId === null || this.categoryId === ''
    },
    // 已拿到分类后复用原有入库逻辑
    doImport(rows) {
      const items = rows.map(r => ({
        provider_code: this.providerCode,
        media_id: r.media_id,
        title: r.title,
        cover: r.cover,
        description: r.description,
        duration: r.duration,
        up_name: r.up_name,
        up_mid: r.up_mid,
        source_url: r.source_url,
        episodes: r.episodes
      }))
      this.importing = true
      batchImport({
        provider_code: this.providerCode,
        category_id: this.categoryId,
        status: this.importStatus,
        visible: this.importVisible,
        skip_existing: this.skipExisting,
        items: items
      }).then(res => {
        const d = res.data || {}
        this.result = Object.assign({ success: [], skipped: [], errors: [], created: 0, updated: 0 }, d)
        const parts = []
        if (this.result.created) parts.push('新增 ' + this.result.created + ' 条')
        if (this.result.updated) parts.push('更新 ' + this.result.updated + ' 条')
        if ((this.result.skipped || []).length) parts.push('跳过 ' + this.result.skipped.length + ' 条')
        if ((this.result.errors || []).length) parts.push('失败 ' + this.result.errors.length + ' 条')
        this.msgSuccess(parts.length ? parts.join(', ') : '没有需要入库的内容')
        this.resultOpen = true
        this.importing = false
        // 刷新已入库标记
        if (this.activeTab === 'search') this.doSearch()
      }).catch(() => {
        this.importing = false
      })
    },
    // 确认分类选择: 已有分类直接用; 新分类名则先创建, 成功后才继续入库
    confirmCategory() {
      const picked = this.categoryPickId
      const existing = this.categories.find(c => c.id === picked)
      if (existing) {
        this.categoryId = existing.id
        return this.finishCategoryChoice()
      }
      const name = typeof picked === 'string' ? picked.trim() : ''
      if (!name) return this.msgError('请选择或输入一个分类')
      if (this.categorySaving) return
      this.categorySaving = true
      addCategory({ name: name }).then(res => {
        const id = res.data && res.data.id
        if (id === undefined || id === null || id === '') {
          this.categorySaving = false
          return this.msgError('创建分类失败, 请重试')
        }
        this.categoryId = id
        this.categories.push({ id: id, name: name })
        this.categorySaving = false
        this.finishCategoryChoice()
      }).catch(() => {
        // 失败时对话框不关闭、不继续入库
        this.categorySaving = false
      })
    },
    // 拿到分类后关闭对话框并复用原入库逻辑
    finishCategoryChoice() {
      const rows = this.pendingRows
      this.categoryDialogOpen = false
      this.categoryPickId = undefined
      this.pendingRows = []
      if (rows && rows.length) this.doImport(rows)
    },
    // 取消本次入库
    cancelCategory() {
      this.categoryDialogOpen = false
      this.categoryPickId = undefined
      this.pendingRows = []
    }
  }
}
</script>
