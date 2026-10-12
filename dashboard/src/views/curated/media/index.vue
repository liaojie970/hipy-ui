<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px" @submit.native.prevent>
      <el-form-item label="站点" prop="provider_code">
        <el-select
          v-model="queryParams.provider_code"
          placeholder="全部"
          clearable
          size="small"
          style="width: 150px"
          @change="handleQuery"
        >
          <el-option v-for="p in providers" :key="p.code" :label="p.name" :value="p.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类" prop="category_id">
        <el-select
          v-model="queryParams.category_id"
          placeholder="全部"
          clearable
          size="small"
          style="width: 160px"
          @change="handleQuery"
        >
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="全部"
          clearable
          size="small"
          style="width: 120px"
          @change="handleQuery"
        >
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="可见" prop="visible">
        <el-select
          v-model="queryParams.visible"
          placeholder="全部"
          clearable
          size="small"
          style="width: 110px"
          @change="handleQuery"
        >
          <el-option label="可见" :value="1" />
          <el-option label="隐藏" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="标题关键字"
          clearable
          size="small"
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:media:put']"
          type="success"
          icon="el-icon-check"
          size="mini"
          :disabled="!ids.length || !batchWritable"
          @click="handleStatus(1)"
        >通过
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:media:put']"
          type="warning"
          icon="el-icon-close"
          size="mini"
          :disabled="!ids.length || !batchWritable"
          @click="handleStatus(2)"
        >拒绝
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:media:put']"
          type="primary"
          icon="el-icon-view"
          size="mini"
          :disabled="!ids.length || !batchWritable"
          @click="handleVisible(1)"
        >设为可见
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:media:put']"
          icon="el-icon-view"
          size="mini"
          :disabled="!ids.length || !batchWritable"
          @click="handleVisible(0)"
        >设为隐藏
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:media:get']"
          type="info"
          icon="el-icon-connection"
          size="mini"
          :disabled="!ids.length"
          :loading="checking"
          @click="handleCheck"
        >校验
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:media:get']"
          type="primary"
          icon="el-icon-mobile-phone"
          size="mini"
          @click="handleKidConfig"
        >儿童配置
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasRole="['admin','Operation']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="!ids.length || !batchWritable"
          @click="handleRemove"
        >删除
        </el-button>
      </el-col>
      <el-col :span="6" style="float: right">
        <span style="font-size: 13px; color: #909399">共 {{ total }} 条, 仅"审核通过 + 可见"的内容会出现在 TVBox 源中</span>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" :selectable="canWrite" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="封面" align="center" width="120">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.cover"
            :src="scope.row.cover"
            fit="cover"
            style="width: 96px; height: 54px"
            :preview-src-list="[scope.row.cover]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="left" prop="title" :show-overflow-tooltip="true" min-width="220" />
      <el-table-column label="UP主" align="center" prop="up_name" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="分类" align="center" width="110">
        <template slot-scope="scope">
          <span>{{ categoryName(scope.row.category_id) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可见" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.visible === 1 ? 'success' : 'info'" size="mini">
            {{ scope.row.visible === 1 ? '可见' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="校验" align="center" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.view_status === 1" type="success" size="mini">正常</el-tag>
          <el-tag v-else-if="scope.row.view_status === 2" type="danger" size="mini">异常</el-tag>
          <el-tag v-else type="info" size="mini">未校验</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-has-permi="['curated:media:get']"
            size="mini"
            type="text"
            icon="el-icon-connection"
            @click="handleCheckRow(scope.row)"
          >校验
          </el-button>
          <el-button
            v-has-permi="['curated:media:get']"
            size="mini"
            type="text"
            icon="el-icon-video-play"
            @click="handleDetail(scope.row)"
          >选集
          </el-button>
          <el-button
            v-has-permi="['curated:media:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            :disabled="!canWrite(scope.row)"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasRole="['admin','Operation']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            :disabled="!canWrite(scope.row)"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.page_size"
      :page-sizes="[10,15,20,40,60,80,100,200]"
      @pagination="getList"
    />

    <!-- 修改 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="前台展示标题" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.category_id" placeholder="未分类" clearable style="width: 100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.order_num" :min="0" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="审核">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可见">
              <el-switch v-model="form.visible" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="submitLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 选集 -->
    <el-dialog title="选集" :visible.sync="detailOpen" width="640px" append-to-body>
      <div v-if="detail">
        <p><b>{{ detail.title }}</b></p>
        <p style="color: #909399; font-size: 13px">来源: {{ detail.source_url }}</p>
        <el-table :data="detail.episodes || []" max-height="380">
          <el-table-column label="#" type="index" width="60" align="center" />
          <el-table-column label="标题" prop="title" show-overflow-tooltip />
          <el-table-column label="时长" align="center" width="100">
            <template slot-scope="scope">{{ formatDuration(scope.row.duration) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 儿童配置 -->
    <el-dialog title="儿童专用配置" :visible.sync="kidOpen" width="640px" append-to-body>
      <div v-loading="kidLoading">
        <p>该配置<strong>只包含【亲子精选】一个源</strong>, 适合直接给孩子的设备使用。</p>
        <el-form label-width="100px" style="margin-top:10px" @submit.native.prevent>
          <el-form-item label="订阅码">
            <el-tag>{{ kid.sub_code }}</el-tag>
            <span v-if="kid.created" style="color:#67c23a;margin-left:8px">已自动创建订阅</span>
          </el-form-item>
          <el-form-item label="配置地址">
            <el-input :value="kid.config_url" readonly>
              <el-button slot="append" icon="el-icon-document-copy" @click="copyKidUrl">复制</el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="TVBox(clan)">
            <el-input :value="kid.tvbox_url" readonly />
          </el-form-item>
        </el-form>
        <p style="color:#909399;font-size:12px">{{ kid.tips }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listMedia, getMedia, setMedia, delMedia, batchStatus, batchVisible, batchRemove, checkMedia, kidConfig } from '@/api/curated/media'
import { listProviders } from '@/api/curated/providers'
import { listCategories } from '@/api/curated/categories'

export default {
  name: 'CuratedMedia',
  data() {
    return {
      submitLoading: false,
      loading: true,
      ids: [],
      selectedRows: [],
      total: 0,
      list: [],
      providers: [],
      categories: [],
      title: '',
      open: false,
      detailOpen: false,
      detail: null,
      checking: false,
      kidOpen: false,
      kidLoading: false,
      kid: {},
      statusOptions: [
        { label: '待审核', value: 0 },
        { label: '已通过', value: 1 },
        { label: '已拒绝', value: 2 }
      ],
      queryParams: {
        page: 1,
        page_size: 20,
        provider_code: undefined,
        category_id: undefined,
        status: undefined,
        visible: undefined,
        keyword: undefined
      },
      form: {}
    }
  },
  computed: {
    ...mapGetters(['userId', 'isSuperAdmin']),
    // 批量操作是否可用: 选中项必须全部可写
    batchWritable() {
      if (this.isSuperAdmin) return true
      if (this.userId === undefined || this.userId === null || this.userId === '') return true
      return this.selectedRows.every(row => this.canWrite(row))
    }
  },
  created() {
    this.getList()
    listProviders({ page: 1, page_size: 100 }).then(res => {
      this.providers = res.data.list || []
    })
    listCategories({ page: 1, page_size: 200 }).then(res => {
      this.categories = res.data.list || []
    })
  },
  methods: {
    getList() {
      this.loading = true
      listMedia(this.queryParams).then(res => {
        this.list = res.data.list
        this.total = res.data.total
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.handleApiError(error)
      })
    },
    categoryName(id) {
      const c = this.categories.find(x => x.id === id)
      return c ? c.name : '未分类'
    },
    statusLabel(s) {
      const d = this.statusOptions.find(x => x.value === s)
      return d ? d.label : s
    },
    statusTagType(s) {
      return { 0: 'info', 1: 'success', 2: 'danger' }[s] || 'info'
    },
    formatDuration(sec) {
      sec = parseInt(sec || 0)
      const h = Math.floor(sec / 3600)
      const m = Math.floor((sec % 3600) / 60)
      const s = sec % 60
      const pad = n => (n < 10 ? '0' + n : '' + n)
      return (h > 0 ? h + ':' : '') + pad(m) + ':' + pad(s)
    },
    // 是否可写: 超管可写全部; 普通用户仅可写本人创建的数据(creator_id 等于当前用户 id)。
    // 若拿不到当前用户 id, 返回 true(放行), 由后端做最终校验(前端仅做体验优化)。
    canWrite(row) {
      if (!row) return false
      if (this.isSuperAdmin) return true
      if (this.userId === undefined || this.userId === null || this.userId === '') return true
      if (row.creator_id === undefined || row.creator_id === null) return true
      return String(row.creator_id) === String(this.userId)
    },
    // 接口异常统一处理: "无权限"类给出友好提示, 其它错误由 request 拦截器统一提示
    handleApiError(error) {
      const status = error && error.response && error.response.status
      const msg = (error && (error.message || error.msg)) || ''
      if (status === 403 || /403|无权限|权限不足|forbidden|permission/i.test(msg)) {
        this.$message({
          showClose: true,
          message: '无权限操作该数据，该数据可能由超级管理员创建或不属于你',
          type: 'warning'
        })
      }
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        page: 1, page_size: 20, provider_code: undefined,
        category_id: undefined, status: undefined, visible: undefined, keyword: undefined
      }
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.ids = selection.map(item => item.id)
    },
    cancel() {
      this.open = false
      this.form = {}
    },
    handleUpdate(row) {
      const id = row.id || this.ids[0]
      getMedia(id).then(res => {
        this.form = res.data
        this.open = true
        this.title = '修改内容'
      }).catch(error => this.handleApiError(error))
    },
    submitForm() {
      if (this.submitLoading) return
      this.submitLoading = true
      setMedia(this.form.id, this.form).then(() => {
        this.msgSuccess('修改成功')
        this.open = false
        this.getList()
      }).catch(error => this.handleApiError(error)).finally(() => { this.submitLoading = false })
    },
    handleDetail(row) {
      getMedia(row.id).then(res => {
        this.detail = res.data
        this.detailOpen = true
      }).catch(error => this.handleApiError(error))
    },
    handleStatus(status) {
      const desc = status === 1 ? '通过' : '拒绝'
      this.$confirm('是否确认将选中的 ' + this.ids.length + ' 项设为"' + desc + '"?', '警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => batchStatus(this.ids, status)).then(() => {
        this.getList()
        this.msgSuccess('操作成功')
      }).catch(error => this.handleApiError(error))
    },
    handleVisible(visible) {
      const desc = visible === 1 ? '可见' : '隐藏'
      this.$confirm('是否确认将选中的 ' + this.ids.length + ' 项设为"' + desc + '"?', '警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => batchVisible(this.ids, visible)).then(() => {
        this.getList()
        this.msgSuccess('操作成功')
      }).catch(error => this.handleApiError(error))
    },
    handleRemove() {
      this.$confirm('是否确认删除选中的 ' + this.ids.length + ' 项? 该操作不可恢复。', '警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => batchRemove(this.ids)).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(error => this.handleApiError(error))
    },
    handleCheck() {
      if (!this.ids.length) return
      this.$confirm('将逐个校验选中的 ' + this.ids.length + ' 项(账号可见性 + 可播放), 数量较多时会比较慢, 是否继续?', '提示', {
        confirmButtonText: '开始校验', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        this.checking = true
        return checkMedia(this.ids)
      }).then(res => {
        this.checking = false
        const d = res.data || {}
        this.$alert('校验完成: 正常 ' + (d.ok_count || 0) + ' 项, 异常 ' + (d.fail_count || 0) + ' 项', '校验结果', {
          type: d.fail_count ? 'warning' : 'success'
        })
        this.getList()
      }).catch(error => {
        this.checking = false
        this.handleApiError(error)
      })
    },
    handleCheckRow(row) {
      const loading = this.$loading({ lock: true, text: '校验中...' })
      checkMedia([row.id]).then(res => {
        loading.close()
        const r = (res.data.results || [])[0] || {}
        if (r.ok) {
          this.msgSuccess('校验通过: 账号可见且可解析播放地址')
        } else {
          this.msgError('校验未通过: ' + (r.message || '未知原因'))
        }
        this.getList()
      }).catch(error => {
        loading.close()
        this.handleApiError(error)
      })
    },
    handleKidConfig() {
      this.kidOpen = true
      this.kidLoading = true
      kidConfig({ mode: 0, ensure: true }).then(res => {
        this.kidLoading = false
        this.kid = res.data || {}
      }).catch(error => {
        this.kidLoading = false
        this.handleApiError(error)
      })
    },
    copyKidUrl() {
      const url = this.kid && this.kid.config_url
      if (!url) return
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => this.msgSuccess('已复制')).catch(() => this.msgSuccess(url))
      } else {
        this.msgSuccess(url)
      }
    },
    handleDelete(row) {
      const id = row.id
      this.$confirm('是否确认删除内容ID为"' + id + '"的数据项?', '警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => delMedia(id)).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(error => this.handleApiError(error))
    }
  }
}
</script>
