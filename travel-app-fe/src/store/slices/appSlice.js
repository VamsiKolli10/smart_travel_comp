import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'app',
  initialState: { theme: 'auto', notifications: [] },
  reducers: {
    setTheme: (s,a) => { s.theme = a.payload }
  }
})

export const { setTheme } = slice.actions
export default slice.reducer