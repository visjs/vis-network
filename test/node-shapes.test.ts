import { expect } from "chai";
import { assert, spy, stub } from "sinon";
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

describe("Node Shapes", function (): void {
  const generateOptions = (): any => ({
    borderWidth: 7,
    size: 31,
    icon: {
      size: 29,
    },
    margin: {
      top: 7,
      right: 8,
      bottom: 9,
      left: 10,
    },
    shapeProperties: {
      borderRadius: 3,
    },
  });

  const generateBody = (): any => ({});

  const generateLabelModule = (): any => {
    const labelModule = {
      adjustSizes: stub(),
      differentState: stub(),
      getTextSize: stub(),
      size: {
        top: -31,
        right: 0,
        bottom: 37,
        left: 12,
        width: 12,
        height: 68,
      },
    };

    labelModule.differentState.returns(true);
    labelModule.getTextSize.returns({
      width: 231,
      height: 33,
      lineCount: 3,
    });

    return labelModule;
  };

  const img0 = deepFreeze({});
  const img1 = deepFreeze({
    src: "img1.svg",
    width: 192,
    height: 111,
  });
  const img2 = deepFreeze({
    src: "img2.png",
    width: 207,
    height: 293,
  });
  const img3 = deepFreeze({
    src: "img3.svg",
    width: 393,
    height: 312,
  });
  const img4 = deepFreeze({
    src: "img4.png",
    width: 408,
    height: 494,
  });
  [
    {
      name: "Box",
      Clazz: Box,
      distanceToBorder: 42,
      boundingBox: {
        bottom: -924,
        left: -128,
        right: 128,
        top: -979,
      },
    },
    {
      name: "Circle",
      Clazz: Circle,
      distanceToBorder: 125,
      boundingBox: {
        bottom: -827,
        left: -125,
        right: 125,
        top: -1076,
      },
    },
    {
      name: "CircularImage (not loaded)",
      Clazz: CircularImage,
      args: [img0],
      distanceToBorder: 31,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "CircularImage (don't use image size)",
      Clazz: CircularImage,
      args: [img1, img2],
      img: true,
      editOptions(options: any) {
        options.shapeProperties.useImageSize = false;
        return options;
      },
      distanceToBorder: 54,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "CircularImage (use image size)",
      Clazz: CircularImage,
      args: [img1, img2],
      img: true,
      editOptions(options: any) {
        options.shapeProperties.useImageSize = true;
        return options;
      },
      distanceToBorder: 96,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "Database",
      Clazz: Database,
      distanceToBorder: 180,
      boundingBox: {
        bottom: -827,
        left: -125,
        right: 125,
        top: -1076,
      },
    },
    {
      name: "Diamond",
      Clazz: Diamond,
      distanceToBorder: 50,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "Dot",
      Clazz: Dot,
      distanceToBorder: 31,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "Ellipse",
      Clazz: Ellipse,
      distanceToBorder: 46,
      boundingBox: {
        bottom: -918,
        left: -132,
        right: 132,
        top: -984,
      },
    },
    {
      name: "Hexagon",
      Clazz: Hexagon,
      distanceToBorder: 50,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "Icon",
      Clazz: Icon,
      distanceToBorder: 39,
      boundingBox: {
        bottom: -937,
        left: -15,
        right: 15,
        top: -966,
      },
    },
    {
      name: "Image (not loaded)",
      Clazz: Image,
      args: [img0],
      distanceToBorder: 50,
      boundingBox: {
        bottom: -920,
        left: -31,
        right: 31,
        top: -982,
      },
    },
    {
      name: "Image (don't use image size)",
      Clazz: Image,
      args: [img1, img2],
      img: true,
      editOptions(options: any) {
        options.shapeProperties.useImageSize = false;
        return options;
      },
      distanceToBorder: 52,
      boundingBox: {
        bottom: -920,
        left: -54,
        right: 54,
        top: -982,
      },
    },
    {
      name: "Image (use image size)",
      Clazz: Image,
      args: [img1, img2],
      img: true,
      editOptions(options: any) {
        options.shapeProperties.useImageSize = true;
        return options;
      },
      distanceToBorder: 87,
      boundingBox: {
        top: -1007,
        right: 96,
        bottom: -895,
        left: -96,
      },
    },
    {
      name: "Square",
      Clazz: Square,
      distanceToBorder: 50,
      boundingBox: {
        top: -982,
        right: 31,
        bottom: -920,
        left: -31,
      },
    },
    {
      name: "Star",
      Clazz: Star,
      distanceToBorder: 50,
      boundingBox: {
        top: -982,
        right: 31,
        bottom: -920,
        left: -31,
      },
    },
    {
      name: "Text",
      Clazz: Text,
      distanceToBorder: 42,
      boundingBox: {
        top: -976,
        left: -125,
        right: 125,
        bottom: -927,
      },
    },
    {
      name: "Triangle",
      Clazz: Triangle,
      distanceToBorder: 50,
      boundingBox: {
        top: -982,
        right: 31,
        bottom: -920,
        left: -31,
      },
    },
    {
      name: "TriangleDown",
      Clazz: TriangleDown,
      distanceToBorder: 50,
      boundingBox: {
        top: -982,
        right: 31,
        bottom: -920,
        left: -31,
      },
    },
  ].forEach(
    ({
      name,
      Clazz,
      args,
      img,
      editOptions,
      distanceToBorder,
      boundingBox,
    }): void => {
      describe(name, function (): void {
        const generateInstance = (overrideArgs?: unknown[]): typeof Clazz =>
          new Clazz(
            editOptions ? editOptions(generateOptions()) : generateOptions(),
            generateBody(),
            generateLabelModule(),
            ...(overrideArgs || args || [])
          );

        it("Distance to Border", function (): void {
          const instance = generateInstance();

          expect(instance.distanceToBorder({}, 0.77)).to.be.approximately(
            distanceToBorder,
            1
          );
        });

        describe("Shadow", function (): void {
          it("Enable enabled", function (): void {
            const instance = generateInstance();
            const ctx = {};

            instance.enableShadow(ctx, {
              shadow: true,
              shadowColor: "#123456",
              shadowSize: 9,
              shadowX: 77,
              shadowY: 31,
            });

            expect(ctx).to.deep.equal({
              shadowColor: "#123456",
              shadowBlur: 9,
              shadowOffsetX: 77,
              shadowOffsetY: 31,
            });
          });

          it("Enable disabled", function (): void {
            const instance = generateInstance();
            const ctx = {};

            instance.enableShadow(ctx, {
              shadow: false,
              shadowColor: "#123456",
              shadowSize: 9,
              shadowX: 77,
              shadowY: 31,
            });

            expect(
              ctx,
              "Nothing should be configured if the shadow isn't enabled."
            ).to.deep.equal({});
          });

          it("Disable enabled", function (): void {
            const instance = generateInstance();
            const ctx = {};

            instance.disableShadow(ctx, {
              shadow: true,
            });

            expect(ctx).to.deep.equal({
              shadowColor: "rgba(0,0,0,0)",
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
            });
          });

          it("Disable disabled", function (): void {
            const instance = generateInstance();
            const ctx = {};

            instance.disableShadow(ctx, {
              shadow: false,
            });

            expect(
              ctx,
              "Nothing should be configured if the shadow isn't enabled."
            ).to.deep.equal({});
          });
        });

        describe("Dashes", function (): void {
          it("Enable default", function (): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy(),
            };

            instance.enableBorderDashes(ctx, {
              borderDashes: true,
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [5, 15]);
          });

          it("Enable custom", function (): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy(),
            };

            instance.enableBorderDashes(ctx, {
              borderDashes: [1, 2, 3, 4],
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [1, 2, 3, 4]);
          });

          it("Enable disabled", function (): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy(),
            };

            instance.enableBorderDashes(ctx, {
              borderDashes: false,
            });

            assert.notCalled(ctx.setLineDash);
          });

          it("Disable default", function (): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy(),
            };

            instance.disableBorderDashes(ctx, {
              borderDashes: true,
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [0]);
          });

          it("Disable custom", function (): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy(),
            };

            instance.disableBorderDashes(ctx, {
              borderDashes: [1, 2, 3, 4],
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [0]);
          });

          it("Disable disabled", function (): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy(),
            };

            instance.disableBorderDashes(ctx, {
              borderDashes: false,
            });

            assert.notCalled(ctx.setLineDash);
          });
        });

        describe("Bounding box", function (): void {
          it("Update", function (): void {
            const instance = generateInstance();

            instance.resize({});
            instance.updateBoundingBox(0, -951);

            expect(instance.boundingBox).to.be.an("object");
            expect(instance.boundingBox.top, "top").to.be.approximately(
              boundingBox.top,
              1
            );
            expect(instance.boundingBox.right, "right").to.be.approximately(
              boundingBox.right,
              1
            );
            expect(instance.boundingBox.bottom, "bottom").to.be.approximately(
              boundingBox.bottom,
              1
            );
            expect(instance.boundingBox.left, "left").to.be.approximately(
              boundingBox.left,
              1
            );
          });
        });

        if (img) {
          describe("Set images", function (): void {
            it("Selected", function (): void {
              const instance = generateInstance();
              instance.selected = true;

              instance.setImages(img3, img4);

              expect(instance.imageObj).to.equal(img4);
              expect(instance.imageObjAlt).to.equal(img3);
            });

            it("Not selected", function (): void {
              const instance = generateInstance();

              instance.setImages(img3, img4);

              expect(instance.imageObj).to.equal(img3);
              expect(instance.imageObjAlt).to.equal(img4);
            });
          });

          describe("Switch images", function (): void {
            it("Selected → not selected", function (): void {
              const instance = generateInstance();
              instance.selected = true;

              expect(instance.imageObj).to.equal(img1);
              expect(instance.imageObjAlt).to.equal(img2);
              instance.switchImages(false);
              expect(instance.imageObj).to.equal(img2);
              expect(instance.imageObjAlt).to.equal(img1);
              expect(instance.selected).to.equal(false);
            });

            it("Not selected → selected", function (): void {
              const instance = generateInstance();
              instance.selected = false;

              expect(instance.imageObj).to.equal(img1);
              expect(instance.imageObjAlt).to.equal(img2);
              instance.switchImages(true);
              expect(instance.imageObj).to.equal(img2);
              expect(instance.imageObjAlt).to.equal(img1);
              expect(instance.selected).to.equal(true);
            });

            it("Without alternative image", function (): void {
              const instance = generateInstance([img1]);
              instance.selected = false;

              expect(instance.imageObj).to.equal(img1);
              expect(instance.imageObjAlt).to.be.undefined;
              instance.switchImages(true);
              expect(instance.imageObj).to.equal(img1);
              expect(instance.imageObjAlt).to.be.undefined;
              expect(instance.selected).to.equal(true);
            });
          });
        }
      });
    }
  );
});
