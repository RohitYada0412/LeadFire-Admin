import { createSlice, nanoid } from '@reduxjs/toolkit'

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    items: [
      { id: 'l1', name: 'Acme Corp', owner: 'Priya', stage: 'New', value: 12000 },
      { id: 'l2', name: 'Globex', owner: 'Arjun', stage: 'Contacted', value: 4500 }
    ]
  },
  reducers: {
    addLead: {
      reducer(state, action) { state.items.push(action.payload) },
      prepare(payload) { return { payload: { id: nanoid(), ...payload } } }
    }
  }
})

export const { addLead } = leadsSlice.actions
export default leadsSlice.reducer
