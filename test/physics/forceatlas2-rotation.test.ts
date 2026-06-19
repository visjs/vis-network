import { expect } from "chai";
import Network from "../../lib/network/Network.js";
import { canvasMockify } from "../canvas-mock.js";

/**
 * Regression test for issue #2193: with the `forceAtlas2Based` solver an
 * asymmetric graph never settles. After the layout has visually converged the
 * whole graph keeps rotating about its center of mass forever.
 *
 * Root cause: `FA2BasedRepulsionSolver._calculateForces` scaled the pairwise
 * repulsion by the *receiving* node's degree only, so the repulsion between two
 * nodes of different degree was non-reciprocal (it violated Newton's third law).
 * Each tick that injected a small net torque into the system; velocity damping
 * caps but never removes it, so the converged layout spins at a terminal
 * angular velocity. The bug only manifests on a degree-heterogeneous,
 * asymmetric graph -- on a symmetric one the per-pair torques cancel, which is
 * why it stayed undiagnosed.
 *
 * This test builds an asymmetric, strongly degree-heterogeneous graph (a few
 * hubs in a cycle, each carrying very different numbers of leaves), converges
 * it with a fixed timestep, and then measures the net angular velocity of the
 * whole configuration about its center of mass over a window of steps, where
 * omega = L / I, L = sum(rx*vy - ry*vx), I = sum(rx^2 + ry^2), and
 * r = pos - centerOfMass.
 *
 * On the buggy code this is a *sustained* spin (|omega| ~= 1.4e-4 -- the window
 * mean and window max coincide, i.e. it does not decay). With the fix the
 * configuration is genuinely settled and |omega| drops by ~4 orders of
 * magnitude (~1.1e-8). The threshold below sits well clear of both.
 */
describe("ForceAtlas2 rotation (issue #2193)", function (): void {
  beforeEach(function () {
    this.clearJSDOM = canvasMockify("<div id='mynetwork'></div>");
    this.container = document.getElementById("mynetwork");
  });

  afterEach(function () {
    this.clearJSDOM();

    delete this.clearJSDOM;
    delete this.container;
  });

  it("a converged asymmetric layout does not keep rotating", function (): void {
    this.timeout(120000);

    // --- Build a deterministic, asymmetric, degree-heterogeneous graph. ------
    // A symmetric graph would NOT exhibit the bug (its per-pair torques cancel),
    // so the heterogeneity of the hub degrees below is essential. Initial
    // positions come from a seeded PRNG so the run is fully reproducible.
    const rng = mulberry32(0xc0ffee);
    const nodes: { id: number; x: number; y: number }[] = [];
    const edges: { from: number; to: number }[] = [];

    const place = (id: number): void => {
      nodes.push({ id, x: (rng() - 0.5) * 600, y: (rng() - 0.5) * 600 });
    };

    const hubs = [0, 1, 2, 3, 4];
    hubs.forEach((h): void => place(h));
    // Connect the hubs in a cycle.
    for (let i = 0; i < hubs.length; i++) {
      edges.push({ from: hubs[i], to: hubs[(i + 1) % hubs.length] });
    }
    // Give each hub a very different number of leaves -> heterogeneous degrees.
    let nextId = hubs.length;
    const leavesPerHub = [40, 20, 10, 4, 1];
    hubs.forEach((hub, idx): void => {
      for (let k = 0; k < leavesPerHub[idx]; k++) {
        const id = nextId++;
        place(id);
        edges.push({ from: hub, to: id });
      }
    });

    const network = new Network(
      this.container,
      { nodes, edges },
      {
        physics: {
          solver: "forceAtlas2Based",
          // Constant timestep -> deterministic, comparable angular-velocity
          // measurements. Drive the engine ourselves below instead of relying
          // on the asynchronous, render-loop-based stabilization.
          adaptiveTimestep: false,
          stabilization: { enabled: false },
        },
      },
    );

    const engine = network.physics;
    engine.updatePhysicsData();

    // Converge the layout.
    for (let i = 0; i < 6000; i++) {
      engine.physicsTick();
    }

    // Measure the net rotation over a window of further steps. Averaging cancels
    // the small transient settling motion and isolates *sustained* rotation;
    // the per-step maximum is also tracked to confirm the value is steady (a
    // terminal spin) rather than a decaying transient.
    let omegaSum = 0;
    let omegaAbsMax = 0;
    const window = 200;
    for (let i = 0; i < window; i++) {
      engine.physicsTick();
      const omega = angularVelocityAboutCenterOfMass(network);
      omegaSum += omega;
      omegaAbsMax = Math.max(omegaAbsMax, Math.abs(omega));
    }
    const meanOmega = Math.abs(omegaSum / window);

    // Buggy code: meanOmega ~= 1.39e-4 and omegaAbsMax ~= 1.39e-4 (sustained).
    // Fixed code: meanOmega ~= 1.14e-8 and omegaAbsMax ~= 1.14e-8 (settled).
    // The threshold sits cleanly between the two by orders of magnitude.
    expect(meanOmega).to.be.below(1e-5);
    expect(omegaAbsMax).to.be.below(1e-5);
  });
});

/**
 * Net angular velocity of the whole configuration about its center of mass,
 * omega = L / I, using live node positions and physics velocities.
 * @param network - the vis Network to inspect
 * @returns the (signed) angular velocity about the center of mass
 */
function angularVelocityAboutCenterOfMass(network: any): number {
  const nodes = network.body.nodes;
  const velocities = network.physics.physicsBody.velocities;
  const ids = network.physics.physicsBody.physicsNodeIndices;

  let cx = 0;
  let cy = 0;
  for (const id of ids) {
    cx += nodes[id].x;
    cy += nodes[id].y;
  }
  cx /= ids.length;
  cy /= ids.length;

  let angularMomentum = 0; // L = sum( rx*vy - ry*vx )
  let momentOfInertia = 0; // I = sum( rx^2 + ry^2 )
  for (const id of ids) {
    const rx = nodes[id].x - cx;
    const ry = nodes[id].y - cy;
    const v = velocities[id];
    angularMomentum += rx * v.y - ry * v.x;
    momentOfInertia += rx * rx + ry * ry;
  }
  return angularMomentum / momentOfInertia;
}

/**
 * Small seeded PRNG (mulberry32) so initial node positions are deterministic
 * and the test is fully reproducible.
 * @param seed - 32-bit seed
 * @returns a function returning the next pseudo-random number in [0, 1)
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
