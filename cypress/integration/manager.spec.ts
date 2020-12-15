context('Manager - Trips overview', () => {
  beforeEach(() => {
    cy.visit('/auth/' + Cypress.env('authBody'));
  });

  it('Should show more than 0 trips', () => {
    cy.visit('/');
    cy.wait(5000);
    cy.get('.ag-center-cols-container .ag-row').should((rows) => {
      expect(rows).to.have.length.of.at.least(1);
    });
  });
});

context('Manager - Trip', () => {
  it('Should load the Leaflet map', () => {
    cy.visit('/');
    cy.wait(5000);

    cy.get('.ag-center-cols-container .ag-row').first().click(
      {force: true}).then(() => {
        cy.get('.leaflet-container').then(() => {
          cy.get('.leaflet-marker-icon').should('exist');
        });
    });
  });

  it('Should be marked', () => {
    cy.get('.btn-group-check').then(($btnGroup) => {
      if ($btnGroup.hasClass('not-checked')) {
        cy.get('#mark-trip-incorrect').click({force: true}).then(() => {
          cy.get('#descriptionInput').type('This is a test review');
          cy.get('.btn.btn-primary').click().then(() => {
            cy.get('.btn.description', {timeout: 10000}).should(
              'have.class', 'btn-danger');
            cy.log('Marked trip as incorrect');
          });
        });
      } else {
        const buttonClasses = cy.get('.btn.description').invoke('attr', 'class');
        const isCorrectTrip = 'btn-success' in buttonClasses ? true : false;

        cy.get('#mark-trip-change').click().then(() => {
          cy.get('button.mark-change-type').click({force: true}).then(() => {
              cy.get('#descriptionInput').type('This is a test review');
              cy.get(`.btn.btn-primary`).click().then(() => {
                cy.get('.btn.description', {timeout: 10000}).should(
                  'have.class', isCorrectTrip ? 'btn-danger' : 'btn-success');

                cy.log(`Marked trip as ${isCorrectTrip ? 'incorrect' : 'correct'}`);
              });
          });
        });
      }
    });
  });
});
