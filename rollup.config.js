import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const header = `
/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 * ${pkg.license} license by ${pkg.author}
 */
`;

const config = properties => {
      return {
            format: "umd",
            banner: header,
            name: "Liricle",
            ...properties
      };
};

export default {
      input: "src/liricle.js",
      output: [
            config({
                  file: "dist/liricle.js"
            }),
            config({
                  file: "dist/liricle.min.js",
                  sourcemap: true,
                  plugins: [terser()]
            })
      ]
};
