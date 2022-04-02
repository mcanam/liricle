import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.js",
    output: [
        {
            file: "dist/liricle.js",
            format: "umd",
            name: "Liricle"
        },
        {
            file: "dist/liricle.min.js",
            format: "umd",
            name: "Liricle",
            plugins: [
                terser({
                    toplevel: true,
                    output: { comments: false }
                })
            ]
        }
    ]
}