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

  it("Should navigate normally and without reloading the player", () => {
    cy.get("#ees-state").invoke("text").then((state) => {

      cyFrame(() => {
        cy.get(".artistSearchBtn:visible").click();
        cy.get(".js-artistSearch").type("KITANO REM");
        cy.get("#freewordSearch>.js-artistSearchBtn").click();
        cy.url().should("eq", "https://eggs.mu/search?searchKeyword=KITANO+REM");
      });
      cy.url().should("eq", "https://eggs.mu/search?searchKeyword=KITANO+REM");
      cy.get("#ees-state").should("have.text", state);
  
      cy.go("back");
      cy.url().should("eq", "https://eggs.mu/");
      cyFrame(() => {
        cy.url().should("eq", "https://eggs.mu/");
      });
      cy.get("#ees-state").should("have.text", state);
  
      cy.go("forward");
      cy.url().should("eq", "https://eggs.mu/search?searchKeyword=KITANO+REM");
      cyFrame(() => {
        cy.url().should("eq", "https://eggs.mu/search?searchKeyword=KITANO+REM");
      });
      cy.get("#ees-state").should("have.text", state);

    });
  });
});