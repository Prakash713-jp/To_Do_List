export const getPriorityBadge = (priority) => {
  switch (priority) {
    case "Low": return "bg-secondary";
    case "Medium": return "bg-info text-dark";
    case "High": return "bg-warning text-dark";
    case "Urgent": return "bg-danger";
    default: return "bg-secondary";
  }
};

export const getCategoryBadge = (category) => {
  switch (category) {
    case "Study": return "bg-info text-dark";
    case "Work": return "bg-primary";
    case "Personal": return "bg-success";
    default: return "bg-secondary";
  }
};
