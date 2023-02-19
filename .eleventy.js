const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const customCodeContainer = require("markdown-it-container");
const pluginTOC = require("eleventy-plugin-toc");
const Image = require("@11ty/eleventy-img");

function imageShortcode(
  src,
  attrs = {},
  options = {
    widths: ["auto", 750, 75],
    urlPath: "./assets/img/",
    outputDir: "./_site/assets/img/",
    formats: ["webp", "jpeg"],
  }
) {
  try {
    Image(src, options);

    const metadata = Image.statsSync(src, options);

    const webp_m = metadata["webp"][1];
    const webp_t = metadata["webp"][0];
    const webp_src = metadata["webp"][2];

    const jpg_m = metadata["jpeg"][1];
    const jpg_src = metadata["jpeg"][metadata["jpeg"].length - 1];

    const image_base = `/assets/img`;

    const captionClasses =
      "absolute bottom-0 left-0 text-xs leading-tight pointer-events-none p-2 bg-white dm:bg-black dm:text-white transition-opacity group-hover:opacity-100 opacity-0 empty:hidden";

    const caption = attrs.alt ? `<figcaption>${attrs.alt}</figcaption>` : "";

    return `<figure class="relative group ${attrs.title} ${attrs.class}">
      <midwest-image
      width="${jpg_src?.width * 2 || "ERR"}"
      height="${jpg_src?.height * 2 || "ERR"}"
      ${attrs?.nozoom ? "nozoom" : ""}
      ${attrs?.block ? "block" : ""}
      class="${attrs.class} h-full"
      style="${attrs.style}"
    
      preload="${image_base}/${webp_t?.filename || "ERR"}">
        <source
          srcset="${image_base}/${jpg_src?.filename || "ERR"}" 
          type="image/jpeg" 
          media="(min-width:1023px)" 
        />
        <source
          srcset="${image_base}/${webp_src?.filename || "ERR"}" 
          type="image/webp" 
          media="(min-width:1023px)" 
        />
        <source
          srcset="${image_base}/${jpg_m?.filename || "ERR"}" 
          type="image/jpeg" 
          media="(max-width:1023px)" 
        />
        <source
          srcset="${image_base}/${webp_m?.filename || "ERR"}" 
          type="image/webp" 
          media="(max-width:1023px)" 
        />
        <source
          srcset="${image_base}/${jpg_src?.filename || "ERR"}" 
          type="image/jpeg" 
          media="(max-width:640px) and (min-device-pixel-ratio: 2)" 
        />
        <source
          srcset="${image_base}/${webp_src?.filename || "ERR"}" 
          type="image/webp" 
          media="(max-width:640px) and (min-device-pixel-ratio: 2)" 
        />
        <source
          srcset="${image_base}/${jpg_m?.filename || "ERR"}" 
          type="image/jpeg" 
          media="(max-width:640px)" 
        />
        <source
          srcset="${image_base}/${webp_m?.filename || "ERR"}" 
          type="image/webp" 
          media="(max-width:640px)" 
        />
      </midwest-image>

      <figcaption>
        <copy-wrap class="${captionClasses}">${caption}</copy-wrap>
      </figcaption>
    </figure>`;
  } catch (e) {
    return "";
  }
}

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

  eleventyConfig.addFilter(
    "getCollectionItemsBySlug",
    (collection, slugArray = []) => {
      function fileSlugInSlugArray(item) {
        return slugArray.includes(item.fileSlug);
      }

      return collection.filter(fileSlugInSlugArray);
    }
  );

  eleventyConfig.addShortcode("image_shortcode", imageShortcode);

  // Return all the types used in a collection
  eleventyConfig.addFilter("getAllTypes", (collection) => {
    let typeSet = new Set();
    for (let item of collection) {
      (item.data.types || []).forEach((type) => typeSet.add(type));
    }
    return Array.from(typeSet);
  });

  // Return all the skills used in a collection
  eleventyConfig.addFilter("getAllSkills", (collection) => {
    let skillSet = new Set();
    for (let item of collection) {
      (item.data.skills || []).forEach((skill) => skillSet.add(skill));
    }
    return Array.from(skillSet);
  });
  // Return all the roles used in a collection
  eleventyConfig.addFilter("getAllRoles", (collection) => {
    let roleSet = new Set();
    for (let item of collection) {
      (item.data.roles || []).forEach((role) => roleSet.add(role));
    }
    return Array.from(roleSet);
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
    .use(customCodeContainer, "instagram", {
      validate: function (params) {
        return params.trim().match(/^instagram\s+(.*)$/);
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^instagram\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          var raw = m[1].match(/\(([^)]+)\)/).pop();
          args = raw.split(",");
          video_id = args[0];
          classlist = args[1].replaceAll('"', "").trim();

          // opening tag
          return `<div class="embed-container ${classlist}">
          <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/tv/${video_id}/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/tv/${video_id}/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/tv/${video_id}/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">See this post on instagram</a></p></div></blockquote></div>`;
        } else {
          // closing tag
          return ``;
        }
      },
    })
    .use(markdownItEleventyImg, {
      imgOptions: {
        widths: ["auto", 750, 75],
        urlPath: "/assets/img/",
        outputDir: "./_site/assets/img/",
        formats: ["webp", "jpeg"],
      },
      renderImage(image, attributes) {
        const [_Image, options] = image;
        const [src, attrs] = attributes;

        return imageShortcode(src, attrs, options);
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
