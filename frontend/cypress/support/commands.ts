/// <reference types="cypress" />

// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI
       * @example cy.login('student@test.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to clear all Firebase data
       * @example cy.clearFirebaseData()
       */
      clearFirebaseData(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('clearFirebaseData', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

export {};
