import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const header = `
/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 * ${pkg.license} license by ${pkg.author}
 */
`;

export default [
      {
            input: 'src/liricle.ts',
            output: {
                  file: 'dist/liricle.js',
                  format: 'umd',
                  banner: header,
                  name: 'Liricle',
                  sourcemap: true
            },
            plugins: [
                  typescript({ 
                        compilerOptions: { 
                              declaration: true,
                              declarationDir: './types'
                        }
                  }),
                  terser()
            ]
      },
      {
            input: 'src/liricle.ts',
            output: {
                  file: 'dist/esm/liricle.mjs',
                  format: 'esm',
                  banner: header,
                  sourcemap: true
            },
            plugins: [typescript()]
      },
      {
            input: 'src/liricle.ts',
            output: {
                  file: 'dist/cjs/liricle.cjs',
                  format: 'cjs',
                  banner: header,
                  sourcemap: true
            },
            plugins: [typescript()]
      },
      {
            input: 'dist/types/liricle.d.ts',
            output: {
                  file: 'dist/liricle.d.ts',
                  format: 'esm'
            },
            plugins: [dts()]
      }
];
