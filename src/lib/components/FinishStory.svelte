<script lang="ts">
	import { getRenderSrc, finishLabels } from '$lib/utils/render';

	export let sectionEl: HTMLElement | null = null;

	const finishes = ['chrome', 'black', 'brass'];
	const captions = [
		'Chrome captures the light with a quiet clarity.',
		'Obsidian black recedes, letting texture speak first.',
		'Soft brass warms over time, gently deepening.',
	];
	const size = 'medium';
	const joint = 'mitre';
	const fuel = 'electric';
</script>

<section class="section finish-story" bind:this={sectionEl}>
	<div class="section-inner">
		<div>
			<p class="eyebrow">Finish story</p>
			<h2>Surface tones shift with the light.</h2>
		</div>
		<div>
			{#each captions as caption, index}
				<p class="finish-caption {index === 0 ? 'active' : ''}" data-finish-caption>
					{caption}
				</p>
			{/each}
		</div>
	</div>
	<div class="finish-stack" data-finish-stack>
		<div class="wall-lines"></div>
		{#each finishes as finish, index}
			<div
				class="finish-layer {index === 0 ? 'active' : ''}"
				data-finish-layer
				data-finish={finish}
			>
				<img src={getRenderSrc({ finish, size, joint, fuel })} alt={finishLabels[finish]} />
			</div>
		{/each}
	</div>
</section>
