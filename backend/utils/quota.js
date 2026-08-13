// Détermine le début de la fenêtre de quota en cours pour une coursière :
// normalement minuit (reset naturel chaque jour), mais si elle a racheté des
// unités plus tard dans la journée, la fenêtre repart de ce paiement — son
// quota revient à 0/X immédiatement au lieu d'attendre le lendemain.
function debutFenetreQuota(coursiere) {
  const debutJour = new Date()
  debutJour.setHours(0, 0, 0, 0)

  const quotaDepuis = coursiere?.quotaDepuis ? new Date(coursiere.quotaDepuis) : null
  if (quotaDepuis && quotaDepuis > debutJour) return quotaDepuis
  return debutJour
}

module.exports = { debutFenetreQuota }
