describe("Hello World", () => {
  beforeEach(() => {
    cy.visit("https://eggs.mu/")
  });

  it("should have a h1 with id eggs-es-test", () => {
    cy.get("#eggs-es-test").should("have.text", "Hello World");
    cy.get("#eggs-es-test").should("have.prop", "tagName").should("equal", "H1");
  })
})