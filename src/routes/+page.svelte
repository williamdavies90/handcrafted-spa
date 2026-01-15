<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import ScrollTrigger from 'gsap/ScrollTrigger';
	import ScrollToPlugin from 'gsap/ScrollToPlugin';
	import Hero from '$lib/components/Hero.svelte';
	import CraftProcess from '$lib/components/CraftProcess.svelte';
	import FinishStory from '$lib/components/FinishStory.svelte';
	import SizeStory from '$lib/components/SizeStory.svelte';
	import TransitionMoment from '$lib/components/TransitionMoment.svelte';
	import Configurator from '$lib/components/Configurator.svelte';

	let scrollStageEl: HTMLDivElement | null = null;
	let heroPanel: HTMLDivElement | null = null;
	let craftPanel: HTMLDivElement | null = null;
	let finishPanel: HTMLDivElement | null = null;
	let sizePanel: HTMLDivElement | null = null;
	let transitionPanel: HTMLDivElement | null = null;
	let configWrapperEl: HTMLDivElement | null = null;
	let heroEl: HTMLElement | null = null;
	let heroRailEl: HTMLDivElement | null = null;
	let craftEl: HTMLElement | null = null;
	let finishEl: HTMLElement | null = null;
	let sizeEl: HTMLElement | null = null;
	let sizeRailEl: HTMLDivElement | null = null;
	let transitionEl: HTMLElement | null = null;
	let transitionUiEl: HTMLDivElement | null = null;
	let configEl: HTMLElement | null = null;

	function scrollToConfigurator() {
		configEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

		// Get viewport height for scroll calculations
		const vh = window.innerHeight;
		const SCROLL_DISTANCE = vh * 4.5; // Slightly shorter for tighter flow

		// Initialize panels - all hidden except hero
		const panels = [craftPanel, finishPanel, sizePanel, transitionPanel].filter(Boolean);
		gsap.set(panels, { opacity: 0, pointerEvents: 'none', scale: 0.98 });
		if (heroPanel) gsap.set(heroPanel, { opacity: 1, pointerEvents: 'auto' });

		// Initialize hero elements with elegant starting states
		const heroHeadline = heroEl?.querySelector('h1');
		const heroBody = heroEl?.querySelector('.hero-copy p:not(.eyebrow)');
		const heroCta = heroEl?.querySelector('.cta');
		const heroEyebrow = heroEl?.querySelector('.eyebrow');
		gsap.set([heroHeadline, heroBody], { opacity: 0, y: 20 });
		gsap.set(heroCta, { opacity: 0, y: 16 });
		gsap.set(heroEyebrow, { opacity: 0 });

		// Initialize finish layers
		const finishLayers = finishEl?.querySelectorAll('[data-finish-layer]') ?? [];
		const finishCaptions = finishEl?.querySelectorAll('[data-finish-caption]') ?? [];
		gsap.set(finishLayers, { opacity: 0, scale: 1.02 });
		gsap.set(finishCaptions, { opacity: 0, y: 8 });
		if (finishLayers[0]) gsap.set(finishLayers[0], { opacity: 1, scale: 1 });
		if (finishCaptions[0]) gsap.set(finishCaptions[0], { opacity: 1, y: 0 });

		// Initialize size lines
		const sizeLines = sizeEl?.querySelector('.wall-lines');
		gsap.set(sizeLines, { opacity: 0.15, scale: 0.98 });

		// Hide configurator initially
		if (configWrapperEl) {
			gsap.set(configWrapperEl, { opacity: 0, y: 40 });
		}

		// Create master timeline with smooth scrubbing
		const narrative = gsap.timeline({
			defaults: { ease: 'none' },
			scrollTrigger: {
				id: 'narrative-master',
				trigger: scrollStageEl,
				start: 'top top',
				end: `+=${SCROLL_DISTANCE}`,
				scrub: 0.8, // Smoother scrubbing
				pin: true,
				pinSpacing: true,
				onLeave: () => {
					// Elegantly reveal and snap to configurator
					if (configWrapperEl) {
						gsap.to(configWrapperEl, {
							opacity: 1,
							y: 0,
							duration: 0.6,
							ease: 'power2.out',
						});
						// Snap the viewport to the configurator
						gsap.to(window, {
							scrollTo: { y: configWrapperEl, autoKill: false },
							duration: 0.4,
							ease: 'power2.out',
							delay: 0.05,
						});
					}
				},
				onEnterBack: () => {
					// Hide configurator when scrolling back
					if (configWrapperEl) {
						gsap.to(configWrapperEl, {
							opacity: 0,
							y: 40,
							duration: 0.4,
							ease: 'power2.in',
						});
					}
				},
			},
		});

		// Phase 1: Hero entrance (0-0.8)
		narrative.to(heroEyebrow, { opacity: 1, duration: 0.15 }, 0.05);
		narrative.to(heroHeadline, { opacity: 1, y: 0, duration: 0.25 }, 0.1);
		narrative.to(heroBody, { opacity: 1, y: 0, duration: 0.25 }, 0.18);
		narrative.to(heroCta, { opacity: 1, y: 0, duration: 0.2 }, 0.25);
		if (heroRailEl) {
			narrative.to(heroRailEl, { rotateY: -3, scale: 1.04, duration: 0.6 }, 0);
		}

		// Phase 2: Hero to Craft (0.8-1.3)
		narrative.to(heroPanel, { opacity: 0, scale: 0.96, pointerEvents: 'none', duration: 0.2 }, 0.9);
		narrative.to(craftPanel, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.25 }, 1.0);

		// Phase 3: Craft to Finish (1.5-2.0)
		narrative.to(craftPanel, { opacity: 0, scale: 0.96, pointerEvents: 'none', duration: 0.2 }, 1.7);
		narrative.to(finishPanel, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.25 }, 1.8);
		
		// Finish layers crossfade
		if (finishLayers.length >= 3) {
			narrative.to(finishLayers[0], { opacity: 0, scale: 1.04, duration: 0.2 }, 2.0);
			narrative.to(finishLayers[1], { opacity: 1, scale: 1, duration: 0.2 }, 2.0);
			narrative.to(finishCaptions[0], { opacity: 0, y: -8, duration: 0.15 }, 2.0);
			narrative.to(finishCaptions[1], { opacity: 1, y: 0, duration: 0.15 }, 2.05);

			narrative.to(finishLayers[1], { opacity: 0, scale: 1.04, duration: 0.2 }, 2.35);
			narrative.to(finishLayers[2], { opacity: 1, scale: 1, duration: 0.2 }, 2.35);
			narrative.to(finishCaptions[1], { opacity: 0, y: -8, duration: 0.15 }, 2.35);
			narrative.to(finishCaptions[2], { opacity: 1, y: 0, duration: 0.15 }, 2.4);
		}

		// Phase 4: Finish to Size (2.6-3.1)
		narrative.to(finishPanel, { opacity: 0, scale: 0.96, pointerEvents: 'none', duration: 0.2 }, 2.8);
		narrative.to(sizePanel, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.25 }, 2.9);
		if (sizeRailEl) {
			narrative.to(sizeRailEl, { scale: 0.92, duration: 0.15 }, 3.0);
			narrative.to(sizeRailEl, { scale: 1.0, duration: 0.15 }, 3.2);
			narrative.to(sizeRailEl, { scale: 1.08, duration: 0.2 }, 3.4);
		}
		if (sizeLines) {
			narrative.to(sizeLines, { opacity: 0.4, scale: 1, duration: 0.2 }, 3.0);
			narrative.to(sizeLines, { opacity: 0.15, scale: 0.98, duration: 0.2 }, 3.5);
		}

		// Phase 5: Size to Transition (3.6-4.2)
		narrative.to(sizePanel, { opacity: 0, scale: 0.96, pointerEvents: 'none', duration: 0.2 }, 3.8);
		narrative.to(transitionPanel, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.25 }, 3.9);
		if (transitionEl) {
			const transitionCopy = transitionEl.querySelectorAll('h2, p');
			narrative.to(transitionCopy, { opacity: 0.25, duration: 0.3 }, 4.1);
		}
		if (transitionUiEl) {
			narrative.to(transitionUiEl, { opacity: 1, y: 0, duration: 0.3 }, 4.2);
		}

		return () => {
			ScrollTrigger.getAll().forEach((trigger) => {
				const id = String(trigger.vars.id || '');
				if (id.startsWith('narrative')) {
					trigger.kill(false);
				}
			});
		};
	});
</script>

<div class="page">
	<div class="grain"></div>
	<div class="scroll-stage" bind:this={scrollStageEl}>
		<div class="scroll-panel" bind:this={heroPanel}>
			<Hero bind:sectionEl={heroEl} bind:railEl={heroRailEl} on:cta={scrollToConfigurator} />
		</div>
		<div class="scroll-panel" bind:this={craftPanel}>
			<CraftProcess bind:sectionEl={craftEl} />
		</div>
		<div class="scroll-panel" bind:this={finishPanel}>
			<FinishStory bind:sectionEl={finishEl} />
		</div>
		<div class="scroll-panel" bind:this={sizePanel}>
			<SizeStory bind:sectionEl={sizeEl} bind:railEl={sizeRailEl} />
		</div>
		<div class="scroll-panel" bind:this={transitionPanel}>
			<TransitionMoment bind:sectionEl={transitionEl} bind:uiEl={transitionUiEl} />
		</div>
	</div>
	<div class="config-wrapper" bind:this={configWrapperEl}>
		<Configurator bind:sectionEl={configEl} />
	</div>
</div>
