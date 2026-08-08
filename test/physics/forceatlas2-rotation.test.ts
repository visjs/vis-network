import { expect } from "chai";
import Network from "../../lib/network/Network.js";
import { canvasMockify } from "../canvas-mock.js";

/**
 * Regression test for issue #2193: with the `forceAtlas2Based` solver an
 * asymmetric graph converges to a stable *shape* but the whole layout then
 * keeps rotating about its center of mass forever.
 *
 * Root cause: `FA2BasedRepulsionSolver` scaled the pairwise repulsion by the
 * *receiving* node's degree only, so the repulsion between two nodes of
 * different degree was non-reciprocal -- it violated Newton's third law.
 * ForceAtlas2's repulsion is defined as `k * (deg(a)+1) * (deg(b)+1) / dist`
 * (Jacomy et al. 2014): symmetric in the two degrees, hence reciprocal. The
 * one-sided factor injects a small net torque every tick; velocity damping
 * removes relative motion but not a rigid rotation, so the converged layout
 * spins at a terminal rate. The fix folds `(degree+1)` into the Barnes-Hut
 * effective mass (both when building the tree and when evaluating the force),
 * which keeps the degree-weighted "hubs to the periphery" behaviour while
 * making the force reciprocal again. The bug only shows on a
 * degree-heterogeneous, asymmetric graph -- on a symmetric one the per-pair
 * torques cancel, which is why it stayed undiagnosed.
 *
 * What this test measures: the *actual rotation of the node positions*, not a
 * velocity proxy. It drives the engine with `minVelocity: 0` so the solver
 * never reports "stabilized" (the regime in which the live network keeps
 * ticking and the rotation is visible), converges the shape, then measures the
 * best-fit rigid rotation angle of the whole configuration over a long window
 * via the orthogonal Procrustes formula
 *   angle = atan2( Σ(x0*y1 - y0*x1), Σ(x0*x1 + y0*y1) )
 * where (x0,y0) and (x1,y1) are node positions relative to the centroid at the
 * start and end of the window.
 *
 * On the buggy code the layout rotates ~122 deg over the 20000-step window and
 * never settles; with the fix it rotates < 0.5 deg and settles. The threshold
 * below (5 deg) sits more than an order of magnitude clear of both.
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
          // Constant timestep -> deterministic, comparable measurements. Drive
          // the engine ourselves below instead of relying on the asynchronous,
          // render-loop-based stabilization.
          adaptiveTimestep: false,
          stabilization: { enabled: false },
          // Never report "stabilized" so physicsTick keeps integrating; this is
          // the regime in which the perpetual rotation is observable (a settled
          // engine would simply freeze and hide it).
          minVelocity: 0,
        },
      },
    );

    const engine = network.physics;
    engine.updatePhysicsData();

    // Converge the shape.
    for (let i = 0; i < 6000; i++) {
      engine.physicsTick();
    }

    // Snapshot positions relative to the centroid, advance a long window, then
    // measure the net rigid rotation between the two snapshots.
    const before = relativePositions(network);
    const windowSteps = 20000;
    for (let i = 0; i < windowSteps; i++) {
      engine.physicsTick();
    }
    const after = relativePositions(network);

    const rotationDeg = Math.abs(
      (bestFitRotation(before, after) * 180) / Math.PI,
    );

    // Stop the render loop before the JSDOM is torn down (the canvas mock
    // shims requestAnimationFrame onto setTimeout, which would otherwise fire
    // after teardown and throw "window is not defined").
    network.destroy();

    // Buggy code: ~122 deg (and still climbing -- it never settles).
    // Fixed code: < 0.5 deg. The threshold sits well clear of both.
    expect(rotationDeg).to.be.below(5);
  });
});

/**
 * Node positions relative to the configuration's centroid.
 * @param network - the vis Network to inspect
 * @returns parallel arrays of x and y offsets from the centroid
 */
function relativePositions(network: any): { x: number[]; y: number[] } {
  const nodes = network.body.nodes;
  const ids = network.physics.physicsBody.physicsNodeIndices;

  let cx = 0;
  let cy = 0;
  for (const id of ids) {
    cx += nodes[id].x;
    cy += nodes[id].y;
  }
  cx /= ids.length;
  cy /= ids.length;

  const x: number[] = [];
  const y: number[] = [];
  for (const id of ids) {
    x.push(nodes[id].x - cx);
    y.push(nodes[id].y - cy);
  }
  return { x, y };
}

/**
 * Best-fit rigid rotation angle taking configuration `a` onto configuration `b`
 * (orthogonal Procrustes, 2D): angle = atan2(Σ a×b, Σ a·b). Both configurations
 * must be centered (see relativePositions) and index-aligned.
 * @param a - start positions relative to centroid
 * @param b - end positions relative to centroid
 * @returns the signed best-fit rotation angle in radians
 */
function bestFitRotation(
  a: { x: number[]; y: number[] },
  b: { x: number[]; y: number[] },
): number {
  let cross = 0; // Σ (ax*by - ay*bx)
  let dot = 0; // Σ (ax*bx + ay*by)
  for (let i = 0; i < a.x.length; i++) {
    cross += a.x[i] * b.y[i] - a.y[i] * b.x[i];
    dot += a.x[i] * b.x[i] + a.y[i] * b.y[i];
  }
  return Math.atan2(cross, dot);
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
