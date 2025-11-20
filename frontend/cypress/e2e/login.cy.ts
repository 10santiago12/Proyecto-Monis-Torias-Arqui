/// <reference types="cypress" />

describe('Login Flow - Student', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.contains('Monis-Torias').should('be.visible');
    cy.contains('Iniciar sesión').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Ingresar');
  });

  it('should show registration form when clicking register', () => {
    cy.contains('Inscríbete').click();
    cy.contains('Crear cuenta').should('be.visible');
    cy.get('select').should('be.visible'); // Rol selector
  });

  it('should validate email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // HTML5 validation will prevent submission
    cy.get('input[type="email"]:invalid').should('exist');
  });

  it('should require password', () => {
    cy.get('input[type="email"]').type('student@unisabana.edu.co');
    cy.get('button[type="submit"]').click();
    
    // Password is required
    cy.get('input[type="password"]:invalid').should('exist');
  });

  it('should toggle between login and register modes', () => {
    // Start in login mode
    cy.contains('Iniciar sesión').should('be.visible');
    
    // Switch to register
    cy.contains('Inscríbete').click();
    cy.contains('Crear cuenta').should('be.visible');
    
    // Switch back to login
    cy.contains('Inicia sesión').click();
    cy.contains('Iniciar sesión').should('be.visible');
  });

  it('should show submit button state change', () => {
    cy.get('input[type="email"]').type('test@unisabana.edu.co');
    cy.get('input[type="password"]').type('password123');
    
    const submitButton = cy.get('button[type="submit"]');
    submitButton.should('not.be.disabled');
  });
});

describe('Login Flow - Tutor', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
    cy.visit('/');
  });

  it('should allow creating tutor account', () => {
    // Click register
    cy.contains('Inscríbete').click();
    
    // Fill form
    cy.get('input[type="email"]').type('tutor@unisabana.edu.co');
    cy.get('input[type="password"]').type('tutorpass123');
    cy.get('select').select('tutor');
    
    // Submit
    cy.get('button[type="submit"]').click();
    
    // Should handle registration
    cy.get('button[type="submit"]').should('contain', 'Creando');
  });
});

describe('Login Flow - Manager/Admin', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
    cy.visit('/');
  });

  it('should allow creating admin account', () => {
    // Click register
    cy.contains('Inscríbete').click();
    
    // Fill form
    cy.get('input[type="email"]').type('admin@unisabana.edu.co');
    cy.get('input[type="password"]').type('adminpass123');
    cy.get('select').select('manager');
    
    // Verify selection
    cy.get('select').should('have.value', 'manager');
    
    // Submit button should be enabled
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should display all role options', () => {
    cy.contains('Inscríbete').click();
    
    cy.get('select option').should('have.length', 3);
    cy.get('select option').eq(0).should('contain', 'Estudiante');
    cy.get('select option').eq(1).should('contain', 'Tutor');
    cy.get('select option').eq(2).should('contain', 'Administrador');
  });
});
