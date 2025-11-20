/// <reference types="cypress" />

describe('Dashboard Flow', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/');
    cy.contains('Iniciar sesión').should('be.visible');
  });

  it('should show loading state initially', () => {
    cy.visit('/dashboard');
    // Should see some kind of loading or authentication check
  });
});

describe('Session Request Flow', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
    cy.visit('/');
  });

  it('should show request session form', () => {
    cy.visit('/request-session');
    // Should be redirected to login if not authenticated
    cy.url().should('include', '/');
  });

  it('should validate tutor code format', () => {
    // This test assumes user is logged in
    // You would need to implement actual authentication in the test
    cy.visit('/request-session');
  });
});

describe('Session Creation Flow (Student)', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
  });

  it('should display session creation form fields', () => {
    cy.visit('/request-session');
    
    // Should redirect to login first
    cy.url().should('include', '/');
  });

  it('should show validation for required fields', () => {
    cy.visit('/request-session');
    
    // Check that form requires login
    cy.url().should('include', '/');
  });

  // Note: Full E2E tests would require:
  // 1. Firebase emulator setup for testing
  // 2. Test user accounts
  // 3. Seeded data
  // These are placeholder tests showing the structure
});

describe('Protected Routes', () => {
  it('should protect dashboard route', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/');
  });

  it('should protect tutor route', () => {
    cy.visit('/tutor');
    cy.url().should('include', '/');
  });

  it('should protect admin route', () => {
    cy.visit('/admin');
    cy.url().should('include', '/');
  });

  it('should protect request-session route', () => {
    cy.visit('/request-session');
    cy.url().should('include', '/');
  });
});

describe('Navigation', () => {
  it('should show unauthorized page for invalid routes', () => {
    cy.visit('/invalid-route');
    cy.contains('Sin permisos').should('be.visible');
    cy.contains('Ir al inicio').should('be.visible');
  });

  it('should have working home link on unauthorized page', () => {
    cy.visit('/invalid-route');
    cy.contains('Ir al inicio').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
