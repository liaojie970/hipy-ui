/**
 * 防重复提交(请求级去重)工具。
 *
 * 场景：用户双击「确定」、回车重复触发、网络慢时反复点击同一按钮等，
 * 会在极短时间内发出“完全相同”的写入请求，导致重复新增/重复下单。
 *
 * 策略：把正在处理中的写入请求 (method + baseURL + url + params + data) 记为键，
 * 重复的请求直接丢弃并提示；请求结束(成功/失败/超时)后自动释放。
 *
 * 说明：
 * - 只针对非幂等方法 (POST/PUT/PATCH/DELETE)，GET/HEAD/OPTIONS 等查询不受影响；
 * - FormData / Blob / ArrayBuffer / URLSearchParams 等无法稳定序列化的载荷一律跳过，
 *   避免把“两个不同的上传/导入”误判为重复请求；
 * - 本模块不依赖 axios / element-ui，便于单元测试。
 */

// 正在处理中的写入请求: key -> 1
const pendingMutations = new Map()

const IDEMPOTENT_METHODS = ['get', 'head', 'options']

function safeStringify(value) {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value === undefined ? null : value)
  } catch (e) {
    return String(value)
  }
}

/**
 * 计算请求的防重键。返回空串表示“不参与去重”。
 * @param {Object} config axios 请求配置
 * @returns {string}
 */
export function mutationKey(config) {
  if (!config) return ''
  const method = (config.method || 'get').toLowerCase()
  if (IDEMPOTENT_METHODS.indexOf(method) > -1) return ''

  const data = config.data
  // 二进制/流式载荷无法稳定序列化，一律跳过去重
  if (data !== undefined && data !== null && typeof data === 'object') {
    const tag = Object.prototype.toString.call(data)
    if (tag !== '[object Object]' && tag !== '[object Array]') return ''
  }
  return [
    method,
    config.baseURL || '',
    config.url || '',
    safeStringify(config.params),
    safeStringify(data)
  ].join('|')
}

/**
 * 登记一个写入请求。
 * @returns {{key: string, duplicated: boolean}} duplicated=true 表示已有相同请求在处理中
 */
export function acquireMutation(config) {
  const key = mutationKey(config)
  if (!key) return { key: '', duplicated: false }
  if (pendingMutations.has(key)) return { key, duplicated: true }
  pendingMutations.set(key, 1)
  if (config) config.__mutationKey = key
  return { key, duplicated: false }
}

/**
 * 请求结束后释放占位。成功时传 response，失败时传 error，两者都带 config。
 */
export function releaseMutation(source) {
  const key = source && source.config && source.config.__mutationKey
  if (key) pendingMutations.delete(key)
}

/** 当前是否有该键在途(仅用于测试/调试) */
export function isPending(key) {
  return pendingMutations.has(key)
}

/** 清空在途记录(仅用于测试/调试) */
export function resetPendingMutations() {
  pendingMutations.clear()
}

export default {
  mutationKey,
  acquireMutation,
  releaseMutation,
  isPending,
  resetPendingMutations
}
