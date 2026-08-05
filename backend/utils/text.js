function communeRegex(commune) {
  const echappe = commune.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${echappe}$`, 'i')
}

module.exports = { communeRegex }
