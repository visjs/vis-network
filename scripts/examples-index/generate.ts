import Pageres from "pageres";
import cheerio from "cheerio";
import childProcess from "child_process";
import crypto from "crypto";
import fs from "fs";
import globby from "globby";
import path from "path";
import prettier from "prettier";
import util from "util";
import yargs from "yargs";

yargs
  .usage("node -r ./babel.mocha.js generate-example-index.ts [options]")
  .hide("version")
  .help()

  .option("examples-directory", {
    alias: "d",
    default: "./examples",
    describe:
      "The directory where index.html and thumbnails will be written to and examples located.",
    type: "string"
  })
  .option("lint", {
    alias: "l",
    default: false,
    describe: "Lint examples.",
    type: "boolean"
  })
  .option("index", {
    alias: "i",
    default: false,
    describe: "Generate index file.",
    type: "boolean"
  })
  .option("screenshots", {
    alias: "s",
    default: false,
    describe: "Render screenshot thumbnails.",
    type: "boolean"
  })
  .option("container-id", {
    alias: "c",
    default: "vis-container",
    describe: "The id of the elements where Vis will put canvas.",
    type: "string"
  })
  .option("web-url", {
    alias: "w",
    demand: true,
    describe: "The URL of web presentation (for example GitHub Pages).",
    type: "string"
  })
  .option("screenshot-script", {
    alias: "S",
    demand: false,
    describe:
      "The path of JavaScript file that will be executed before taking a screenshot (and before any other JavaScript in the page).",
    type: "string"
  });

// Pageres uses quite a lot of listeners when invoked multiple times in
// parallel. This ensures there are no warnings about it.
process.setMaxListeners(40);

// Resolve paths before cd.
const screenshotScriptPath =
  typeof yargs.argv.screenshotScript === "string"
    ? path.resolve(yargs.argv.screenshotScript)
    : undefined;

// Set PWD. If omitted assumes it was executed in the root of the project.
const examplesRoot = yargs.argv.examplesDirectory as string;
process.chdir(examplesRoot);

type ExamplesRoot = {
  [Key: string]: Examples;
};
type Examples = {
  [Key: string]: Examples | Example;
};
type Example = {
  $: CheerioStatic;
  delay: number;
  html: string;
  path: string;
  selector: string;
  titles: string[];
};

function isExample(value: any): value is Example {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.path === "string"
  );
}

const collator = new Intl.Collator("US");
const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

const formatHTML = (html: string): string =>
  prettier.format(html, { filepath: "index.html" });
const formatJS = (js: string): string =>
  prettier.format(js, { filepath: "script.js" });
const formatCSS = (css: string): string =>
  prettier.format(css, { filepath: "style.css" });

function getMeta(page: CheerioStatic, name: string, fallback: number): number;
function getMeta(page: CheerioStatic, name: string, fallback: string): string;
function getMeta(
  page: CheerioStatic,
  name: string,
  fallback: number | string
): number | string {
  const content = page(`meta[name="${name}"]`).attr("content");

  if (typeof fallback === "number") {
    const nmContent = Number.parseFloat(content);
    return !Number.isNaN(nmContent) ? nmContent : fallback;
  } else {
    return content != null ? content : fallback;
  }
}

class ContentBuilder {
  private _root: Cheerio;
  private _screenshotTodo: Example[] = [];

  public constructor(
    private _examples: ExamplesRoot,
    private _projectPath: string,
    private _webURL: string,
    private _screenshotScript: string = ""
  ) {
    this._root = cheerio("<div>");
  }

  public build({ renderScreenshots }: { renderScreenshots?: boolean } = {}): {
    html: Promise<Cheerio>;
    screenshots: Promise<void>;
  } {
    const html = (async (): Promise<Cheerio> => {
      // Generate index page.
      for (const key of Object.keys(this._examples).sort(collator.compare)) {
        this._root.append(
          await this._processGroup(this._examples[key], key, 1)
        );
      }

      return this._root;
    })();

    const screenshots = renderScreenshots
      ? (async (): Promise<void> => {
          await html;

          // Generate screenshots.
          // There is quite long delay to ensure the chart is rendered properly
          // so it's much faster to run a lot of them at the same time.
          const total = this._screenshotTodo.length;
          let finished = 0;
          await Promise.all(
            new Array(6).fill(null).map(
              async (): Promise<void> => {
                while (this._screenshotTodo.length) {
                  const example = this._screenshotTodo.pop();

                  await this._generateScreenshot(example);

                  ++finished;
                  console.info(
                    `${("" + Math.floor((finished / total) * 100)).padStart(
                      3,
                      " "
                    )}% - ${example.path}`
                  );
                }
              }
            )
          );
        })()
      : Promise.resolve();

    return { html, screenshots };
  }

  private async _processGroup(
    examples: Examples,
    title: string,
    level: number
  ): Promise<Cheerio> {
    const heading = cheerio(`<h${Math.max(1, Math.min(6, level))}>`);
    heading.text(title);

    const list = cheerio("<div>");

    const section = cheerio("<div>");
    section.append(heading, list);

    for (const key of Object.keys(examples).sort(collator.compare)) {
      const example = examples[key];

      if (isExample(example)) {
        const header = cheerio("<div>").append(
          // Title
          cheerio("<a>")
            .attr("href", example.path)
            .text(key),
          // JSFiddle
          cheerio("<span>")
            .addClass("playgrounds")
            .append(
              this._generateJSFiddle(example),
              this._generateCodePen(example)
            )
        );

        const image = cheerio("<a>")
          .attr("href", example.path)
          .append(
            cheerio("<div>")
              .addClass("example-image")
              .append(
                cheerio("<img>")
                  .attr("src", this._pageToScreenshotPath(example.path))
                  .attr("alt", key)
              )
          );

        const item = cheerio("<span>")
          .addClass("example-link")
          .append(header, image);

        list.append(item);

        this._screenshotTodo.push(example);
      } else {
        section.append(await this._processGroup(example, key, level + 1));
      }
    }

    return section;
  }
  private _generatePlaygroundData(
    example: Example
  ): {
    code: {
      css: string;
      html: string;
      js: string;
    };
    resources: {
      css: string[];
      js: string[];
    };
  } {
    // JavaScript
    const eventListeners = (Object.entries(
      example.$("body").get(0).attribs
    ) as [string, string][])
      .filter(([name]): boolean => /^on/.test(name))
      .map(([name, value]): [string, string] => [name.slice(2), value])
      .map(
        ([name, value]): string =>
          `window.addEventListener("${name}", () => { ${value} });`
      )
      .join("\n");
    const js = formatJS(
      example
        .$("script")
        .map((_i, elem) => elem.children[0])
        .get()
        .map((elem): string => elem.data)
        .join("") +
        "\n\n;" +
        eventListeners
    );

    // Cascading Style Sheets
    const css = formatCSS(
      example
        .$("style")
        .map((_i, elem) => elem.children[0])
        .get()
        .map((elem): string => elem.data)
        .join("")
    );

    // Hypertext Markup Language
    const $html = cheerio.load(example.$("body").html());
    $html("script").remove();

    const html = formatHTML($html("body").html());

    // Resources
    const fixPath = (rawPath: string): string =>
      /^https?:\/\//.test(rawPath)
        ? rawPath
        : path
            .resolve(path.dirname(example.path) + path.sep + rawPath)
            .replace(this._projectPath, this._webURL);
    const resources = {
      js: example
        .$("script")
        .map((_i, elem): string => cheerio(elem).attr("src"))
        .get()
        .map(fixPath),
      css: example
        .$("link[rel='stylesheet']")
        .map((_i, elem): string => cheerio(elem).attr("href"))
        .get()
        .map(fixPath)
    };

    return {
      code: {
        css,
        html,
        js
      },
      resources
    };
  }
  private _generateJSFiddle(example: Example): Cheerio {
    const data = this._generatePlaygroundData(example);

    const form = cheerio("<form>");
    form.attr("action", "http://jsfiddle.net/api/post/library/pure/");
    form.attr("method", "post");
    form.attr("target", "_blank");
    form.append(
      cheerio("<button>")
        .addClass("icon jsfiddle")
        .attr("alt", "JSFiddle")
        .attr("title", "JSFiddle")
        .html("&nbsp;") // No break space helps align the icon better.
    );

    // JavaScript
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "js")
        .attr("value", data.code.js)
    );

    // Cascading Style Sheets
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "css")
        .attr("value", data.code.css)
    );

    // Hypertext Markup Language
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "html")
        .attr("value", data.code.html)
    );

    // Resources
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "resources")
        .attr("value", [...data.resources.css, ...data.resources.js].join(","))
    );

    // Don't run JS before the DOM is ready.
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "wrap")
        .attr("value", "b")
    );

    // Title
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "title")
        .attr("value", example.titles.join(" | "))
    );

    return form;
  }
  private _generateCodePen(example: Example): Cheerio {
    const data = this._generatePlaygroundData(example);

    const form = cheerio("<form>");
    form.attr("action", "https://codepen.io/pen/define");
    form.attr("method", "post");
    form.attr("target", "_blank");
    form.append(
      cheerio("<button>")
        .addClass("icon codepen")
        .attr("alt", "CodePen")
        .attr("title", "CodePen")
        .html("&nbsp;"), // No break space helps align the icon better.
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "data")
        .attr(
          "value",
          JSON.stringify({
            css: data.code.css,
            css_external: data.resources.css.join(";"),
            html: data.code.html,
            js: data.code.js,
            js_external: data.resources.js.join(";"),
            title: example.titles.join(" | ")
          })
        )
    );

    // JavaScript
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "js")
        .attr("value", data.code.js)
    );

    // Cascading Style Sheets
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "css")
        .attr("value", data.code.css)
    );

    // Hypertext Markup Language
    form.append(
      cheerio("<input>")
        .attr("type", "hidden")
        .attr("name", "html")
        .attr("value", data.code.html)
    );

    return form;
  }
  private async _generateScreenshot(example: Example): Promise<void> {
    const shotPath = this._pageToScreenshotPath(example.path);
    const size = 400;

    // Prepare the page. It has to be written to the disk so that files with
    // relative URLs can be loaded. Pageres' script can't be used here because
    // it runs after the existing scripts on the page and therefore doesn't
    // allow to modify things prior to their invocation.
    const tmpPath = path.join(
      path.dirname(example.path),
      ".tmp.example.screenshot." + path.basename(example.path)
    );
    const screenshotPage = cheerio.load(example.html);
    screenshotPage("head").prepend(
      cheerio("<script>")
        .attr("type", "text/javascript")
        .text(this._screenshotScript)
    );
    await writeFile(tmpPath, formatHTML(screenshotPage.html()));

    // Render the page and take the screenshot.
    await new Pageres({
      delay: example.delay,
      selector: example.selector,
      css: [
        `${example.selector} {`,
        "  border: none !important;",

        "  position: relative !important;",
        "  top: unset !important;",
        "  left: unset !important;",
        "  bottom: unset !important;",
        "  right: unset !important;",

        `  height: ${size}px !important;`,
        `  max-height: ${size}px !important;`,
        `  max-width: ${size}px !important;`,
        `  min-height: ${size}px !important;`,
        `  min-width: ${size}px !important;`,
        `  width: ${size}px !important;`,
        "}"
      ].join("\n"),
      filename: shotPath.replace(/^.*\/([^\/]*)\.png$/, "$1"),
      format: "png"
    })
      .src(tmpPath, ["1280x720"])
      .dest(shotPath.replace(/\/[^\/]*$/, ""))
      .run();

    // Remove the temporary file.
    await unlink(tmpPath);
  }
  private _pageToScreenshotPath(pagePath: string): string {
    return `./thumbnails/${crypto
      .createHash("sha256")
      .update(pagePath)
      .digest("hex")}.png`;
  }
}

const exampleLinter = {
  lint(path: string, page: CheerioStatic): boolean {
    let valid = true;
    const msgs = [`${path}:`];

    if (page("#title").length !== 1) {
      msgs.push("Missing #title element in the body.");
      valid = false;
    }

    if (page("#title > *").length < 2) {
      msgs.push(
        "There have to be at least two headings (group and example name)."
      );
      valid = false;
    }

    const headTitle = page("head > title")
      .text()
      .trim();
    const bodyTitle = page("#title > *")
      .map((_i, elem): string => cheerio(elem).text())
      .get()
      .join(" | ")
      .trim();
    if (headTitle !== bodyTitle) {
      msgs.push(
        "The title in the head doesn't match the title in the body.",
        `  head: ${headTitle}`,
        `  body: ${bodyTitle}`
      );
      valid = false;
    }

    if (msgs.length > 1) {
      console.warn("\n" + msgs.join("\n  "));
    }

    return valid;
  }
};

(async (): Promise<void> => {
  if (!yargs.argv.index && !yargs.argv.screenshots && !yargs.argv.lint) {
    yargs.parse("--help");
    return;
  }

  const examples: ExamplesRoot = {};
  const indexTemplate = readFile(
    path.join(__dirname, "index.template.html"),
    "utf-8"
  );
  const selector = "#" + yargs.argv.containerId;
  const stats = { examples: 0 };
  const skipped: string[] = [];

  await Promise.all(
    (await globby("**/*.html")).map(
      async (pagePath): Promise<any> => {
        const html = await readFile(pagePath, "utf-8");
        const $page = cheerio.load(html);
        const pageDelay = getMeta($page, "example-screenshot-delay", 5);
        const pageSelector = getMeta(
          $page,
          "example-screenshot-selector",
          selector
        );

        // Is this an examples?
        if ($page(pageSelector).length === 0) {
          skipped.push(pagePath);
          return;
        }

        if (yargs.argv.lint) {
          exampleLinter.lint(pagePath, $page);
        }

        // Body titles.
        let titles = $page("#title > *")
          .get()
          .map((elem): string =>
            $page(elem)
              .text()
              .trim()
          );

        // Head title fallback.
        if (titles.length < 2) {
          titles = $page("head > title")
            .text()
            .split("|")
            .map((title): string => title.trim());
        }

        // File path fallback.
        if (titles.length < 2) {
          titles = pagePath.split("/");
        }

        // Just ignore it.
        if (titles.length < 2) {
          console.error("Title resolution failed. Skipping.");
          return;
        }

        const example: Example = titles.reduce((acc, title): any => {
          while (acc[title] != null && acc[title].path != null) {
            console.error("The following category already exists: ", titles);
            title += "!";
          }
          return (acc[title] = acc[title] || {});
        }, examples);

        if (Object.keys(example).length) {
          console.error(
            "The following example has the same name as an already existing category: ",
            titles
          );
          return;
        }

        example.$ = $page;
        example.delay = pageDelay;
        example.html = html;
        example.path = pagePath;
        example.selector = pageSelector;
        example.titles = titles;

        ++stats.examples;
      }
    )
  );

  if (skipped.length) {
    process.stdout.write("\n");
    console.info(
      [
        "The following files don't look like examples (there is nothing to take a screenshot of):",
        ...skipped.sort()
      ].join("\n  ")
    );
  }

  if (stats.examples === 0) {
    console.info("No usable example files were found.");
  } else if (yargs.argv.index || yargs.argv.screenshots) {
    process.stdout.write("\n");

    // Get the project and web URL for JSFiddles.
    const projectPath = path.resolve(
      (await exec("npm prefix")).stdout.slice(0, -1)
    );
    const webURL = yargs.argv["web-url"] as string;
    const screenshotScript =
      screenshotScriptPath != null
        ? await readFile(screenshotScriptPath, "utf-8")
        : undefined;

    const builtData = new ContentBuilder(
      examples,
      projectPath,
      webURL,
      screenshotScript
    ).build({
      renderScreenshots: yargs.argv.screenshots as boolean
    });

    // Create and write the page.
    if (yargs.argv.index) {
      const page = cheerio.load(await indexTemplate);
      page("body").append(await builtData.html);
      await writeFile("./index.html", formatHTML(page.html()));
      console.info(`Index file with ${stats.examples} example(s) was written.`);
    }

    // Create and write the screenshots.
    if (yargs.argv.screenshots) {
      await builtData.screenshots;
      console.info("All screenshot files were written.");
    }
  }
})();
