<script lang="ts">
	export let sectionEl: HTMLElement | null = null;
	export let uiEl: HTMLDivElement | null = null;
</script>

<section class="section transition" bind:this={sectionEl}>
	<div class="section-inner">
		<div>
			<p class="eyebrow">A quiet shift</p>
			<h2>From observation to intent.</h2>
			<p>Subtle interface cues arrive. The product is ready to respond.</p>
		</div>
		<div class="transition-ui" bind:this={uiEl}>
			<div class="transition-pill"></div>
			<div class="transition-pill"></div>
			<div class="transition-pill"></div>
		</div>
	</div>
</section>
