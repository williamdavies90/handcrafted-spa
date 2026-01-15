<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let active = false;

	let sectionEl: HTMLElement | null = null;
	let canvasEl: HTMLCanvasElement | null = null;
	let hasInitialized = false;
	let wants3d = false;

	let renderer: any;
	let scene: any;
	let camera: any;
	let model: any;
	let frameId = 0;
	let resizeObserver: ResizeObserver | null = null;

	async function init3d() {
		if (!browser || hasInitialized || !canvasEl) return;
		hasInitialized = true;

		const THREE = await import('three');
		const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

		scene = new THREE.Scene();
		scene.background = new THREE.Color('#fbf8f4');

		camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
		camera.position.set(0, 0.4, 2.3);

		const ambient = new THREE.AmbientLight(0xffffff, 0.8);
		const key = new THREE.DirectionalLight(0xffffff, 0.6);
		key.position.set(2, 3, 4);
		scene.add(ambient, key);

		renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

		const loader = new GLTFLoader();
		const gltf = await loader.loadAsync('/models/rail.glb');
		model = gltf.scene;
		model.rotation.y = Math.PI * 0.2;
		
		// Apply a nice metallic finish
		model.traverse((child: any) => {
			if (child.isMesh) {
				child.material.color.set('#c0c0c0');
				child.material.metalness = 0.7;
				child.material.roughness = 0.25;
				child.material.needsUpdate = true;
			}
		});
		
		scene.add(model);

		const resize = () => {
			if (!canvasEl) return;
			const { width, height } = canvasEl.getBoundingClientRect();
			renderer.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};

		resize();
		resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvasEl);

		const tick = () => {
			frameId = requestAnimationFrame(tick);
			if (model) model.rotation.y += 0.002;
			renderer.render(scene, camera);
		};

		tick();
	}

	onMount(() => {
		if (!browser || !sectionEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					wants3d = true;
					if (active) init3d();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});

	$: if (active && wants3d) {
		init3d();
	}

	onDestroy(() => {
		if (frameId) cancelAnimationFrame(frameId);
		resizeObserver?.disconnect();
		renderer?.dispose?.();
	});
</script>

{#if active}
	<section class="section review" bind:this={sectionEl}>
		<div class="section-inner">
			<div>
				<p class="eyebrow">Review</p>
				<h2>Confirm the proportion, finish, and presence.</h2>
				<p>Your configuration rendered in three dimensions.</p>
			</div>
			<div class="review-stage">
				<canvas class="review-canvas" bind:this={canvasEl}></canvas>
			</div>
			<div class="ar-row">
				<button class="ar-button" type="button">View in your space</button>
				<span class="helper">Visualise size and finish in your space.</span>
			</div>
		</div>
	</section>
{/if}
