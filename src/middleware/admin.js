export default function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}
