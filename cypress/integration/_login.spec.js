const config = require("../../config.json")

describe("Login successfully", () => {
  it("Should have a disclaimer and be redirected on login", () => {
    cy.visit("https://eggs.mu/login?location=https://eggs.mu/artist/IG_LiLySketch/")
    cy.get(".form-control>.form-control").should("have.text", "LoginBy logging in, you also log in with Eggs Enhancement Suite. Note that EES is not endorsed by nor affiliated with Eggs.mu, and that you are logging in at your own risk.");
    cy.get(`.input-wrapper [placeholder="IDまたはメールアドレス"]`).type(config.username);
    cy.get(`.input-wrapper [placeholder="パスワード"]`).type(config.password);
    cy.get(".form-control>.form-control>.button").click();
    cy.url().should("eq", "https://eggs.mu/artist/IG_LiLySketch/");
  })

  it ("Should be logged in", () => {
    cy.visit("https://eggs.mu/");
    cy.get(".btn .m-artist_txt").should("have.text", "auoktn");
    
    //display menu if on mobile resolution
    try {
      cy.get("#user_icon_sp").click();
    } catch {

    }

    cy.get("#loggedin").scrollIntoView().should("be.visible");
    cy.get("#gn_signin").should("not.be.visible");
    cy.get("#gn_login").should("not.be.visible");
  });
})