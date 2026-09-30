<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
      <el-form-item label="名称" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="分类名称"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable size="small"
                   @change="handleQuery" style="width: 120px">
          <el-option label="全部" :value="undefined"/>
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini"
                   v-has-permi="['curated:category:post']" @click="handleAdd">新增分类
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id" width="60"/>
      <el-table-column label="分类名称" align="center" prop="name" :show-overflow-tooltip="true"/>
      <el-table-column label="图标" align="center" prop="icon" :show-overflow-tooltip="true"/>
      <el-table-column label="排序" align="center" prop="order_num" width="70"/>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" align="center" prop="created_ts" width="170">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.created_ts) }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit"
                     v-has-permi="['curated:category:put']" @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-delete"
                     v-hasRole="['admin','opts']" @click="handleDelete(scope.row)">删除
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

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.native.prevent>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如: 科普知识 / 英语启蒙 / 动画"/>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="图标">
              <el-input v-model="form.icon" placeholder="可选"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.order_num" :min="0" controls-position="right"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" placeholder="备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listCategories, getCategory, addCategory, setCategory, delCategory} from '@/api/curated/categories'
import {parseTime} from '@/utils'

export default {
  name: 'CuratedCategories',
  data() {
    return {
      loading: true,
      ids: [],
      total: 0,
      list: [],
      title: '',
      open: false,
      statusOptions: [{label: '启用', value: 1}, {label: '禁用', value: 0}],
      queryParams: {
        page: 1,
        page_size: 20,
        keyword: undefined,
        status: undefined
      },
      form: {},
      rules: {
        name: [{required: true, message: '分类名称不能为空', trigger: 'blur'}]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    getList() {
      this.loading = true
      listCategories(this.queryParams).then(res => {
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
        name: undefined,
        icon: undefined,
        status: 1,
        order_num: 1,
        remark: undefined
      }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {page: 1, page_size: 20, keyword: undefined, status: undefined}
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增分类'
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCategory(id).then(res => {
        this.form = res.data
        this.open = true
        this.title = '修改分类'
      })
    },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) return
        if (this.form.id !== undefined) {
          setCategory(this.form.id, this.form).then(() => {
            this.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          addCategory(this.form).then(() => {
            this.msgSuccess('添加成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      const id = row.id || this.ids
      this.$confirm('是否确认删除分类ID为"' + id + '"的数据项? 分类下的内容将变为未分类。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => delCategory(id)).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>
