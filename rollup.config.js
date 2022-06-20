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

export default {
    input: "src/liricle.js",
    output: [
        {
            file: "dist/liricle.js",
            format: "umd",
            banner: header,
            name: "Liricle"
        },
        {
            file: "dist/liricle.min.js",
            format: "umd",
            banner: header,
            name: "Liricle",
            plugins: [
                terser({ toplevel: true })
            ]
        }
    ]
}
