const config = require("../../config.json")

const cyFrame = async (fn) => cy.get('#ees-spa-iframe').should('exist').switchToFrame(fn);

describe("Login successfully", () => {
  it("Should have a disclaimer and be redirected on login", () => {
    cy.visit("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/")

    cyFrame(() => {
      cy.get(".form-control>.form-control").should("have.text", "LoginBy logging in, you also log in with Eggs Enhancement Suite. Note that EES is not endorsed by nor affiliated with Eggs.mu, and that you are logging in at your own risk.");
      cy.get(`.input-wrapper [placeholder="IDまたはメールアドレス"]`).type(config.username);
      cy.get(`.input-wrapper [placeholder="パスワード"]`).type(config.password);
      cy.get(".form-control>.form-control>.button").click();
      cy.url().should("eq", "https://eggs.mu/artist/IG_LiLySketch/");
    });

    cy.url().should("eq", "https://eggs.mu/artist/IG_LiLySketch/");
  })

  it ("Should be logged in", () => {
    cy.visit("https://eggs.mu/");

    cyFrame(() => {
      cy.get(".ees-username").should("have.text", "auoktn");
    });
  });
})