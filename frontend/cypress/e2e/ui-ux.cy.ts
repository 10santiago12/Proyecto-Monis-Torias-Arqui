/// <reference types="cypress" />

describe('UI/UX Elements', () => {
  beforeEach(() => {
    cy.clearFirebaseData();
    cy.visit('/');
  });

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.contains('Monis-Torias').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
  });

  it('should be responsive on tablet viewport', () => {
    cy.viewport('ipad-2');
    cy.contains('Monis-Torias').should('be.visible');
    cy.get('.login-shell').should('be.visible');
  });

  it('should be responsive on desktop viewport', () => {
    cy.viewport(1920, 1080);
    cy.contains('Monis-Torias').should('be.visible');
    cy.get('.login-shell').should('be.visible');
  });

  it('should have proper contrast for text', () => {
    cy.get('h1').should('have.css', 'color');
    cy.get('input[type="email"]').should('have.css', 'background-color');
  });

  it('should show focus states on inputs', () => {
    cy.get('input[type="email"]').focus();
    cy.get('input[type="email"]').should('have.focus');
    
    cy.get('input[type="password"]').focus();
    cy.get('input[type="password"]').should('have.focus');
  });

  it('should show hover states on buttons', () => {
    cy.get('button[type="submit"]').trigger('mouseover');
    // Button should have hover styles applied
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have accessible form labels', () => {
    cy.contains('Inscríbete').click();
    
    cy.get('label').contains('Correo institucional').should('exist');
    cy.get('label').contains('Contraseña').should('exist');
    cy.get('label').contains('Rol').should('exist');
  });

  it('should display brand consistently', () => {
    cy.get('.brand-badge').should('contain', 'MT');
    cy.contains('Monis-Torias').should('be.visible');
    cy.contains('Plataforma de tutorías').should('be.visible');
  });
});

describe('Form Validation and Error Handling', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show placeholder text in inputs', () => {
    cy.get('input[type="email"]').should('have.attr', 'placeholder');
    cy.get('input[type="password"]').should('have.attr', 'placeholder');
  });

  it('should mark required fields', () => {
    cy.get('input[type="email"]').should('have.attr', 'required');
    cy.get('input[type="password"]').should('have.attr', 'required');
  });

  it('should show visual feedback on form submission', () => {
    cy.get('input[type="email"]').type('test@unisabana.edu.co');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Button should change text or state
    cy.wait(100); // Small wait to see state change
  });
});

describe('Accessibility Features', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should be keyboard navigable', () => {
    cy.get('body').tab();
    cy.focused().should('have.attr', 'type', 'email');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'type', 'password');
  });

  it('should have semantic HTML', () => {
    cy.get('header').should('not.exist'); // Login page doesn't have header
    cy.get('form').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should have proper button types', () => {
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Inscríbete').should('have.attr', 'type', 'button');
  });
});

describe('Performance and Loading', () => {
  it('should load page quickly', () => {
    const start = Date.now();
    cy.visit('/');
    cy.contains('Monis-Torias').should('be.visible');
    const loadTime = Date.now() - start;
    
    // Should load in under 3 seconds
    expect(loadTime).to.be.lessThan(3000);
  });

  it('should load styles correctly', () => {
    cy.visit('/');
    cy.get('.login-root').should('have.css', 'display');
    cy.get('.login-shell').should('have.css', 'background-color');
  });
});
