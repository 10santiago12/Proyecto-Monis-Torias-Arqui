// test/setup.js - Mock setup for Jest tests
const admin = require('firebase-admin');

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
  const mockFirestore = {
    collection: jest.fn(() => mockFirestore),
    doc: jest.fn(() => mockFirestore),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn(() => mockFirestore),
    orderBy: jest.fn(() => mockFirestore),
    limit: jest.fn(() => mockFirestore),
    add: jest.fn(),
    onSnapshot: jest.fn()
  };

  const mockAuth = {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    setCustomUserClaims: jest.fn()
  };

  const mockStorage = {
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        save: jest.fn(),
        download: jest.fn(),
        delete: jest.fn(),
        getSignedUrl: jest.fn(),
        createWriteStream: jest.fn(),
        createReadStream: jest.fn()
      })),
      upload: jest.fn(),
      getFiles: jest.fn()
    }))
  };

  return {
    initializeApp: jest.fn(),
    credential: {
      applicationDefault: jest.fn(),
      cert: jest.fn()
    },
    firestore: jest.fn(() => mockFirestore),
    auth: jest.fn(() => mockAuth),
    storage: jest.fn(() => mockStorage),
    apps: []
  };
});

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((handler) => handler),
    onCall: jest.fn((handler) => handler)
  },
  config: jest.fn(() => ({})),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Global test timeout
jest.setTimeout(10000);

// Console suppression for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
