export function visPlaceNode(x, y) {
    // Open manipulation GUI.
    cy.get(".vis-edit-mode .vis-button.vis-edit").click();
    // Enter node adding mode.
    cy.get(".vis-manipulation .vis-button.vis-add").click();
    // Place the node.
    cy.get("#mynetwork").click(x, y);
    // Close manipulation GUI.
    cy.get(".vis-close").click();
    // There should be no node selected yet.
    cy.get("#events .click .node").should("not.exist");
    // Select the node.
    cy.get("#mynetwork").click(x, y);
    // The added node should be selected now.
    cy.get("#events .click .node").should("have.length", 1);
}
Cypress.Commands.add("visPlaceNode", visPlaceNode);
export function visConnectNodes(from, to) {
    var middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    // Open manipulation GUI.
    cy.get(".vis-edit-mode .vis-button.vis-edit").click();
    // Enter node adding mode.
    cy.get(".vis-manipulation .vis-button.vis-connect").click();
    // Drag the edge between the nodes.
    cy.get("#mynetwork").trigger("pointerdown", from.x, from.y, {
        button: 0
    });
    cy.get("#mynetwork").trigger("pointermove", middle.x, middle.y, {
        button: 0
    });
    cy.get("#mynetwork").trigger("pointerup", to.x, to.y, {
        button: 0
    });
    // Close manipulation GUI.
    cy.get(".vis-close").click();
    // There should be no edge selected yet.
    cy.get("#events .click .edge").should("not.exist");
    // Select the edge.
    cy.get("#mynetwork").click(middle.x, middle.y);
    // The added node should be selected now.
    cy.get("#events .click .edge").should("have.length", 1);
}
Cypress.Commands.add("visConnectNodes", visConnectNodes);
//# sourceMappingURL=commands.js.map