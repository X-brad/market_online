 function calculerFraisPrestation(budgetCourses) {
  if (!budgetCourses || budgetCourses <= 0) return 500

  if (budgetCourses <= 5000) return 500
  if (budgetCourses <= 15000) return 1200
  if (budgetCourses <= 30000) return 2000
  if (budgetCourses <= 50000) return 3000
  if (budgetCourses <= 100000) return 4500
  return 6000
}

module.exports = { calculerFraisPrestation }
