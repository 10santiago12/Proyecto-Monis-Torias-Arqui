const { errorMiddleware } = require('../../../src/middlewares/error.middleware');

describe('errorMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should return 400 with error message', () => {
    const error = new Error('Something went wrong');
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong' });
  });

  it('should use custom statusCode if provided', () => {
    const error = new Error('Not found');
    error.statusCode = 404;
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  it('should return default message if error has no message', () => {
    const error = {};
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error' });
  });

  it('should handle 500 status codes', () => {
    const error = new Error('Internal server error');
    error.statusCode = 500;
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('should handle 401 unauthorized errors', () => {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('should handle 403 forbidden errors', () => {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });
});
