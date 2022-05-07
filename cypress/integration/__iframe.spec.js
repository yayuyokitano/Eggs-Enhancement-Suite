const cyFrame = async (fn) => cy.get('#ees-spa-iframe').should('exist').switchToFrame(fn);

describe("Test iframe creation", () => {
  beforeEach(() => {
    cy.visit("https://eggs.mu/");
  })

  it("Should have a player div", () => {
    cy.get("#ees-player").should("exist");
  });

  it("Should have an iframe with actual website", () => {
    cyFrame(() => {
      cy.get(".copyright").should("have.text", "© Eggs Co.,Ltd.");
    });
  });
});