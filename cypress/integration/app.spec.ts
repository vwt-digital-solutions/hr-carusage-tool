context('App', () => {
  it('Should authenticate', () => {
    cy.visit('/auth/' + Cypress.env('authBody'));

    /**
     * @see https://github.com/cypress-io/eslint-plugin-cypress/issues/3
     */

    // tslint:disable-next-line no-unused-expression
    expect(Cypress.env('accessToken')).to.be.ok;
  });

  it('Should connect to the API', () => {
    const requestOptions = {
      method: 'GET',
      url: Cypress.env('apiUrl'),
      headers: {
        Authorization: `Bearer ${Cypress.env('accessToken')}`
      }
    };

    cy.request(requestOptions).then(response => {
      expect(response.status).to.equal(200);
    });
  });
});
