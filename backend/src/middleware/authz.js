export function requireAuth(req, res, next) {
  console.log('requireAuth - Session:', {
    userId: req.session?.userId,
    user: req.session?.user,
    sessionID: req.sessionID
  });
  if (!req.session?.userId) {
    console.log('requireAuth - FAILED: No userId in session');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.session?.user?.role;
    if (!req.session?.userId || !role) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

export function requireAnyStaff(req, res, next) {
  const allowed = ['finance_manager', 'inventory_manager', 'receptionist', 'service_advisor', 'admin'];
  const role = req.session?.user?.role;
  console.log('requireAnyStaff - Session:', {
    userId: req.session?.userId,
    role: role,
    sessionID: req.sessionID
  });
  if (!req.session?.userId || !role) {
    console.log('requireAnyStaff - FAILED: No userId or role in session');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!allowed.includes(role)) {
    console.log(`requireAnyStaff - FORBIDDEN: Role '${role}' not in allowed list`);
    return res.status(403).json({ message: 'Staff only' });
  }
  next();
}


