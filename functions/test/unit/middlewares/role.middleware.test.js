const { requireRoles } = require('../../../src/middlewares/role.middleware');

describe('requireRoles', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it('should return 403 if no user in request', () => {
    const middleware = requireRoles('manager');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user has no roles', () => {
    req.user = { uid: 'user1', roles: {} };
    const middleware = requireRoles('manager');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not have required role', () => {
    req.user = { uid: 'user2', roles: { student: true } };
    const middleware = requireRoles('manager');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user has the required role', () => {
    req.user = { uid: 'user3', roles: { manager: true } };
    const middleware = requireRoles('manager');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next if user has one of multiple required roles', () => {
    req.user = { uid: 'user4', roles: { tutor: true } };
    const middleware = requireRoles('manager', 'tutor');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 if user has none of multiple required roles', () => {
    req.user = { uid: 'user5', roles: { student: true } };
    const middleware = requireRoles('manager', 'tutor');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle role values that are not true', () => {
    req.user = { uid: 'user6', roles: { manager: false, tutor: null } };
    const middleware = requireRoles('manager', 'tutor');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should work with empty roles array', () => {
    req.user = { uid: 'user7', roles: { manager: true } };
    const middleware = requireRoles();
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
