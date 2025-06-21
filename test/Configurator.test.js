import { expect } from "chai";

import { canvasMockify } from "./canvas-mock.js";
import { Configurator } from "vis-util/esnext";
import Network from "../lib/network/Network.js";
import { configureOptions } from "../lib/network/options.ts";

describe("Configurator", function () {
  beforeEach(function () {
    this.jsdomGlobalCleanup = canvasMockify(
      "<div id='mynetwork'></div><div id='other'></div>",
    );
    this.container = document.getElementById("mynetwork");
  });

  afterEach(function () {
    this.jsdomGlobalCleanup();
    this.container.remove();
    this.container = undefined;
  });

  describe("constructor", function () {
    it("sets extends options with default options", function () {
      const config = new Configurator();
      expect(config.options).to.deep.equal(config.defaultOptions);
    });
  });

  describe("setOptions", function () {
    it("with undefined will not modify defaults", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions();
      expect(config.options).to.deep.equal(config.defaultOptions);
    });

    it("with undefined will set enabled to false", function () {
      const config = new Configurator(Network, this.container);
      config.options.enabled = false;
      config.setOptions();
      expect(config.options.enabled).to.equal(false);
    });

    it("with string sets filter and set enabled to true", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions("stringFilter!");
      expect(config.options.filter).to.equal("stringFilter!");
      expect(config.options.enabled).to.equal(true);
    });

    it("with array sets filter and set enabled to true", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions(["array", "Filter", "!"]);
      expect(config.options.filter).to.equal("array,Filter,!");
      expect(config.options.enabled).to.equal(true);
    });

    it("with object sets filter", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions({
        container: "newContainer",
        filter: "newFilter",
        showButton: "newShowButton",
        enabled: false,
      });
      expect(config.options.container).to.equal("newContainer");
      expect(config.options.filter).to.equal("newFilter");
      expect(config.options.showButton).to.equal("newShowButton");
      expect(config.options.enabled).to.equal(false);
    });

    it("with object and filter is false enabled will be false", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions({ filter: false });
      expect(config.options.enabled).to.equal(false);
    });

    it("with boolean true sets filter", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions(true);
      expect(config.options.enabled).to.equal(true);
    });

    it("with boolean false sets filter", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions(false);
      expect(config.options.enabled).to.equal(false);
    });

    it("with function sets filter", function () {
      const config = new Configurator(Network, this.container);
      config.setOptions(function () {});
      expect(config.options.enabled).to.equal(true);
    });

    it("with null raises exception", function () {
      const config = new Configurator(Network, this.container);
      expect(function () {
        config.setOptions(null);
      }).to.throw(TypeError);
    });
  });

  describe("setModuleOptions", function () {
    it("creates no new dom elements if enabled is false", function () {
      const config = new Configurator(Network, this.container);
      config.setModuleOptions();
      expect(this.container.children.length).to.equal(0);
    });

    it("adds div with vis-configuration-wrapper class when enabled", function () {
      const config = new Configurator(Network, this.container);
      config.options.enabled = true;
      config.setModuleOptions();
      expect(this.container.children.length).to.equal(1);
      expect(this.container.children[0].className).to.equal(
        "vis-configuration-wrapper",
      );
    });

    it("overwrites config.container with config.options.container", function () {
      const config = new Configurator(Network, this.container);
      config.options.enabled = true;
      config.options.container = document.getElementById("other");
      config.setModuleOptions();
      expect(config.container).to.equal(config.options.container);
      expect(config.container.children[0].className).to.equal(
        "vis-configuration-wrapper",
      );
    });
  });

  // TODO: This test needs work
  describe("getOptions", function () {
    xit("creates no new dom elements if enabled is false", function () {
      const config = new Configurator(
        Network,
        this.container,
        configureOptions,
      );
      config.getOptions();
    });
  });
});
