const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const customCodeContainer = require("markdown-it-container");
const pluginTOC = require("eleventy-plugin-toc");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("manifest.json");
  eleventyConfig.addPassthroughCopy("resume.pdf");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("assets/img");
  eleventyConfig.addPassthroughCopy("assets/vector");
  eleventyConfig.addPassthroughCopy("assets/video");

  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(pluginTOC);

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Alias `layout: portfolio` to `layout: layouts/portfolio.njk`
  eleventyConfig.addLayoutAlias("portfolio", "layouts/portfolio.njk");

  eleventyConfig.addFilter("isEnvironment", (env) => {
    return process.env.VERCEL_ENV === env;
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(
      (tag) => ["all", "nav", "portfolio", "portfolios"].indexOf(tag) === -1
    );
  }

  eleventyConfig.addFilter("filterTagList", filterTagList);

  function filterHighlighted(posts) {
    return (posts || []).filter((post) => !!post.data.highlight);
  }
  eleventyConfig.addFilter("filterHighlighted", filterHighlighted);

  function tagColor(tag) {
    if (tag === "design") {
      return "blue";
    }
    if (tag === "data") {
      return "teal";
    }
    if (tag === "engineering") {
      return "indigo";
    }
    if (tag === "strategy") {
      return "violet";
    }

    return "theme";
  }
  eleventyConfig.addFilter("tagColor", tagColor);

  function elementFileNames(elements, esmBrowser) {
    let files = [];

    if (elements) {
      elements.forEach((element) => {
        const collectionBundles = esmBrowser.filter((esmB) =>
          esmB.components.includes(element)
        );

        collectionBundles.forEach((bundle) => {
          files = [...files, bundle.fileName, ...bundle.imports];
        });
      });
    }

    // Ensure all queued files are unique.
    files = [...new Set(files)];

    return files;
  }
  eleventyConfig.addFilter("elementFileNames", elementFileNames);

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    quotes: "“”‘’",
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "direct-link",
        symbol: "#",
        level: [1, 2, 3, 4],
      }),
      slugify: eleventyConfig.getFilter("slug"),
    })
    .use(customCodeContainer, "vimeo", {
      validate: function (params) {
        return params.trim().match(/^vimeo\s+(.*)$/);
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^vimeo\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          var raw = m[1].match(/\(([^)]+)\)/).pop();
          args = raw.split(",");
          video_id = args[0];
          classlist = args[1].replaceAll('"', "").trim();

          // opening tag
          return `<div class="embed-container ${classlist}">
              <iframe
                src="https://player.vimeo.com/video/${video_id}"
                frameborder="0"
                webkitAllowFullScreen
                mozallowfullscreen
                allowFullScreen
              ></iframe></div>`;
        } else {
          // closing tag
          return ``;
        }
      },
    })
    .use(customCodeContainer, "youtube", {
      validate: function (params) {
        return params.trim().match(/^youtube\s+(.*)$/);
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^youtube\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          var raw = m[1].match(/\(([^)]+)\)/).pop();
          args = raw.split(",");
          video_id = args[0];
          classlist = args[1].replaceAll('"', "").trim();

          // opening tag
          return `<div class="${classlist}">
            <div class="embed-container">
              <iframe src='https://www.youtube.com/embed/${video_id}' frameborder='0' allowfullscreen></iframe>
            </div>
            ${markdownLibrary.utils.escapeHtml(m[1].replace(m[1], ""))}
          </div>
          `;
        } else {
          // closing tag
          return ``;
        }
      },
    })
    .use(customCodeContainer, "sketchfab", {
      validate: function (params) {
        return params.trim().match(/^sketchfab\s+(.*)$/);
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^sketchfab\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          var raw = m[1].match(/\(([^)]+)\)/).pop();
          args = raw.split(",");
          video_id = args[0];
          classlist = args[1].replaceAll('"', "").trim();

          // opening tag
          return `<div class="embed-container ${classlist}">
              <iframe allow="autoplay; fullscreen; vr" mozallowfullscreen="true" src="https://sketchfab.com/models/b4cc07f5b9b94113be38d809669a2749/embed?autostart=1&amp;wmode=opaque" width="100%" data-embed="true" webkitallowfullscreen="true" frameborder="0" height="480"></iframe>
              </div>
              ${markdownLibrary.utils.escapeHtml(m[1].replace(m[1], ""))}`;
        } else {
          // closing tag
          return ``;
        }
      },
    })
    .use(customCodeContainer, "image", {
      validate: function (params) {
        return params.trim().match(/^image\s+(.*)$/);
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^image\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          var raw = m[1].match(/\(([^)]+)\)/).pop();
          args = raw.split(",");
          image_name = args[0].replaceAll('"', "").trim();
          image_path = args[1].replaceAll('"', "").trim();
          width = args[2].trim();
          height = args[3].trim();
          classlist = args[4].replaceAll('"', "").trim();
          styles = args[5]?.replaceAll('"', "")?.trim() ?? "";
          image_src = `/assets/img/${image_path}/${image_name}`;
          image_thumb = `/assets/img/${image_path}/${image_name}-thumb`;
          image_mobile = `/assets/img/${image_path}/${image_name}-mobile`;

          // opening tag
          return `<div class="relative group ${classlist}" style="${styles}">
            <midwest-image width="${width}" height="${height}" preload="${image_thumb}.jpg">
              <source srcset="${image_src}.jpg" type="image/jpeg" media="(min-width:1023px) and (min-device-pixel-ratio: 2)" />
              <source srcset="${image_src}.webp" type="image/webp" media="(min-width:1023px) and (min-device-pixel-ratio: 2)" />
              <source srcset="${image_mobile}.jpg" type="image/jpeg" media="(min-width:1023px)" />
              <source srcset="${image_mobile}.webp" type="image/webp" media="(min-width:1023px)" />
              <source srcset="${image_src}.jpg" type="image/jpeg" media="(max-width:640px) and (min-device-pixel-ratio: 2)" />
              <source srcset="${image_src}.webp" type="image/webp" media="(max-width:640px) and (min-device-pixel-ratio: 2)" />
              <source srcset="${image_mobile}.jpg" type="image/jpeg" media="(max-width:640px)" />
              <source srcset="${image_mobile}.webp" type="image/webp" media="(max-width:640px)" />
            </midwest-image>

            <div class="absolute bottom-0 left-0 text-xs leading-tight pointer-events-none p-2 bg-white dm:bg-black dm:text-white transition-opacity group-hover:opacity-100 opacity-0 empty:hidden">`;
        } else {
          // closing tag
          return `</div></div>`;
        }
      },
    })
    .use(customCodeContainer, "code", {
      validate: function (params) {
        return params.trim().match(/^code\s+(.*)$/);
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^code\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          var language = m[1].match(/\(([^)]+)\)/).pop();
          // opening tag
          return (
            "<midwest-code class='mt-8' preview='" +
            (language === "html" ? "true" : "false") +
            "' language='" +
            language +
            "' feature><h4 slot='feature'>" +
            m[1] +
            "</h4><template>" +
            markdownLibrary.utils.escapeHtml(m[1].replace(m[1], ""))
          );
        } else {
          // closing tag
          return "</template></midwest-code>\n";
        }
      },
    });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync("_site/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // Opt-out of pre-processing global data JSON files: (default: `liquid`)
    dataTemplateEngine: false,

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
