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
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			success: {
  				DEFAULT: 'var(--success)',
  				foreground: 'var(--success-foreground)'
  			},
  			info: {
  				DEFAULT: 'var(--info)',
  				foreground: 'var(--info-foreground)'
  			},
  			warning: {
  				DEFAULT: 'var(--warning)',
  				foreground: 'var(--warning-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(310deg, var(--primary), var(--secondary))',
  			'gradient-accent': 'linear-gradient(310deg, var(--primary), var(--accent))',
  			'gradient-success': 'linear-gradient(310deg, var(--success), var(--chart-2))',
  			'gradient-warning': 'linear-gradient(310deg, var(--warning), var(--chart-3))',
  			'gradient-danger': 'linear-gradient(310deg, var(--destructive), var(--chart-5))',
  			'gradient-info': 'linear-gradient(310deg, var(--info), var(--primary))',
  			'gradient-muted': 'linear-gradient(310deg, var(--muted), var(--border))',
  			'gradient-dark': 'linear-gradient(310deg, var(--card), var(--background))',
  		},
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
