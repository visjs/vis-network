import React, { useEffect } from 'react';
import { Network, DataSet, Node, Edge, Data, Options } from "vis-network";

interface BasicGraphProps {}

const nodes : DataSet<Node> = [
    { id: 1, label: "Node 1" },
  { id: 2, label: "Node 2" },
  { id: 3, label: "Node 3" },
  { id: 4, label: "Node 4" },
  { id: 5, label: "Node 5" }
];

const edges : DataSet<Edge> = [
    { from: 1, to: 3 },
  { from: 1, to: 2 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 3 }
];

const data: Data = {
    nodes: nodes,
    edges: edges
};

const options: Options = {}

export const BasicGraph : React.FC<BasicGraphProps> = (props: BasicGraphProps) => {

    useEffect(() => {
        const container: HTMLElement = document.getElementById("graphId") as HTMLElement;
        new Network(container, data, options);
    });

    return (
        <div id="graphId" style={{height: '100%', width: '100%'}}></div>
    )
}
