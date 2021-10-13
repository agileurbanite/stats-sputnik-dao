const readDefaultState = () => {
  try {
    return JSON.parse(window.localStorage.getItem('near_tools_local_storage'))
  } catch (err) {
    return {}
  }
}

const defaultState = {
  loading: false,
  config: {
    darkMode: 'light',
    filterOpen: false,
    ...readDefaultState(),
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'config': {
      return {...state, config: action.payload}
    }
    case 'loading': {
      return {...state, loading: action.payload}
    }
    default:
      throw new Error('mutation type not defined')
  }
}

export {reducer, defaultState}
