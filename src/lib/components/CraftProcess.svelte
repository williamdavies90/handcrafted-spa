<script lang="ts">
	export let sectionEl: HTMLElement | null = null;
</script>

<section class="section craft" bind:this={sectionEl}>
	<div class="section-inner">
		<div>
			<p class="eyebrow">Craft &amp; process</p>
			<h2>Built like furniture. Finished like jewellery.</h2>
		</div>
		<div class="craft-grid">
			<article class="craft-card" data-reveal>
				<div class="craft-image">
					<img src="/placeholders/craft-1.svg" alt="Macro texture of polished metal" />
				</div>
				<h3>Material honesty</h3>
				<p>Solid brass and stainless, hand-finished to reveal depth and warmth.</p>
			</article>
			<article class="craft-card" data-reveal>
				<div class="craft-image">
					<img src="/placeholders/craft-2.svg" alt="Close-up of assembled joinery" />
				</div>
				<h3>Measured patience</h3>
				<p>Each rail is machined, aligned, and assembled with quiet accuracy.</p>
			</article>
			<article class="craft-card" data-reveal>
				<div class="craft-image">
					<img src="/placeholders/craft-3.svg" alt="Softly lit hardware finish" />
				</div>
				<h3>Lasting performance</h3>
				<p>Built for daily use, sealed against moisture, softened with time.</p>
			</article>
		</div>
	</div>
</section>
