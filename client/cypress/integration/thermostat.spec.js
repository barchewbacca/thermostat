describe('Thermostat', () => {
  before(() => {
    // arrange
    cy.visit('http://localhost:3000/');
  })

  it('should render data', () => {
    // act and assert
    cy.get('[data-testid="current-temp"]').should('contain.text', '15°');
    cy.get('[data-testid="setpoint"]').should('contain.text', '16.5°');
  })

  it('should decrease setpoint', () => {
    // arrange
    const decrementBtn = cy.get('[data-testid="decrement-btn"]');

    // act
    decrementBtn.click();
    decrementBtn.click();
    decrementBtn.click();

    // assert
    cy.get('[data-testid="setpoint"]').should('contain.text', '15.0°');
  })

  it('should increase setpoint', () => {
    // arrange
    const incrementBtn = cy.get('[data-testid="increment-btn"]');

    // act
    incrementBtn.click();
    incrementBtn.click();
    incrementBtn.click();
    incrementBtn.click();
    incrementBtn.click();

    // assert
    cy.get('[data-testid="setpoint"]').should('contain.text', '17.5°');
  })
});