<script lang="ts">
	import { getRenderSrc } from '$lib/utils/render';

	export let sectionEl: HTMLElement | null = null;
	export let railEl: HTMLDivElement | null = null;

	const finish = 'chrome';
	const joint = 'mitre';
	const fuel = 'electric';
</script>

<section class="section size-story" bind:this={sectionEl}>
	<div class="section-inner">
		<div>
			<p class="eyebrow">Size &amp; proportion</p>
			<h2>Proportion leads. Measurements follow.</h2>
		</div>
	</div>
	<div class="size-stack" bind:this={railEl}>
		<div class="wall-lines"></div>
		<div class="size-layer active">
			<img src={getRenderSrc({ finish, size: 'medium', joint, fuel })} alt="Rail size study" />
		</div>
	</div>
</section>
