const resolution = {
  core: {
    local: "http://localhost:3333/build/",
    remote: "https://unpkg.com/@midwest-design/core/dist/core/",
    css: "core.css",
  },
  forms: {
    local: "http://localhost:3334/build/",
    remote: "https://unpkg.com/@midwest-design/forms/dist/forms/",
  },
  audio: {
    local: "http://localhost:3336/build/",
    remote: "https://unpkg.com/@midwest-design/audio/dist/audio/",
  },
  device: {
    local: "http://localhost:3338/build/",
    remote: "https://unpkg.com/@midwest-design/device/dist/device/",
  },
  helpers: {
    local: "http://localhost:3337/build/",
    remote: "https://unpkg.com/@midwest-design/helpers/dist/helpers/",
  },
  media: {
    local: "http://localhost:3339/build/",
    remote: "https://unpkg.com/@midwest-design/media/dist/media/",
  },
  motion: {
    local: "http://localhost:3341/build/",
    remote: "https://unpkg.com/@midwest-design/motion/dist/motion/",
  },
};

const placeAssets = (local) => {
  Object.keys(resolution).forEach((package) => {
    const reference = resolution[package];
    const path = resolution[package][local ? "local" : "remote"];

    if (reference.css) {
      const styleTag = document.createElement("link");
      styleTag.rel = "stylesheet";
      styleTag.href = `${path}${reference.css}`;
      document.head.append(styleTag);
    }

    const es5 = document.createElement("script");
    es5.noModule = true;
    es5.src = `${path}${package}.js`;
    document.head.append(es5);

    const module = document.createElement("script");
    module.type = "module";
    module.src = `${path}${package}.esm.js`;
    document.head.append(module);
  });
};

if (window.location.href.includes("localhost:8080")) {
  fetch("http://localhost:3333")
    .then((response) => {
      placeAssets(response.ok);
    })
    .catch(() => {
      placeAssets(false);
    });
}