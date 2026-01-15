<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import {
		sizes,
		joints,
		fuels,
		finishes,
		getProductImagePath,
		defaultConfig,
		type SizeKey,
		type JointKey,
		type FuelKey,
		type FinishKey,
	} from '$lib/utils/render';

	export let sectionEl: HTMLElement | null = null;

	// Configuration state
	let size: SizeKey = defaultConfig.size;
	let joint: JointKey = defaultConfig.joint;
	let fuel: FuelKey = defaultConfig.fuel;
	let finish: FinishKey = defaultConfig.finish;

	// UI state
	let step = 0;
	let layerA: HTMLImageElement | null = null;
	let layerB: HTMLImageElement | null = null;
	let activeLayer = 0;
	let hasMounted = false;

	const sizeKeys = Object.keys(sizes) as SizeKey[];
	const jointKeys = Object.keys(joints) as JointKey[];
	const fuelKeys = Object.keys(fuels) as FuelKey[];
	const finishKeys = Object.keys(finishes) as FinishKey[];

	const stepMeta = [
		{ num: 1, label: 'Dimensions', sublabel: 'Width × Height in mm' },
		{ num: 2, label: 'Corner Detail', sublabel: 'Joint construction' },
		{ num: 3, label: 'Heat Source', sublabel: 'Power configuration' },
		{ num: 4, label: 'Surface Finish', sublabel: 'Metal treatment' },
	];

	// Calculate proportional scale for size visualization
	// Use height as the primary dimension since rails are wall-mounted vertically
	const maxHeight = Math.max(...sizeKeys.map(k => sizes[k].height));
	const minHeight = Math.min(...sizeKeys.map(k => sizes[k].height));

	function getSizeScale(sizeKey: SizeKey): number {
		const { height } = sizes[sizeKey];
		// Scale based on height: tallest = 1.0, shortest = 0.5
		const ratio = (height - minHeight) / (maxHeight - minHeight);
		return 0.5 + ratio * 0.5;
	}

	// Get aspect ratio style for the frame (width / height)
	function getAspectRatio(sizeKey: SizeKey): string {
		const { width, height } = sizes[sizeKey];
		return `${width} / ${height}`;
	}

	// Reactive scale based on current size
	$: imageScale = getSizeScale(size);
	$: aspectRatio = getAspectRatio(size);

	// Step-based zoom for contextual focus
	// Step 0: Size - full view
	// Step 1: Joint - zoom to top-left corner (where joint detail is visible)
	// Step 2: Fuel - zoom to bottom-right corner (where fuel element is visible)
	// Step 3: Finish - full view to see full surface
	// Step 4: Complete - full view
	$: stepZoom = step === 1 ? 4.5 : step === 2 ? 4.5 : 1;
	$: stepOrigin = step === 1 ? '8% 8%' : step === 2 ? '92% 92%' : 'center';
	$: combinedScale = imageScale * stepZoom;

	function currentSrc() {
		return getProductImagePath({ size, joint, fuel, finish });
	}

	let productFrame: HTMLDivElement | null = null;

	function swapRender() {
		if (!layerA || !layerB) return;
		const nextSrc = currentSrc();
		const nextLayer = activeLayer === 0 ? layerB : layerA;
		const prevLayer = activeLayer === 0 ? layerA : layerB;

		if (nextLayer.src === nextSrc) return;
		nextLayer.src = nextSrc;

		gsap.to(prevLayer, { opacity: 0, duration: 0.6, ease: 'power2.out' });
		gsap.to(nextLayer, { opacity: 1, duration: 0.6, ease: 'power2.out' });
		activeLayer = activeLayer === 0 ? 1 : 0;
		// Scale is handled via CSS transition on the inline style
	}

	function selectSize(value: SizeKey) {
		size = value;
	}

	function selectJoint(value: JointKey) {
		joint = value;
	}

	function selectFuel(value: FuelKey) {
		fuel = value;
	}

	function selectFinish(value: FinishKey) {
		finish = value;
	}

	function goToStep(index: number) {
		step = index;
	}

	function nextStep() {
		if (step < 4) {
			step += 1;
		}
	}

	function prevStep() {
		if (step > 0) {
			step -= 1;
		}
	}

	// Check if current step has a valid selection
	$: canProceed = step === 0 ? !!size 
		: step === 1 ? !!joint 
		: step === 2 ? !!fuel 
		: step === 3 ? !!finish 
		: false;

	onMount(() => {
		const src = currentSrc();
		if (layerA) {
			layerA.src = src;
			layerA.style.opacity = '1';
		}
		if (layerB) {
			layerB.src = src;
			layerB.style.opacity = '0';
		}
		hasMounted = true;
	});

	// Explicitly depend on config values to trigger reactivity
	$: if (hasMounted && (size || joint || fuel || finish)) {
		swapRender();
	}

	$: isComplete = step >= 4;
	$: currentValue = step === 0 ? sizes[size].label 
		: step === 1 ? joints[joint].label 
		: step === 2 ? fuels[fuel].label 
		: step === 3 ? finishes[finish].label 
		: '';
</script>

<section class="configurator-section" bind:this={sectionEl}>
	<!-- Full-bleed product stage -->
	<div class="product-stage">
		<!-- Fixed canvas representing wall space -->
		<div class="product-canvas">
			<div 
				class="product-frame" 
				bind:this={productFrame} 
				style="transform: scale({combinedScale}); transform-origin: {stepOrigin}; aspect-ratio: {aspectRatio};"
			>
				<img class="product-img layer-a" bind:this={layerA} alt="Configured towel rail" />
				<img class="product-img layer-b" bind:this={layerB} alt="Configured towel rail" />
			</div>
		</div>
		
		<!-- Subtle shadow/reflection (hide when zoomed) -->
		<div class="product-shadow" style="transform: translateX(-50%) scale({imageScale * 0.8}); opacity: {stepZoom > 1 ? 0 : 1};"></div>
	</div>

	<!-- Configuration summary bar (shows settled choices) -->
	<div class="summary-bar" class:has-selections={step > 0}>
		{#if step > 0}
			<button class="summary-chip" on:click={() => goToStep(0)}>
				<span class="chip-label">Size</span>
				<span class="chip-value">{sizes[size].label}</span>
			</button>
		{/if}
		{#if step > 1}
			<button class="summary-chip" on:click={() => goToStep(1)}>
				<span class="chip-label">Joint</span>
				<span class="chip-value">{joints[joint].label}</span>
			</button>
		{/if}
		{#if step > 2}
			<button class="summary-chip" on:click={() => goToStep(2)}>
				<span class="chip-label">Heat</span>
				<span class="chip-value">{fuels[fuel].label}</span>
			</button>
		{/if}
		{#if step > 3}
			<button class="summary-chip" on:click={() => goToStep(3)}>
				<span class="chip-label">Finish</span>
				<span class="chip-value">{finishes[finish].label}</span>
			</button>
		{/if}
	</div>

	<!-- Floating control panel -->
	<div class="control-panel" class:complete={isComplete}>
		<div class="panel-inner">
			{#if !isComplete}
				<header class="panel-header">
					<span class="step-indicator">Step {stepMeta[step].num} of 4</span>
					<h2 class="panel-title">{stepMeta[step].label}</h2>
					<p class="panel-sublabel">{stepMeta[step].sublabel}</p>
				</header>

				<div class="options-grid" class:size-grid={step === 0}>
					{#if step === 0}
						{#each sizeKeys as opt}
							<button
								class="option-card"
								class:selected={size === opt}
								on:click={() => selectSize(opt)}
							>
								<span class="option-main">{sizes[opt].label}</span>
							</button>
						{/each}
					{:else if step === 1}
						{#each jointKeys as opt}
							<button
								class="option-card"
								class:selected={joint === opt}
								on:click={() => selectJoint(opt)}
							>
								<span class="option-main">{joints[opt].label}</span>
							</button>
						{/each}
					{:else if step === 2}
						{#each fuelKeys as opt}
							<button
								class="option-card"
								class:selected={fuel === opt}
								on:click={() => selectFuel(opt)}
							>
								<span class="option-main">{fuels[opt].label}</span>
							</button>
						{/each}
					{:else if step === 3}
						{#each finishKeys as opt}
							<button
								class="option-card finish-card"
								class:selected={finish === opt}
								on:click={() => selectFinish(opt)}
							>
								<span class="finish-swatch" data-finish={opt}></span>
								<span class="option-main">{finishes[opt].label}</span>
							</button>
						{/each}
					{/if}
				</div>

				<!-- Navigation buttons -->
				<div class="nav-buttons">
					{#if step > 0}
						<button class="nav-btn nav-prev" on:click={prevStep}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M19 12H5M5 12L12 19M5 12L12 5"/>
							</svg>
							<span>Back</span>
						</button>
					{:else}
						<div class="nav-spacer"></div>
					{/if}
					
					<button 
						class="nav-btn nav-next" 
						class:primary={canProceed}
						on:click={nextStep}
						disabled={!canProceed}
					>
						<span>{step === 3 ? 'Complete' : 'Continue'}</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M5 12H19M19 12L12 5M19 12L12 19"/>
						</svg>
					</button>
				</div>
			{:else}
				<!-- Completion state -->
				<header class="panel-header complete-header">
					<span class="step-indicator complete-indicator">Configuration Complete</span>
					<h2 class="panel-title">Your specification</h2>
				</header>

				<div class="complete-summary">
					<div class="spec-row">
						<span class="spec-label">Dimensions</span>
						<span class="spec-value">{sizes[size].label}</span>
					</div>
					<div class="spec-row">
						<span class="spec-label">Joint</span>
						<span class="spec-value">{joints[joint].label}</span>
					</div>
					<div class="spec-row">
						<span class="spec-label">Heat</span>
						<span class="spec-value">{fuels[fuel].label}</span>
					</div>
					<div class="spec-row">
						<span class="spec-label">Finish</span>
						<span class="spec-value">{finishes[finish].label}</span>
					</div>
				</div>

				<div class="complete-actions">
					<button class="enquire-btn">
						<span>Request a quote</span>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M7 17L17 7M17 7H7M17 7V17"/>
						</svg>
					</button>
					<button class="reset-btn" on:click={() => step = 0}>
						<span>Start again</span>
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Progress indicator -->
	<div class="progress-track">
		{#each [0, 1, 2, 3] as i}
			<div class="progress-segment" class:active={step >= i} class:current={step === i}></div>
		{/each}
	</div>
</section>

<style>
	.configurator-section {
		position: relative;
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr;
		background: 
			radial-gradient(ellipse 80% 50% at 30% 20%, rgba(253, 251, 248, 0.9) 0%, transparent 45%),
			radial-gradient(ellipse 60% 40% at 75% 75%, rgba(232, 220, 200, 0.08) 0%, transparent 50%),
			linear-gradient(172deg, #fdfbf8 0%, #f8f4ef 40%, #f3ede5 100%);
		overflow: hidden;
	}

	/* Product Stage - Full viewport presence */
	.product-stage {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-right: 420px; /* Make room for panel */
	}

	/* Fixed canvas representing wall space - all products scale within this */
	.product-canvas {
		position: relative;
		width: min(55vw, 600px);
		height: min(70vh, 580px);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-frame {
		position: relative;
		/* Base size - will be scaled proportionally via transform */
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		/* transform-origin set via inline style for step-based zoom */
		transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
					transform-origin 0.8s cubic-bezier(0.16, 1, 0.3, 1),
					aspect-ratio 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.product-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: 
			drop-shadow(0 20px 40px rgba(0, 0, 0, 0.06))
			drop-shadow(0 40px 80px rgba(0, 0, 0, 0.04));
	}

	.layer-a { opacity: 1; }
	.layer-b { opacity: 0; }

	.product-shadow {
		position: absolute;
		bottom: 8%;
		left: 50%;
		width: 50%;
		height: 50px;
		background: 
			radial-gradient(ellipse 100% 60% at center, rgba(139, 111, 71, 0.05) 0%, transparent 55%),
			radial-gradient(ellipse 80% 45% at center, rgba(26, 24, 22, 0.03) 0%, transparent 50%);
		filter: blur(20px);
		transform-origin: center center;
		transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Summary Bar - Top left settled choices */
	.summary-bar {
		position: absolute;
		top: 40px;
		left: 48px;
		display: flex;
		gap: 12px;
		z-index: 10;
		opacity: 0;
		transform: translateY(-8px);
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.summary-bar.has-selections {
		opacity: 1;
		transform: translateY(0);
	}

	.summary-chip {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 18px;
		border: none;
		border-radius: 100px;
		background: 
			linear-gradient(
				145deg,
				rgba(255, 255, 255, 0.92) 0%,
				rgba(253, 251, 248, 0.88) 100%
			);
		backdrop-filter: blur(16px);
		box-shadow: 
			0 1px 3px rgba(139, 111, 71, 0.04),
			0 4px 16px rgba(0, 0, 0, 0.03),
			0 0 0 1px rgba(212, 196, 168, 0.12);
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.summary-chip:hover {
		background: rgba(255, 255, 255, 1);
		box-shadow: 
			0 2px 6px rgba(139, 111, 71, 0.08),
			0 8px 24px rgba(0, 0, 0, 0.06),
			0 0 0 1px rgba(212, 196, 168, 0.2);
	}

	.chip-label {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--bronze, #8b6f47);
	}

	.chip-value {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--ink, #1a1816);
	}

	/* Control Panel - Right side floating */
	.control-panel {
		position: absolute;
		top: 50%;
		right: 48px;
		transform: translateY(-50%);
		width: 370px;
		z-index: 20;
	}

	.panel-inner {
		background: 
			linear-gradient(
				168deg,
				rgba(255, 255, 255, 0.96) 0%,
				rgba(253, 251, 248, 0.94) 50%,
				rgba(248, 244, 239, 0.92) 100%
			);
		backdrop-filter: blur(28px);
		border-radius: 28px;
		padding: 40px;
		border: 1px solid rgba(212, 196, 168, 0.12);
		box-shadow: 
			0 0 0 1px rgba(255, 255, 255, 0.5) inset,
			0 2px 4px rgba(139, 111, 71, 0.03),
			0 12px 48px rgba(0, 0, 0, 0.06),
			0 32px 96px rgba(0, 0, 0, 0.04);
	}

	.panel-header {
		margin-bottom: 30px;
	}

	.step-indicator {
		display: inline-block;
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: var(--bronze, #8b6f47);
		font-weight: 600;
		margin-bottom: 14px;
	}

	.panel-title {
		font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
		font-size: 1.7rem;
		font-weight: 400;
		letter-spacing: -0.02em;
		color: var(--ink, #1a1816);
		margin: 0 0 8px 0;
	}

	.panel-sublabel {
		font-size: 0.85rem;
		color: var(--muted, #857d75);
		margin: 0;
	}

	/* Options Grid */
	.options-grid {
		display: grid;
		gap: 12px;
	}

	.options-grid.size-grid {
		grid-template-columns: repeat(2, 1fr);
	}

	.option-card {
		position: relative;
		padding: 20px 22px;
		border: 1px solid rgba(212, 196, 168, 0.15);
		border-radius: 16px;
		background: 
			linear-gradient(
				155deg,
				rgba(255, 255, 255, 0.8) 0%,
				rgba(253, 251, 248, 0.7) 100%
			);
		cursor: pointer;
		transition: all 0.25s ease;
		text-align: left;
		box-shadow: 
			0 1px 2px rgba(0, 0, 0, 0.02),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	.option-card:hover {
		border-color: rgba(157, 123, 77, 0.25);
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 
			0 2px 8px rgba(139, 111, 71, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.option-card.selected {
		border-color: var(--bronze, #8b6f47);
		background: 
			linear-gradient(
				155deg,
				rgba(232, 220, 200, 0.15) 0%,
				rgba(253, 251, 248, 0.9) 100%
			);
		box-shadow: 
			0 2px 8px rgba(139, 111, 71, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.option-card.selected::after {
		content: '';
		position: absolute;
		top: 14px;
		right: 14px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--bronze, #8b6f47);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
		background-size: 11px;
	}

	.option-main {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--ink, #1a1816);
	}

	/* Finish swatches - realistic metallic */
	.finish-card {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.finish-swatch {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.08);
		flex-shrink: 0;
		box-shadow: 
			inset 0 2px 4px rgba(255, 255, 255, 0.6),
			inset 0 -2px 4px rgba(0, 0, 0, 0.1),
			0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.finish-swatch[data-finish="chrome-plated"] {
		background: 
			linear-gradient(155deg, 
				#f0f0f0 0%, 
				#d8d8d8 25%,
				#b8b8b8 50%,
				#d0d0d0 75%,
				#e8e8e8 100%
			);
		border-color: rgba(180, 180, 180, 0.3);
	}

	.finish-swatch[data-finish="polished-brass"] {
		background: 
			linear-gradient(155deg, 
				#e8d4b8 0%, 
				#d4b896 25%,
				#b89a6a 50%,
				#c9a87a 75%,
				#dcc4a8 100%
			);
		border-color: rgba(184, 154, 106, 0.3);
	}

	.finish-swatch[data-finish="polished-nickel"] {
		background: 
			linear-gradient(155deg, 
				#e0e0e0 0%, 
				#c8c8c8 25%,
				#a8a8a8 50%,
				#b8b8b8 75%,
				#d0d0d0 100%
			);
		border-color: rgba(168, 168, 168, 0.3);
	}

	/* Navigation buttons */
	.nav-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 32px;
		padding-top: 28px;
		border-top: 1px solid rgba(212, 196, 168, 0.15);
	}

	.nav-spacer {
		flex: 1;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 24px;
		border: 1px solid rgba(212, 196, 168, 0.2);
		border-radius: 100px;
		background: transparent;
		color: var(--muted, #857d75);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.nav-btn:hover:not(:disabled) {
		border-color: rgba(157, 123, 77, 0.35);
		color: var(--ink, #1a1816);
		background: rgba(255, 255, 255, 0.5);
	}

	.nav-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.nav-btn svg {
		opacity: 0.7;
		transition: opacity 0.2s, transform 0.2s;
	}

	.nav-prev:hover svg {
		transform: translateX(-2px);
	}

	.nav-next {
		margin-left: auto;
	}

	.nav-next.primary {
		background: 
			linear-gradient(
				165deg,
				#3d3936 0%,
				#1a1816 50%,
				#0f0e0d 100%
			);
		border-color: transparent;
		color: rgba(255, 255, 255, 0.95);
		box-shadow: 
			0 2px 8px rgba(26, 24, 22, 0.2),
			0 8px 24px rgba(26, 24, 22, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.nav-next.primary:hover:not(:disabled) {
		background: 
			linear-gradient(
				165deg,
				#4a4744 0%,
				#2d2a27 50%,
				#1a1816 100%
			);
		box-shadow: 
			0 4px 12px rgba(26, 24, 22, 0.25),
			0 12px 32px rgba(26, 24, 22, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.nav-next.primary svg {
		opacity: 0.9;
	}

	.nav-next:hover:not(:disabled) svg {
		transform: translateX(3px);
	}

	/* Complete State */
	.complete-header {
		margin-bottom: 28px;
	}

	.complete-summary {
		display: grid;
		gap: 0;
		margin-bottom: 32px;
		background: rgba(248, 244, 239, 0.5);
		border-radius: 16px;
		padding: 4px 0;
	}

	.spec-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid rgba(212, 196, 168, 0.1);
	}

	.spec-row:last-child {
		border-bottom: none;
	}

	.spec-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bronze, #8b6f47);
	}

	.spec-value {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--ink, #1a1816);
	}

	.complete-indicator {
		color: var(--bronze, #8b6f47);
	}

	.complete-actions {
		display: grid;
		gap: 14px;
	}

	.enquire-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		width: 100%;
		padding: 18px 28px;
		border: none;
		border-radius: 16px;
		background: 
			linear-gradient(
				165deg,
				#3d3936 0%,
				#1a1816 50%,
				#0f0e0d 100%
			);
		color: rgba(255, 255, 255, 0.95);
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 
			0 2px 8px rgba(26, 24, 22, 0.15),
			0 8px 24px rgba(26, 24, 22, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}

	.enquire-btn:hover {
		background: 
			linear-gradient(
				165deg,
				#4a4744 0%,
				#2d2a27 50%,
				#1a1816 100%
			);
		transform: translateY(-3px);
		box-shadow: 
			0 4px 12px rgba(26, 24, 22, 0.2),
			0 16px 40px rgba(26, 24, 22, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.enquire-btn svg {
		opacity: 0.85;
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.enquire-btn:hover svg {
		transform: translate(3px, -3px);
	}

	.reset-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 14px 22px;
		border: 1px solid rgba(212, 196, 168, 0.2);
		border-radius: 12px;
		background: transparent;
		color: var(--muted, #857d75);
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.reset-btn:hover {
		border-color: rgba(157, 123, 77, 0.35);
		color: var(--ink, #1a1816);
		background: rgba(255, 255, 255, 0.5);
	}

	/* Progress Track - Bottom */
	.progress-track {
		position: absolute;
		bottom: 44px;
		left: 48px;
		display: flex;
		gap: 10px;
		z-index: 10;
	}

	.progress-segment {
		width: 52px;
		height: 3px;
		border-radius: 2px;
		background: rgba(212, 196, 168, 0.25);
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.progress-segment.active {
		background: 
			linear-gradient(
				90deg,
				var(--bronze, #8b6f47) 0%,
				var(--accent, #9d7b4d) 100%
			);
	}

	.progress-segment.current {
		width: 76px;
		background: 
			linear-gradient(
				90deg,
				var(--bronze, #8b6f47) 0%,
				var(--copper, #a67c52) 100%
			);
	}

	/* Responsive */
	@media (max-width: 1100px) {
		.product-stage {
			padding-right: 380px;
		}

		.control-panel {
			width: 320px;
			right: 32px;
		}

		.panel-inner {
			padding: 28px;
		}
	}

	@media (max-width: 900px) {
		.configurator-section {
			min-height: auto;
		}

		.product-stage {
			position: relative;
			padding: 80px 24px 40px;
		}

		.product-frame {
			max-width: 400px;
		}

		.summary-bar {
			position: relative;
			top: auto;
			left: auto;
			padding: 0 24px;
			margin-bottom: 20px;
			flex-wrap: wrap;
			opacity: 1;
			transform: none;
		}

		.control-panel {
			position: relative;
			top: auto;
			right: auto;
			transform: none;
			width: 100%;
			padding: 0 24px 60px;
		}

		.panel-inner {
			border-radius: 20px;
		}

		.progress-track {
			position: relative;
			bottom: auto;
			left: auto;
			padding: 24px;
			justify-content: center;
		}

		.product-shadow {
			display: none;
		}
	}
</style>
