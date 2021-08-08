import { spy, stub } from "sinon";
import { deepFreeze } from "../helpers";

const generateColor = function (id: number): {
  background: string;
  border: string;
  highlight: {
    background: string;
    border: string;
  };
  hover: {
    background: string;
    border: string;
  };
} {
  const v = "#" + id.toString(16).padStart(5, "0");
  return {
    background: v + "0",
    border: v + "1",
    highlight: {
      background: v + "2",
      border: v + "3",
    },
    hover: {
      background: v + "4",
      border: v + "5",
    },
  };
};

export const body = deepFreeze({
  nodes: {
    1: {
      id: 1,
      x: 100,
      y: -100,
      options: { color: generateColor(1), label: "1" },
    },
    2: {
      id: 2,
      x: 200,
      y: -200,
      options: { color: generateColor(2), label: "L 2" },
    },
    3: {
      id: 3,
      x: 300,
      y: -300,
      options: { color: generateColor(3), label: "La 3" },
    },
    4: {
      id: 4,
      x: 400,
      y: -400,
      options: { color: generateColor(4), label: "Lab 4" },
      shape: { width: 42, height: 37 },
    },
    5: {
      id: 5,
      x: 500,
      y: -500,
      options: { color: generateColor(5), label: "Labe 5" },
    },
    6: {
      id: 6,
      x: 600,
      y: -600,
      options: { color: generateColor(6), label: "Label 6" },
    },
    O: {
      id: "O",
      x: 300,
      y: 300,
      options: { color: generateColor(256 * 256 + 1), label: "Label O" },
    },
    T: {
      id: "T",
      x: 100,
      y: -400,
      options: { color: generateColor(256 * 256 + 2), label: "Label T" },
    },
  },
  view: {
    scale: 2,
  },
  functions: {},
  emitter: {},
});

/**
 * Clone [[body]] and enrich it with stubs and spies like on, off in emitter or distanceToBorder in nodes.
 *
 * @returns Mocked body.
 */
export function mockedBody(): any {
  const mockedBody = JSON.parse(JSON.stringify(body));

  mockedBody.nodes[1].distanceToBorder = stub();
  mockedBody.nodes[1].distanceToBorder.returns(111);
  mockedBody.nodes[2].distanceToBorder = stub();
  mockedBody.nodes[2].distanceToBorder.returns(222);
  mockedBody.nodes[3].distanceToBorder = stub();
  mockedBody.nodes[3].distanceToBorder.returns(333);
  mockedBody.nodes[4].distanceToBorder = stub();
  mockedBody.nodes[4].distanceToBorder.returns(444);
  mockedBody.nodes[5].distanceToBorder = stub();
  mockedBody.nodes[5].distanceToBorder.returns(555);
  mockedBody.nodes[6].distanceToBorder = stub();
  mockedBody.nodes[6].distanceToBorder.returns(666);
  mockedBody.nodes.O.distanceToBorder = stub();
  mockedBody.nodes.O.distanceToBorder.returns(3000);
  mockedBody.nodes.T.distanceToBorder = stub();
  mockedBody.nodes.T.distanceToBorder.returns(3001);

  mockedBody.functions.createNode = stub();
  mockedBody.functions.createNode.returns({
    x: -50,
    y: 50,
    setOptions: spy(),
  });

  mockedBody.emitter.on = spy();
  mockedBody.emitter.off = spy();

  return mockedBody;
}
