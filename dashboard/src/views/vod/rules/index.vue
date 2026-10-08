<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px" @submit.native.prevent>
      <el-form-item label="源名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入源名称"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="源分组" prop="group">
        <el-select v-model="queryParams.group" filterable clearable placeholder="源分组" style="width: 240px">
          <el-option
            v-for="item in groupOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="文件类型" prop="file_type">
        <el-select v-model="queryParams.file_type" filterable clearable placeholder="文件类型" style="width: 240px">
          <el-option
            v-for="item in fileTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="源状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="是否存在" prop="status">
        <el-select
          v-model="queryParams.is_exist"
          placeholder=""
          clearable
          style="width: 60px"
        >
          <el-option
            v-for="dict in existOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
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
          v-hasRole="['admin','opts']"
          type="success"
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefresh"
        >刷新源列表
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['vod:rules:post']"
          type="success"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImport"
        >上传源文件
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          v-hasRole="['admin','opts']"
          type="warning"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除数据
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          v-hasRole="['admin','opts']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDeleteFiles"
        >删除文件
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          v-hasRole="['admin','opts']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
        >清空数据
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-permi="['report:excel_generate:export','vod:rules:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="default"
          plain
          icon="el-icon-setting"
          size="mini"
          @click="fields.open=true;fields.title='列表显示/隐藏字段设置'"
        >字段设置
        </el-button>
      </el-col>
    </el-row>

    <el-table
      ref="tables"
      v-loading="loading"
      :data="list"
      :default-sort="defaultSort"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="ID"
        align="center"
        prop="id"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <!--      <el-table-column label="源名称" align="center" prop="name" width="200" :show-overflow-tooltip="true"-->
      <!--                       sortable="custom" :sort-orders="['descending', 'ascending']"/>-->

      <el-table-column
        label="源名称"
        align="center"
        prop="name"
        width="200"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <el-link type="primary" @click="()=>handleLink(scope.row)">
            <span>{{ scope.row.name }}</span>
          </el-link>

          <router-link :to="'/vod/rules_edit/' + scope.row.id" class="link-type">
            <i class="el-icon-edit-outline" />
          </router-link>
        </template>
      </el-table-column>

      <el-table-column
        label="源分组"
        align="center"
        prop="group"
        width="130"
        :show-overflow-tooltip="true"
        :formatter="groupFormat"
      />
      <el-table-column
        v-if="fields.file_path"
        label="文件路径"
        align="center"
        prop="path"
        :show-overflow-tooltip="true"
        width="200"
      >
        <template slot-scope="scope">
          <span>{{ BASE_DIR }}{{ scope.row.path }}</span>
        </template>

      </el-table-column>
      <el-table-column label="是否存在" align="center" prop="is_exist" width="100">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.is_exist" disabled />
        </template>
      </el-table-column>

      <el-table-column label="文件类型" align="center" prop="file_type" />
      <el-table-column
        label="显示排序"
        align="center"
        prop="order_num"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <!--      <el-table-column label="源状态" align="center" prop="status">-->
      <!--        <template slot-scope="scope">-->
      <!--          <dict-tag :options="statusOptions" :value="scope.row.status"/>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column
        v-if="fields.status"
        label="源状态"
        align="center"
        prop="status"
        width="130"
        :show-overflow-tooltip="true"
        :formatter="statusFormat"
      />
      <el-table-column v-if="fields.searchable" label="可搜索" align="center" prop="searchable" width="60">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.searchable" :active-value="1" :inactive-value="0" disabled />
        </template>
      </el-table-column>
      <el-table-column v-if="fields.filterable" label="可筛选" align="center" prop="filterable" width="60">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.filterable" :active-value="1" :inactive-value="0" disabled />
        </template>
      </el-table-column>
      <el-table-column v-if="fields.quickSearch" label="可快搜" align="center" prop="quickSearch" width="60">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.quickSearch" :active-value="1" :inactive-value="0" disabled />
        </template>
      </el-table-column>
      <el-table-column v-if="fields.ext" label="ext扩展" align="center" prop="ext" :show-overflow-tooltip="true" />
      <el-table-column label="是否显示" align="center" prop="active" width="100">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.active" @change="handleChangIsActive(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column
        v-if="fields.create_time"
        label="创建时间"
        align="center"
        prop="created_ts"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="150"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.created_ts) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="fields.update_time"
        label="更新时间"
        align="center"
        prop="modified_ts"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="150"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.modified_ts) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['vod:rule:post']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasRole="['admin','opts']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)">
            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-hasRole="['admin','opts']"
                command="handleRaw"
                icon="el-icon-link"
              >直链
              </el-dropdown-item>
              <el-dropdown-item
                v-hasRole="['admin','opts']"
                command="handleHome"
                icon="el-icon-menu"
              >首页
              </el-dropdown-item>
              <el-dropdown-item
                v-hasRole="['admin','opts']"
                command="handleSearch"
                icon="el-icon-search"
              >搜索
              </el-dropdown-item>
              <el-dropdown-item
                v-hasRole="['admin','opts']"
                command="handleSetTop"
                icon="el-icon-top"
              >置顶
              </el-dropdown-item>
              <el-dropdown-item
                v-hasRole="['admin','opts']"
                command="handleSetBottom"
                icon="el-icon-bottom"
              >置底
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.page_size"
      :page-sizes="[10,15,20,40,60,80,100,150,200,300,500,1000]"
      @pagination="getList"
    />

    <!-- 添加或修改源对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="源状态" prop="status">
              <el-input-number
                v-model="form.status"
                placeholder="请输入源状态"
                controls-position="right"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="显示排序" prop="order_num">
              <el-input-number v-model="form.order_num" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否显示" prop="active">
              <el-switch v-model="form.active" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可搜索" prop="searchable">
              <el-switch v-model="form.searchable" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可筛选" prop="filterable">
              <el-switch v-model="form.filterable" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可快速搜索" prop="quickSearch">
              <el-switch v-model="form.quickSearch" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="ext扩展" prop="ext" label-width="80" label-position="top">
              <el-input
                v-model="form.ext"
                placeholder="请输入源ext扩展"
                type="textarea"
                :rows="8"
                clearable
              />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="submitLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 显示隐藏字段对话框 -->
    <el-dialog :title="fields.title" :visible.sync="fields.open" width="400px" append-to-body>
      <el-form ref="fields" :model="fields" label-width="120px">
        <el-row>

          <el-col :span="12">
            <el-form-item label="创建时间" prop="create_time">
              <el-switch v-model="fields.create_time" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="修改时间" prop="update_time">
              <el-switch v-model="fields.update_time" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="文件路径" prop="file_path">
              <el-switch v-model="fields.file_path" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="ext扩展" prop="ext">
              <el-switch v-model="fields.ext" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="源状态" prop="status">
              <el-switch v-model="fields.status" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可搜索" prop="searchable">
              <el-switch v-model="fields.searchable" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可筛选" prop="filterable">
              <el-switch v-model="fields.filterable" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="快速搜索" prop="quickSearch">
              <el-switch v-model="fields.quickSearch" />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="fields.open=false">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 源导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        multiple
        :limit="100"
        accept=".py, .json,.js,.txt,.m3u"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport + '&group=' + encodeURIComponent(upload.group)"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        :on-change="uploadChange"
        :before-remove="beforeRemove"
        :on-remove="upLoadRemove"
        :file-list="upload.fileList"
        name="files"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip text-center">
          <div slot="tip" class="el-upload__tip">
            源分组
            <el-select v-model="upload.group" filterable placeholder="源分组" style="width: 240px">
              <el-option
                v-for="item in groupOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </div>

          <div slot="tip" class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" />
            是否更新已经存在的源
          </div>
          <span>仅允许导入分组对应格式的文件。</span>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  list,
  clearRecord,
  delRecord,
  refreshRules,
  changeActive,
  getRule,
  setRecord,
  setOrderNum,
  uploadRules, getRuleRaw
} from '@/api/vod/rules'
import { getDicts } from '@/api/system/dict/data'
import { parseTime } from '@/utils'
import { getToken } from '@/utils/auth'

export default {
  name: 'VodRules',
  // dicts: ['sys_common_status'],
  data() {
    return {
      submitLoading: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选择用户名
      selectName: '',
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'order_num', order: 'ascending' },
      statusOptions: [],
      existOptions: [{ label: '是', value: true }, { label: '否', value: false }],
      groupOptions: [],
      fileTypeOptions: [{ label: 'py', value: '.py' }, { label: 'json', value: '.json' }, {
        label: 'js',
        value: '.js'
      }, { label: 'txt', value: '.txt' }, { label: 'm3u', value: '.m3u' }, { label: 'jar', value: '.jar' }],
      BASE_DIR: '', // 服务器程序默认路径

      // 上传源参数
      upload: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: '',
        fileList: [],
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的源
        updateSupport: true,
        // 源分组
        // group: 't4/spiders',
        group: 't4/files/drpy_js',
        // 设置上传的请求头部
        headers: { Token: getToken(), 'Content-Type': 'multipart/form-data' },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + 'vods/rules/file/uploadData'
      },
      // 列表字段显示参数
      fields: {
        open: false,
        title: '',
        create_time: false,
        update_time: false,
        file_path: false,
        ext: false,
        status: false,
        searchable: true,
        filterable: true,
        quickSearch: true
      },
      // 查询参数
      queryParams: {
        page: 1,
        page_size: 10,
        name: undefined,
        // group: 't4/spiders',
        group: 't4/files/drpy_js',
        file_type: undefined,
        status: undefined,
        is_exist: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        status: [
          { required: true, message: '源状态不能为空，且只能为1/0', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    getDicts('vod_rule_status').then(response => {
      this.statusOptions = response.data.details
    })

    getDicts('vod_rule_group').then(response => {
      this.groupOptions = response.data.details
      this.groupOptions.forEach(item => {
        if (item.is_default) this.queryParams.group = item.value
      })
    })
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      if (!this.queryParams.status && typeof (this.queryParams.status) === 'string') {
        this.queryParams.status = undefined
      }
      if (typeof (this.queryParams.is_exist) !== 'boolean') {
        this.queryParams.is_exist = undefined
      }
      list(this.queryParams).then(response => {
        this.list = response.data.results
        this.total = response.data.total
        this.BASE_DIR = response.data.BASE_DIR
        this.loading = false
      }
      )
    },
    // 字典状态字典翻译
    groupFormat(row, column) {
      return this.selectDictLabel(this.groupOptions, row.group)
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        active: undefined,
        status: 1
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.page = 1
      this.queryParams.is_exist = undefined
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.selectName = selection.map(item => item.user_name)
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleRaw':
          this.handleRaw(row)
          break
        case 'handleHome':
          this.handleHome(row)
          break
        case 'handleSearch':
          this.handleSearch(row)
          break
        case 'handleSetTop':
          setOrderNum(row.id, 0).then(() => {
            this.getList()
          })
          break
        case 'handleSetBottom':
          setOrderNum(row.id, 9999).then(() => {
            this.getList()
          })
          break
        default:
          break
      }
    },
    handleRaw(row) {
      getRuleRaw(row.id).then(response => {
        const data = response.data
        if (data.url && data.url.startsWith('http')) {
          open(data.url)
        }
      })
    },
    handleLink(row) {
      const group = this.groupOptions.find(x => x.value === row.group).label
      const name = row.name + row.file_type
      const file_url = new URL(process.env.VUE_APP_BASE_API).origin + '/files/' + group + '/' + name + '?t=' + new Date().getTime() + '&raw=1'
      open(file_url)
    },
    handleHome(row) {
      const group = this.groupOptions.find(x => x.value === row.group).label
      if (group === 'hipy' && row.file_type === '.py') {
        const home_url = new URL(process.env.VUE_APP_BASE_API).origin + '/api/v1/vod/' + row.name
        open(home_url)
      } else {
        this.$modal.msgError('只有hipy源允许访问首页')
      }
    },
    handleSearch(row) {
      const group = this.groupOptions.find(x => x.value === row.group).label
      if (group === 'hipy' && row.file_type === '.py') {
        const home_url = new URL(process.env.VUE_APP_BASE_API).origin + '/api/v1/vod/' + row.name
        const search_url = home_url + '?ac=list&pg=1&wd=斗罗大陆'
        open(search_url)
      } else {
        this.$modal.msgError('只有hipy源允许访问搜索页')
      }
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.order_by = column.prop
      this.queryParams.is_desc = column.order === 'descending'
      this.getList()
    },
    /** 删除数据按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除ID为"' + ids + '"的数据项|不会删除文件？').then(function() {
        return delRecord(ids)
      }).then((response) => {
        this.getList()
        this.$modal.msgSuccess(response.msg)
      }).catch(() => {
      })
    },
    /** 删除文件按钮操作 */
    handleDeleteFiles(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除ID为"' + ids + '"的数据项|文件会一起删除？').then(function() {
        return delRecord(ids, { with_file: true })
      }).then((response) => {
        this.getList()
        this.$modal.msgSuccess(response.msg)
      }).catch(() => {
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getRule(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改源'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      if (this.submitLoading) return
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.form.id != undefined) {
            setRecord(this.form.id, this.form).then(response => {
              if (response.code === 0) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError('修改失败,' + response.msg)
              }
            }).finally(() => { this.submitLoading = false })
          }
        }
      })
    },
    /** 刷新源列表按钮操作 */
    handleRefresh(row) {
      const self = this
      this.$modal.confirm('是否确认刷新本地所有源？').then(function() {
        self.$modal.loading('数据获取中，请稍候...')
        return refreshRules()
      }).then(() => {
        self.$modal.closeLoading()
        this.getList()
        this.$modal.msgSuccess('刷新成功')
      }).catch(() => {
        self.$modal.closeLoading()
      })
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal.confirm('是否确认清空所有源？').then(function() {
        return clearRecord()
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('清空成功')
      }).catch(() => {
      })
    },
    /** 改变活跃状态 */
    handleChangIsActive(row) {
      changeActive(row.id, row.active).then(response => {
        if (response.code === 0) {
          this.msgSuccess('修改成功')
        }
        this.getList()
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('vod_rules', {
        ...this.queryParams, ...{ template: '0' }
      }, `源列表_${parseTime(new Date().getTime())}.xlsx`)
    },
    /** 上传源文件按钮操作 */
    handleImport() {
      this.upload.title = '上传源文件'
      this.upload.open = true
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    beforeRemove(file, fileList) {
      this.upload.fileList = fileList
      // return this.$confirm(`确定移除 ${file.name}？`);
    },
    // 移除附件
    upLoadRemove(file, fileList) {
      const tempFileList = []
      for (var index = 0; index < this.upload.fileList.length; index++) {
        if (this.upload.fileList[index].name !== file.name) {
          tempFileList.push(this.upload.fileList[index])
        }
      }
      this.upload.fileList = tempFileList
    },
    // 监控上传文件列表
    uploadChange(file, fileList) {
      const existFile = fileList.slice(0, fileList.length - 1).find((f) => f.name === file.name)
      if (existFile) {
        this.$message.error('当前文件已经存在!')
        fileList.pop()
      }
      this.upload.fileList = fileList
    },
    // 上传到服务器  formidable接收
    async submitUpload() {
      // 上传文件大小不能超过2MB!
      const isLt2M = this.upload.fileList.every(
        (file) => file.size / 1024 / 1024 < 2
      )
      console.log('isLt2M:', isLt2M)
      if (!isLt2M) {
        this.$message({
          type: 'error',
          message: `请检查文件列表，不允许上传超过2mb的文件`
        })
        return
      }
      const formData = new FormData()
      // formData.files = this.upload.fileList.map(it => it.raw);
      this.upload.fileList.forEach(file => {
        formData.append('files', file.raw)
      })
      // console.log(formData);
      const response = await uploadRules(formData, {
        updateSupport: this.upload.updateSupport,
        group: this.upload.group
      })
      this.handleFileSuccess(response, null, null)
    },
    // 覆盖默认的上传行为
    requestUpload() {
      // :http-request="requestUpload"
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '上传结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      // this.$refs.upload.submit();
      this.submitUpload()
    }
  }
}
</script>
