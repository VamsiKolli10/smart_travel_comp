import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'accommodation',
  initialState: { results: [] },
  reducers: {
    setResults: (s, a) => { s.results = a.payload }
  }
})

export const { setResults } = slice.actions
export default slice.reducer