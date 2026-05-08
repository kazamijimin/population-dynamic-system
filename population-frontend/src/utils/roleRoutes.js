export const getRoleHomePath = (role) => {
  switch (role) {
    case "admin":
      return "/admin/profile";
    case "manager":
      return "/manager/profile";
    case "staff":
    default:
      return "/staff/profile";
  }
};
