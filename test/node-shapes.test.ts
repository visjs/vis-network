import { expect } from "chai";
import { stub } from "sinon";
import { deepFreeze } from "./helpers";

import Box from "../lib/network/modules/components/nodes/shapes/Box";
import Circle from "../lib/network/modules/components/nodes/shapes/Circle";
import CircularImage from "../lib/network/modules/components/nodes/shapes/CircularImage";
import Database from "../lib/network/modules/components/nodes/shapes/Database";
import Diamond from "../lib/network/modules/components/nodes/shapes/Diamond";
import Dot from "../lib/network/modules/components/nodes/shapes/Dot";
import Ellipse from "../lib/network/modules/components/nodes/shapes/Ellipse";
import Hexagon from "../lib/network/modules/components/nodes/shapes/Hexagon";
import Icon from "../lib/network/modules/components/nodes/shapes/Icon";
import Image from "../lib/network/modules/components/nodes/shapes/Image";
import Square from "../lib/network/modules/components/nodes/shapes/Square";
import Star from "../lib/network/modules/components/nodes/shapes/Star";
import Text from "../lib/network/modules/components/nodes/shapes/Text";
import Triangle from "../lib/network/modules/components/nodes/shapes/Triangle";
import TriangleDown from "../lib/network/modules/components/nodes/shapes/TriangleDown";

describe("Node Shapes", function(): void {
  const ctx = {};

  const generateOptions = (): any => ({
    borderWidth: 7,
    size: 31,
    icon: {
      size: 29
    },
    margin: {
      top: 7,
      right: 8,
      bottom: 9,
      left: 10
    },
    shapeProperties: {
      useImageSize: true
    }
  });

  const generateBody = (): any => ({});

  const generateLabelModule = (): any => {
    const labelModule = {
      adjustSizes: stub(),
      differentState: stub(),
      getTextSize: stub()
    };

    labelModule.differentState.returns(true);
    labelModule.getTextSize.returns({
      width: 231,
      height: 33,
      lineCount: 3
    });

    return labelModule;
  };

  const img1 = deepFreeze({
    src: "img1.svg",
    width: 192,
    height: 111
  });
  const img2 = deepFreeze({
    src: "img2.png",
    width: 207,
    height: 293
  });
  [
    { name: "Box", Clazz: Box, distanceToBorder: 42 },
    { name: "Circle", Clazz: Circle, distanceToBorder: 125 },
    {
      name: "CircularImage",
      Clazz: CircularImage,
      args: [img1, img2],
      distanceToBorder: 96
    },
    { name: "Database", Clazz: Database, distanceToBorder: 180 },
    { name: "Diamond", Clazz: Diamond, distanceToBorder: 50 },
    { name: "Dot", Clazz: Dot, distanceToBorder: 31 },
    { name: "Ellipse", Clazz: Ellipse, distanceToBorder: 46 },
    { name: "Hexagon", Clazz: Hexagon, distanceToBorder: 50 },
    { name: "Icon", Clazz: Icon, distanceToBorder: 39 },
    { name: "Image", Clazz: Image, args: [img1, img2], distanceToBorder: 87 },
    { name: "Square", Clazz: Square, distanceToBorder: 50 },
    { name: "Star", Clazz: Star, distanceToBorder: 50 },
    { name: "Text", Clazz: Text, distanceToBorder: 42 },
    { name: "Triangle", Clazz: Triangle, distanceToBorder: 50 },
    { name: "TriangleDown", Clazz: TriangleDown, distanceToBorder: 50 }
  ].forEach(({ name, Clazz, args, distanceToBorder }): void => {
    describe(name, function(): void {
      const generateInstance = (): typeof Clazz =>
        new Clazz(
          generateOptions(),
          generateBody(),
          generateLabelModule(),
          ...(args || [])
        );

      it("Distance to Border", function(): void {
        const instance = generateInstance();

        expect(instance.distanceToBorder(ctx, 0.77)).to.be.approximately(
          distanceToBorder,
          1
        );
      });

      describe("Shadow", function(): void {
        it("Enable enabled", function(): void {
          const instance = generateInstance();
          const ctx = {};

          instance.enableShadow(ctx, {
            shadow: true,
            shadowColor: "#123456",
            shadowSize: 9,
            shadowX: 77,
            shadowY: 31
          });

          expect(ctx).to.deep.equal({
            shadowColor: "#123456",
            shadowBlur: 9,
            shadowOffsetX: 77,
            shadowOffsetY: 31
          });
        });

        it("Enable disabled", function(): void {
          const instance = generateInstance();
          const ctx = {};

          instance.enableShadow(ctx, {
            shadow: false,
            shadowColor: "#123456",
            shadowSize: 9,
            shadowX: 77,
            shadowY: 31
          });

          expect(
            ctx,
            "Nothing should be configured if the shadow isn’t enabled."
          ).to.deep.equal({});
        });

        it("Disable enabled", function(): void {
          const instance = generateInstance();
          const ctx = {};

          instance.disableShadow(ctx, {
            shadow: true
          });

          expect(ctx).to.deep.equal({
            shadowColor: "rgba(0,0,0,0)",
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          });
        });

        it("Disable disabled", function(): void {
          const instance = generateInstance();
          const ctx = {};

          instance.disableShadow(ctx, {
            shadow: false
          });

          expect(
            ctx,
            "Nothing should be configured if the shadow isn’t enabled."
          ).to.deep.equal({});
        });
      });
    });
  });
});
