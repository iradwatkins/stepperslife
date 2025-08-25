import type { Config } from "tailwindcss";
const plugin = require("tailwindcss/plugin");

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundImage: ({ theme }) => ({
  			'gradient-fuchsia': `linear-gradient(310deg, ${theme('colors.purple.700' as any)}, ${theme('colors.pink.500' as any)})`,
  			'gradient-cyan': `linear-gradient(310deg, ${theme('colors.blue.600' as any)}, ${theme('colors.cyan.400' as any)})`,
  			'gradient-orange': `linear-gradient(310deg, ${theme('colors.red.500' as any)}, ${theme('colors.yellow.400' as any)})`,
  			'gradient-red': `linear-gradient(310deg, ${theme('colors.red.600' as any)}, ${theme('colors.rose.400' as any)})`,
  			'gradient-lime': `linear-gradient(310deg, ${theme('colors.green.600' as any)}, ${theme('colors.lime.400' as any)})`,
  			'gradient-slate': `linear-gradient(310deg, ${theme('colors.slate.600' as any)}, ${theme('colors.slate.300' as any)})`,
  			'gradient-dark-gray': `linear-gradient(310deg, ${theme('colors.gray.900' as any)}, ${theme('colors.slate.800' as any)})`,
  			'gradient-primary': 'linear-gradient(310deg, hsl(var(--primary)), hsl(var(--secondary)))',
  		}),
  		boxShadow: {
  			'soft-xxs': '0 1px 5px 1px #ddd',
  			'soft-xs': '0 3px 5px -1px rgba(0,0,0,.09),0 2px 3px -1px rgba(0,0,0,.07)',
  			'soft-sm': '0 .25rem .375rem -.0625rem hsla(0,0%,8%,.12),0 .125rem .25rem -.0625rem hsla(0,0%,8%,.07)',
  			'soft-md': '0 4px 7px -1px rgba(0,0,0,.11),0 2px 4px -1px rgba(0,0,0,.07)',
  			'soft-lg': '0 2px 12px 0 rgba(0,0,0,.16)',
  			'soft-xl': '0 20px 27px 0 rgba(0,0,0,0.05)',
  			'soft-2xl': '0 .3125rem .625rem 0 rgba(0,0,0,.12)',
  			'soft-3xl': '0 8px 26px -4px hsla(0,0%,8%,.15),0 8px 9px -5px hsla(0,0%,8%,.06)',
  		}
  	}
  },
  plugins: [
  	require("tailwindcss-animate"),
  	plugin(function ({ addUtilities }) {
  		addUtilities({
  			'.transform3d': {
  				transform: 'perspective(999px) rotateX(0deg) translateZ(0)',
  			},
  			'.transform3d-hover': {
  				transform: 'perspective(999px) rotateX(7deg) translate3d(0,-4px,5px)',
  			},
  			'.ease-soft-in-out': {
  				'transition-timing-function': 'cubic-bezier(0.42, 0, 0.58, 1)',
  			},
  		});
  	}),
  ],
} satisfies Config;
