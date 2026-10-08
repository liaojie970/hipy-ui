import errorLog from '@/store/modules/errorLog'

const freshState = () => ({ logs: [] })

describe('store/modules/errorLog', () => {
  it('ADD_ERROR_LOG 追加日志', () => {
    const state = freshState()
    errorLog.mutations.ADD_ERROR_LOG(state, { message: 'a' })
    errorLog.mutations.ADD_ERROR_LOG(state, { message: 'b' })
    expect(state.logs).toEqual([{ message: 'a' }, { message: 'b' }])
  })

  it('CLEAR_ERROR_LOG 清空日志', () => {
    const state = freshState()
    errorLog.mutations.ADD_ERROR_LOG(state, { message: 'a' })
    errorLog.mutations.CLEAR_ERROR_LOG(state)
    expect(state.logs).toEqual([])
  })

  it('addErrorLog action 提交 ADD_ERROR_LOG', () => {
    const commit = jest.fn()
    const log = { message: 'boom' }
    errorLog.actions.addErrorLog({ commit }, log)
    expect(commit).toHaveBeenCalledWith('ADD_ERROR_LOG', log)
  })

  it('clearErrorLog action 提交 CLEAR_ERROR_LOG', () => {
    const commit = jest.fn()
    errorLog.actions.clearErrorLog({ commit })
    expect(commit).toHaveBeenCalledWith('CLEAR_ERROR_LOG')
  })
})
