<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
      <el-form-item label="名称" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="站点名称/编码"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="全部"
          clearable
          size="small"
          style="width: 120px"
          @change="handleQuery"
        >
          <el-option label="全部" :value="undefined" />
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-has-permi="['curated:provider:post']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增站点
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="编码" align="center" prop="code" width="120" />
      <el-table-column label="登录态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.config && scope.row.config.cookie" type="success" size="mini">已配置</el-tag>
          <el-tag v-else type="info" size="mini">未配置</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代理" align="center" width="140" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span v-if="scope.row.config && scope.row.config.proxy">{{ scope.row.config.proxy }}</span>
          <span v-else style="color:#909399">跟随系统</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="order_num" width="70" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column fixed="right" label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-has-permi="['curated:provider:get']"
            size="mini"
            type="text"
            icon="el-icon-connection"
            @click="handleTestRow(scope.row)"
          >测试
          </el-button>
          <el-button
            v-has-permi="['curated:provider:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasRole="['admin','Operation']"
            size="mini"
            type="text"
            icon="el-icon-delete"
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
      :page-sizes="[10,15,20,40,60,80,100]"
      @pagination="getList"
    />

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" @submit.native.prevent>
        <el-form-item label="站点类型" prop="code">
          <el-select v-model="form.code" placeholder="请选择站点类型" style="width: 100%" @change="handleCodeChange">
            <el-option v-for="p in providerTypes" :key="p.code" :label="p.name + ' (' + p.code + ')'" :value="p.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="用于前台展示的名称" />
        </el-form-item>

        <!-- bilibili 专用配置 -->
        <template v-if="form.code === 'bilibili'">
          <el-form-item label="Cookie">
            <el-input
              v-model="form.config.cookie"
              type="textarea"
              :rows="3"
              placeholder="登录哔哩哔哩后, 从浏览器复制完整 Cookie(至少包含 SESSDATA=xxx)"
            />
            <div class="tip">仅影响你能看到的视频; 不配置也能用, 但清晰度会受限且部分视频不可见。</div>
          </el-form-item>
          <el-form-item label="默认清晰度">
            <el-select v-model="form.config.qn" placeholder="默认 80(1080P)" clearable style="width: 200px">
              <el-option :value="16" label="360P" />
              <el-option :value="32" label="480P" />
              <el-option :value="64" label="720P" />
              <el-option :value="80" label="1080P" />
              <el-option :value="112" label="1080P+" />
            </el-select>
          </el-form-item>
          <el-form-item label="网络代理">
            <el-input
              v-model="form.config.proxy"
              placeholder="留空=跟随系统代理; none=强制直连; 或 127.0.0.1:7897"
            />
            <div class="tip">若本机直接访问 B 站不通(需要代理才能打开网页), 请在这里填代理地址, 例如 127.0.0.1:7897。</div>
          </el-form-item>
        </template>

        <!-- 通用 JSON 配置 -->
        <el-form-item v-else label="配置(JSON)">
          <el-input v-model="configText" type="textarea" :rows="4" placeholder="{&quot;key&quot;: &quot;value&quot;}" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.order_num" :min="0" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="testing" @click="handleTestForm">测试连通</el-button>
        <el-button :loading="submitLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { availableProviders, listProviders, getProvider, addProvider, setProvider, delProvider, testProvider } from '@/api/curated/providers'

export default {
  name: 'CuratedProviders',
  data() {
    return {
      submitLoading: false,
      loading: true,
      ids: [],
      total: 0,
      list: [],
      providerTypes: [],
      title: '',
      open: false,
      testing: false,
      configText: '',
      statusOptions: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }],
      queryParams: {
        page: 1,
        page_size: 20,
        keyword: undefined,
        status: undefined
      },
      form: {},
      rules: {
        code: [{ required: true, message: '请选择站点类型', trigger: 'change' }],
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    availableProviders().then(res => {
      this.providerTypes = res.data || []
    })
  },
  methods: {
    getList() {
      this.loading = true
      listProviders(this.queryParams).then(res => {
        this.list = res.data.list
        this.total = res.data.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        code: undefined,
        name: undefined,
        config: {},
        status: 1,
        order_num: 1,
        remark: undefined
      }
      this.configText = ''
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = { page: 1, page_size: 20, keyword: undefined, status: undefined }
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
    },
    handleCodeChange(code) {
      const type = this.providerTypes.find(p => p.code === code)
      if (type && !this.form.name) {
        this.form.name = type.name
      }
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增站点'
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getProvider(id).then(res => {
        const data = res.data || {}
        this.form = data
        if (!this.form.config) this.form.config = {}
        this.configText = JSON.stringify(this.form.config || {}, null, 2)
        this.open = true
        this.title = '修改站点'
      })
    },
    collectConfig() {
      if (this.form.code === 'bilibili') {
        const cfg = {}
        if (this.form.config && this.form.config.cookie) cfg.cookie = this.form.config.cookie
        if (this.form.config && this.form.config.qn) cfg.qn = this.form.config.qn
        if (this.form.config && this.form.config.proxy) cfg.proxy = this.form.config.proxy
        return cfg
      }
      if (!this.configText || !this.configText.trim()) return {}
      return JSON.parse(this.configText)
    },
    handleTestForm() {
      let config
      try {
        config = this.collectConfig()
      } catch (e) {
        this.msgError('配置不是合法的 JSON')
        return
      }
      this.testing = true
      testProvider({ code: this.form.code, config: config }).then(res => {
        this.testing = false
        const d = res.data || {}
        if (d.ok) {
          const info = d.info || {}
          this.msgSuccess(d.message + (info.uname ? ' | 用户:' + info.uname : ''))
        } else {
          this.msgError('测试失败: ' + (d.message || '未知错误'))
        }
      }).catch(() => {
        this.testing = false
      })
    },
    handleTestRow(row) {
      testProvider({ code: row.code, config: row.config || {}}).then(res => {
        const d = res.data || {}
        if (d.ok) {
          const info = d.info || {}
          this.msgSuccess(d.message + (info.uname ? ' | 用户:' + info.uname : ''))
        } else {
          this.msgError('测试失败: ' + (d.message || '未知错误'))
        }
      })
    },
    submitForm() {
      if (this.submitLoading) return
      this.submitLoading = true
      this.$refs['form'].validate(valid => {
        if (!valid) { this.submitLoading = false; return }
        let config
        try {
          config = this.collectConfig()
        } catch (e) {
          this.msgError('配置不是合法的 JSON')
          this.submitLoading = false
          return
        }
        const payload = Object.assign({}, this.form, { config: config })
        if (this.form.id !== undefined) {
          setProvider(this.form.id, payload).then(() => {
            this.msgSuccess('修改成功')
            this.open = false
            this.getList()
          }).finally(() => { this.submitLoading = false })
        } else {
          addProvider(payload).then(() => {
            this.msgSuccess('添加成功')
            this.open = false
            this.getList()
          }).finally(() => { this.submitLoading = false })
        }
      })
    },
    handleDelete(row) {
      const id = row.id || this.ids
      this.$confirm('是否确认删除站点ID为"' + id + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => delProvider(id)).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tip {
  font-size: 12px;
  color: #909399;
  line-height: 18px;
  margin-top: 4px;
}
</style>
