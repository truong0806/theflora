const removeUndefined = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') removeUndefined(obj[key])
    else if (obj[key] == null) delete obj[key]
  })
  return obj
}

const updateNestedObjectParse = (obj) => {
  const final = {}
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParse(obj[k])
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a]
      })
    } else {
      final[k] = obj[k]
    }
  })
  return final
}

module.exports = {
  removeUndefined,
  updateNestedObjectParse,
}
