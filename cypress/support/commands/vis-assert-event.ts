import { NetworkEvents } from "./types";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Check that given event was fired.
       *
       * @param name - The name of the event as used by Network.on().
       */
      visShiftAndAssertEventFired(name: NetworkEvents): Chainable<Subject>;
      /**
       * Check that given event was fired.
       *
       * @param name - The name of the event as used by Network.on().
       * @param params - The params of the event as supplied by Network.on().
       */
      visShiftAndAssertEventFiredWithParams(
        name: NetworkEvents,
        params: any
      ): Chainable<Subject>;
      /**
       * Check that given event was not fired.
       *
       * @param name - The name of the event as used by Network.on().
       */
      visShiftAndAssertEventNone(
        ...names: readonly NetworkEvents[]
      ): Chainable<Subject>;
    }
  }
}

export function visShiftAndAssertEventFired(name: NetworkEvents): void {
  cy.visRun(async ({ eventQueue }): Promise<void> => {
    expect(eventQueue[name], `${name} event queue`).to.not.be.empty;
    eventQueue[name].shift();
  });
}
Cypress.Commands.add(
  "visShiftAndAssertEventFired",
  visShiftAndAssertEventFired
);

export function visShiftAndAssertEventFiredWithParams(
  name: NetworkEvents,
  params: any
): void {
  cy.visRun(async ({ eventQueue }): Promise<void> => {
    expect(eventQueue[name], `${name} event queue`).to.not.be.empty;
    const event = eventQueue[name].shift();
    expect(event, `${name} event`)
      .to.have.ownProperty("params")
      .that.deep.equals(params);
  });
}
Cypress.Commands.add(
  "visShiftAndAssertEventFiredWithParams",
  visShiftAndAssertEventFiredWithParams
);

export function visShiftAndAssertEventNone(
  ...names: readonly NetworkEvents[]
): void {
  cy.visRun(async ({ eventQueue }): Promise<void> => {
    for (const name of names) {
      expect(eventQueue[name], `${name} event queue`).to.be.empty;
    }
  });
}
Cypress.Commands.add("visShiftAndAssertEventNone", visShiftAndAssertEventNone);
