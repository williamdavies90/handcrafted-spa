<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let sectionEl: HTMLElement | null = null;
	export let railEl: HTMLDivElement | null = null;

	const dispatch = createEventDispatcher();
</script>

<section class="section hero" bind:this={sectionEl}>
	<div class="hero-media">
		<div class="rail-visual" bind:this={railEl}>
			<div class="rail-glow"></div>
			<div class="rail-shadow"></div>
			<div class="rail-shape"></div>
		</div>
	</div>
	<div class="hero-copy">
		<p class="eyebrow">Hand-crafted towel rails</p>
		<h1>Architectural warmth for the quietest rooms.</h1>
		<p>Made to order, machined with patience, designed to remain.</p>
		<button class="cta hero-cta" on:click={() => dispatch('cta')}>
			<span class="cta-text">Configure yours</span>
			<span class="cta-arrow">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M5 12H19M19 12L13 6M19 12L13 18"/>
				</svg>
			</span>
		</button>
	</div>
</section>

<style>
	.hero-cta {
		display: inline-flex;
		align-items: center;
		gap: 12px;
	}

	.cta-text {
		position: relative;
		z-index: 1;
	}

	.cta-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(31, 29, 26, 0.06);
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.cta-arrow svg {
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hero-cta:hover .cta-arrow {
		background: var(--accent);
		color: white;
	}

	.hero-cta:hover .cta-arrow svg {
		transform: translateX(2px);
	}
</style>
