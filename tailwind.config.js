module.exports = {
  mode: 'jit',
  prefix: 'twb-',
  purge: [
    './src/**/*.liquid',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'dark-purple': '#6E4695',
        'brand-green': '#C7F0BD',
        'brand-black': '#323232',
        'brand-orange': '#FFAD05',
      },
      minHeight: (theme) => ({
        ...theme('spacing'),
      }),
      spacing: {
        '400': '100rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  variants: {
    lineClamp: ['hover']
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
