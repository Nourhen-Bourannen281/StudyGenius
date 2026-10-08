// Liste statique de tous les badges possibles dans l'application.
// "id" est utilisé comme identifiant unique stocké en base pour chaque utilisateur.
const BADGES = [
  {
    id: "first_course",
    name: "Premier pas",
    description: "Importer ton premier cours",
    icon: "BookOpen",
  },
  {
    id: "five_courses",
    name: "Collectionneur",
    description: "Importer 5 cours",
    icon: "Library",
  },
  {
    id: "first_quiz",
    name: "Premier quiz",
    description: "Terminer ton premier quiz",
    icon: "HelpCircle",
  },
  {
    id: "perfect_score",
    name: "Score parfait",
    description: "Obtenir 100% à un quiz",
    icon: "Trophy",
  },
  {
    id: "ten_quizzes",
    name: "Assidu",
    description: "Terminer 10 quiz au total",
    icon: "Target",
  },
  {
    id: "group_joiner",
    name: "Esprit d'équipe",
    description: "Rejoindre ou créer un groupe d'étude",
    icon: "Users",
  },
];

module.exports = BADGES;