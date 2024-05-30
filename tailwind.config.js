import flowbite from 'flowbite-react/tailwind'

/** @type {import('tailwindcss').Config} */
export const content = [
  './src/renderer/index.html',
  './src/renderer/src/**/*.{js,ts,jsx,tsx}',
  flowbite.content()
]
export const theme = {
  extend: {}
}
export const plugins = [flowbite.plugin()]
