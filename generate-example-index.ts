import Pageres from "pageres";
import cheerio from "cheerio";
import crypto from "crypto";
import fs from "fs";
import globby from "globby";
import prettier from "prettier";
import util from "util";
import yargs from "yargs";

yargs
  .usage("node -r ./babel.mocha.js generate-example-index.ts [options]")
  .hide("version")
  .help()
  .string("examples-directory")
  .describe(
    "examples-directory",
    "The directory where index.html and thumbnails will be written to and examples located."
  )
  .alias("examples-directory", "d")
  .default("examples-directory", "./examples")
  .boolean("lint")
  .describe("lint", "Lint examples.")
  .alias("lint", "l")
  .default("lint", false)
  .boolean("index")
  .describe("index", "Generate index file.")
  .alias("index", "i")
  .default("index", false)
  .boolean("screenshots")
  .describe("screenshots", "Render screenshot thumbnails.")
  .alias("screenshots", "s")
  .default("screenshots", false)
  .string("container-id")
  .describe("container-id", "The id of the elements where Vis will put canvas.")
  .alias("container-id", "c")
  .default("container-id", "vis-container");

// Pageres uses quite a lot of listeners when invoked multiple times in
// parallel. This ensures there are no warnings about it.
process.setMaxListeners(40);

// Set PWD. If omitted assumes it was executed in the root of the project.
const examplesRoot = yargs.argv.examplesDirectory as string;
process.chdir(examplesRoot);

type ExamplesRoot = {
  [Key: string]: Examples;
};
type Examples = {
  [Key: string]: Examples | Example;
};
type Example = { path: string; delay: number; selector: string };

function isExample(value: any): value is Example {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.path === "string"
  );
}

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const collator = new Intl.Collator("US");

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
  private _screenshotTodo: {
    pagePath: string;
    selector: string;
    delay: number;
  }[] = [];

  public constructor(private _examples: ExamplesRoot) {
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
          // There is quite long delay to ensure the network is rendered properly
          // so it's much faster to run a lot of them at the same time.
          const total = this._screenshotTodo.length;
          let finished = 0;
          await Promise.all(
            new Array(6).fill(null).map(
              async (): Promise<void> => {
                while (this._screenshotTodo.length) {
                  const {
                    pagePath,
                    selector,
                    delay
                  } = this._screenshotTodo.pop();

                  await this._generateScreenshot(pagePath, selector, delay);

                  ++finished;
                  console.info(
                    `${("" + Math.floor((finished / total) * 100)).padStart(
                      3,
                      " "
                    )}% - ${pagePath}`
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

    const section = cheerio("<section>");
    section.append(heading, list);

    for (const key of Object.keys(examples).sort(collator.compare)) {
      const example = examples[key];

      if (isExample(example)) {
        const link = cheerio("<div>");
        link.text(key);

        const image = cheerio("<img>");
        image.attr("src", this._pageToScreenshotPath(example.path));
        image.attr("alt", key);

        const imageContainer = cheerio("<div>");
        imageContainer.addClass("example-image");
        imageContainer.append(image);

        const item = cheerio("<a>");
        item.addClass("example-link");
        item.attr("href", example.path);
        item.append(link, imageContainer);

        list.append(item);

        this._screenshotTodo.push({
          pagePath: example.path,
          selector: example.selector,
          delay: example.delay
        });
      } else {
        section.append(await this._processGroup(example, key, level + 1));
      }
    }

    return section;
  }
  private async _generateScreenshot(
    pagePath: string,
    selector: string,
    delay: number
  ): Promise<void> {
    const shotPath = this._pageToScreenshotPath(pagePath);
    const size = 400;

    await new Pageres({
      delay,
      selector,
      css: [
        `${selector} {`,
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
      .src(pagePath, ["1280x720"])
      .dest(shotPath.replace(/\/[^\/]*$/, ""))
      .run();
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
  const indexTemplate = readFile("../examples.template.html", "utf-8");
  const selector = "#" + yargs.argv.containerId;
  const stats = { examples: 0 };
  const skipped: string[] = [];

  await Promise.all(
    (await globby("**/*.html")).map(
      async (pagePath): Promise<any> => {
        const page = cheerio.load(await readFile(pagePath, "utf-8"));
        const pageDelay = getMeta(page, "example-screenshot-delay", 5);
        const pageSelector = getMeta(
          page,
          "example-screenshot-selector",
          selector
        );

        // Is this an examples?
        if (page(pageSelector).length === 0) {
          skipped.push(pagePath);
          return;
        }

        if (yargs.argv.lint) {
          exampleLinter.lint(pagePath, page);
        }

        // Body titles.
        let titles = page("#title > *")
          .get()
          .map((elem): string =>
            page(elem)
              .text()
              .trim()
          );

        // Head title fallback.
        if (titles.length < 2) {
          titles = page("head > title")
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

        const group: Example = titles.reduce((acc, title): any => {
          while (acc[title] != null && acc[title].path != null) {
            console.error("The following category already exists: ", titles);
            title += "!";
          }
          return (acc[title] = acc[title] || {});
        }, examples);

        if (Object.keys(group).length) {
          console.error(
            "The following example has the same name as an already existing category: ",
            titles
          );
          return;
        }

        group.path = pagePath;
        group.delay = pageDelay;
        group.selector = pageSelector;

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

    const builtData = new ContentBuilder(examples).build({
      renderScreenshots: yargs.argv.screenshots as boolean
    });

    // Create and write the page.
    if (yargs.argv.index) {
      const page = cheerio.load(await indexTemplate);
      page("body").append(await builtData.html);
      await writeFile(
        "./index.html",
        prettier.format(page.html(), { filepath: "index.html" })
      );
      console.info(`Index file with ${stats.examples} example(s) was written.`);
    }

    // Create and write the screenshots.
    if (yargs.argv.screenshots) {
      await builtData.screenshots;
      console.info("All screenshot files were written.");
    }
  }
})();
