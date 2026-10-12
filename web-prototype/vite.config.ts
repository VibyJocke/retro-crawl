import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    modulePreload: { polyfill: false },
    rollupOptions: {
      plugins: [
        {
          name: "file-protocol-output",
          generateBundle(_options, bundle) {
            const html = bundle["index.html"];
            if (!html || html.type !== "asset" || typeof html.source !== "string") {
              throw new Error("Expected Vite to emit index.html as a text asset.");
            }

            const withClassicScript = html.source.replace(
              /<script type="module" crossorigin src="([^"]+)"><\/script>/,
              '<script defer src="$1"></script>',
            );
            if (withClassicScript === html.source) {
              throw new Error("Could not find the generated module script in index.html.");
            }

            html.source = withClassicScript.replace(
              /(<link rel="stylesheet") crossorigin/,
              "$1",
            );
          },
        },
      ],
    },
  },
});
