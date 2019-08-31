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
    shapeProperties: {}
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

  const img0 = deepFreeze({});
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
  const img3 = deepFreeze({
    src: "img3.svg",
    width: 393,
    height: 312
  });
  const img4 = deepFreeze({
    src: "img4.png",
    width: 408,
    height: 494
  });
  [
    { name: "Box", Clazz: Box, distanceToBorder: 42 },
    { name: "Circle", Clazz: Circle, distanceToBorder: 125 },
    {
      name: "CircularImage (not loaded)",
      Clazz: CircularImage,
      args: [img0],
      distanceToBorder: 31
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
      distanceToBorder: 54
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
      distanceToBorder: 96
    },
    { name: "Database", Clazz: Database, distanceToBorder: 180 },
    { name: "Diamond", Clazz: Diamond, distanceToBorder: 50 },
    { name: "Dot", Clazz: Dot, distanceToBorder: 31 },
    { name: "Ellipse", Clazz: Ellipse, distanceToBorder: 46 },
    { name: "Hexagon", Clazz: Hexagon, distanceToBorder: 50 },
    { name: "Icon", Clazz: Icon, distanceToBorder: 39 },
    {
      name: "Image (not loaded)",
      Clazz: Image,
      args: [img0],
      distanceToBorder: 50
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
      distanceToBorder: 52
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
      distanceToBorder: 87
    },
    { name: "Square", Clazz: Square, distanceToBorder: 50 },
    { name: "Star", Clazz: Star, distanceToBorder: 50 },
    { name: "Text", Clazz: Text, distanceToBorder: 42 },
    { name: "Triangle", Clazz: Triangle, distanceToBorder: 50 },
    { name: "TriangleDown", Clazz: TriangleDown, distanceToBorder: 50 }
  ].forEach(
    ({ name, Clazz, args, img, editOptions, distanceToBorder }): void => {
      describe(name, function(): void {
        const generateInstance = (overrideArgs?: unknown[]): typeof Clazz =>
          new Clazz(
            editOptions ? editOptions(generateOptions()) : generateOptions(),
            generateBody(),
            generateLabelModule(),
            ...(overrideArgs || args || [])
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
              "Nothing should be configured if the shadow isn't enabled."
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
              "Nothing should be configured if the shadow isn't enabled."
            ).to.deep.equal({});
          });
        });

        describe("Dashes", function(): void {
          it("Enable default", function(): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy()
            };

            instance.enableBorderDashes(ctx, {
              borderDashes: true
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [5, 15]);
          });

          it("Enable custom", function(): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy()
            };

            instance.enableBorderDashes(ctx, {
              borderDashes: [1, 2, 3, 4]
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [1, 2, 3, 4]);
          });

          it("Enable disabled", function(): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy()
            };

            instance.enableBorderDashes(ctx, {
              borderDashes: false
            });

            assert.notCalled(ctx.setLineDash);
          });

          it("Disable default", function(): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy()
            };

            instance.disableBorderDashes(ctx, {
              borderDashes: true
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [0]);
          });

          it("Disable custom", function(): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy()
            };

            instance.disableBorderDashes(ctx, {
              borderDashes: [1, 2, 3, 4]
            });

            assert.calledOnce(ctx.setLineDash);
            assert.alwaysCalledWithExactly(ctx.setLineDash, [0]);
          });

          it("Disable disabled", function(): void {
            const instance = generateInstance();
            const ctx = {
              setLineDash: spy()
            };

            instance.disableBorderDashes(ctx, {
              borderDashes: false
            });

            assert.notCalled(ctx.setLineDash);
          });
        });

        if (img) {
          describe("Set images", function(): void {
            it("Selected", function(): void {
              const instance = generateInstance();
              instance.selected = true;

              instance.setImages(img3, img4);

              expect(instance.imageObj).to.equal(img4);
              expect(instance.imageObjAlt).to.equal(img3);
            });

            it("Not selected", function(): void {
              const instance = generateInstance();

              instance.setImages(img3, img4);

              expect(instance.imageObj).to.equal(img3);
              expect(instance.imageObjAlt).to.equal(img4);
            });
          });

          describe("Switch images", function(): void {
            it("Selected → not selected", function(): void {
              const instance = generateInstance();
              instance.selected = true;

              expect(instance.imageObj).to.equal(img1);
              expect(instance.imageObjAlt).to.equal(img2);
              instance.switchImages(false);
              expect(instance.imageObj).to.equal(img2);
              expect(instance.imageObjAlt).to.equal(img1);
              expect(instance.selected).to.equal(false);
            });

            it("Not selected → selected", function(): void {
              const instance = generateInstance();
              instance.selected = false;

              expect(instance.imageObj).to.equal(img1);
              expect(instance.imageObjAlt).to.equal(img2);
              instance.switchImages(true);
              expect(instance.imageObj).to.equal(img2);
              expect(instance.imageObjAlt).to.equal(img1);
              expect(instance.selected).to.equal(true);
            });

            it("Without alternative image", function(): void {
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
