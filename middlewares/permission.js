function allowedUsers(allowedRoles) {
  //[1,2] or [1] or [1,2,3]
  return (req, res, next) => {
    if (!req.userId || !allowedRoles.includes(req.userType)) {
      return res.json({ msg: "Access Denied" });
    }
    next();
  };
}

module.exports = allowedUsers;
