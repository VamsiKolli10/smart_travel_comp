import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'translation',
  initialState: { history: [] },
  reducers: {
    addTranslation: (s, a) => { s.history.push(a.payload) }
  }
})

export const { addTranslation } = slice.actions
export default slice.reducer