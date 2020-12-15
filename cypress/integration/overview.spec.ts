context('Overview - Trips', () => {
  beforeEach(() => {
    cy.visit('/auth/' + Cypress.env('authBody'));
  });

  it('Should show more than 0 trips', () => {
    cy.visit('/ritten-overzicht');
    cy.wait(5000);
    cy.get('.ag-row').should((rows) => {
      expect(rows).to.have.length.of.at.least(1);
    });
  });
});
