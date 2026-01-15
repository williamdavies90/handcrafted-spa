// Product configuration types and utilities for Ballerina towel rails

// Available sizes as HxW dimensions in filenames (height × width)
export const sizes = {
	'675x675': { label: '675 × 675', width: 675, height: 675 },
	'675x825': { label: '675 × 825', width: 825, height: 675 },
	'750x525': { label: '750 × 525', width: 525, height: 750 },
	'1275x525': { label: '1275 × 525', width: 525, height: 1275 },
	'1275x675': { label: '1275 × 675', width: 675, height: 1275 },
	'1575x525': { label: '1575 × 525', width: 525, height: 1575 },
	'1575x675': { label: '1575 × 675', width: 675, height: 1575 },
} as const;

// Joint types - og has depth 135, others have 125
export const joints = {
	lg: { label: 'LG Joint', depth: 125 },
	og: { label: 'OG Joint', depth: 135 },
	pj: { label: 'PJ Joint', depth: 125 },
} as const;

// Fuel/heat types
export const fuels = {
	dl: { label: 'Dual Fuel' },
	eo: { label: 'Electric Only' },
	he: { label: 'High Efficiency' },
	ho: { label: 'High Output' },
} as const;

// Finishes
export const finishes = {
	'chrome-plated': { label: 'Chrome Plated', folder: 'chrome-plated' },
	'polished-brass': { label: 'Polished Brass', folder: 'polished-brass' },
	'polished-nickel': { label: 'Polished Nickel', folder: 'polished-nickel' },
} as const;

export type SizeKey = keyof typeof sizes;
export type JointKey = keyof typeof joints;
export type FuelKey = keyof typeof fuels;
export type FinishKey = keyof typeof finishes;

export interface ProductConfig {
	size: SizeKey;
	joint: JointKey;
	fuel: FuelKey;
	finish: FinishKey;
}

/**
 * Get the product image path for a given configuration
 */
export function getProductImagePath(config: ProductConfig): string {
	const { size, joint, fuel, finish } = config;
	const depth = joints[joint].depth;
	const folder = finishes[finish].folder;
	
	// Build the filename: {width}x{height}x{depth}-{joint}-{fuel}-{finish}.webp
	const filename = `${size}x${depth}-${joint}-${fuel}-${finish}.webp`;
	
	return `/products/ballerina/${folder}/${filename}`;
}

/**
 * Get display labels for current configuration
 */
export function getConfigLabels(config: ProductConfig) {
	return {
		size: sizes[config.size].label,
		joint: joints[config.joint].label,
		fuel: fuels[config.fuel].label,
		finish: finishes[config.finish].label,
	};
}

// Default configuration
export const defaultConfig: ProductConfig = {
	size: '675x675',
	joint: 'og',
	fuel: 'eo',
	finish: 'chrome-plated',
};

// Legacy exports for backward compatibility
export const finishLabels: Record<string, string> = {
	'chrome-plated': 'Chrome Plated',
	'polished-brass': 'Polished Brass',
	'polished-nickel': 'Polished Nickel',
};

export const jointLabels: Record<string, string> = {
	lg: 'LG Joint',
	og: 'OG Joint',
	pj: 'PJ Joint',
};

export const fuelLabels: Record<string, string> = {
	dl: 'Dual Fuel',
	eo: 'Electric Only',
	he: 'High Efficiency',
	ho: 'High Output',
};

export const finishPalette: Record<string, string> = {
	'chrome-plated': '#c0c0c0',
	'polished-brass': '#b5a642',
	'polished-nickel': '#a8a8a8',
};

export const sizeScale: Record<string, number> = {
	small: 0.85,
	medium: 1,
	tall: 1.15,
};

// Legacy function for backward compatibility
export function getRenderSrc(opts: { finish: string; size: string; joint: string; fuel: string }): string {
	return getProductImagePath(defaultConfig);
}
