import { Document, NodeIO } from '@gltf-transform/core';
import { resolve } from 'node:path';

const document = new Document();
const buffer = document.createBuffer('rail-buffer');

const createBox = (width, height, depth) => {
	const w = width / 2;
	const h = height / 2;
	const d = depth / 2;
	const positions = [
		// +X
		w, -h, -d, w, h, -d, w, h, d, w, -h, d,
		// -X
		-w, -h, d, -w, h, d, -w, h, -d, -w, -h, -d,
		// +Y
		-w, h, d, w, h, d, w, h, -d, -w, h, -d,
		// -Y
		-w, -h, -d, w, -h, -d, w, -h, d, -w, -h, d,
		// +Z
		-w, -h, d, w, -h, d, w, h, d, -w, h, d,
		// -Z
		w, -h, -d, -w, -h, -d, -w, h, -d, w, h, -d,
	];
	const normals = [
		// +X
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		// -X
		-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
		// +Y
		0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
		// -Y
		0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
		// +Z
		0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
		// -Z
		0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
	];
	const indices = [];
	for (let face = 0; face < 6; face += 1) {
		const base = face * 4;
		indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
	}

	const positionAccessor = document
		.createAccessor()
		.setType('VEC3')
		.setArray(new Float32Array(positions))
		.setBuffer(buffer);
	const normalAccessor = document
		.createAccessor()
		.setType('VEC3')
		.setArray(new Float32Array(normals))
		.setBuffer(buffer);
	const indexAccessor = document
		.createAccessor()
		.setType('SCALAR')
		.setArray(new Uint16Array(indices))
		.setBuffer(buffer);

	return document
		.createPrimitive()
		.setAttribute('POSITION', positionAccessor)
		.setAttribute('NORMAL', normalAccessor)
		.setIndices(indexAccessor);
};

const finishMaterial = document
	.createMaterial('finish')
	.setMetallicFactor(0.7)
	.setRoughnessFactor(0.25)
	.setBaseColorFactor([1, 1, 1, 1]);

const sidePrimitive = createBox(0.06, 1.2, 0.06).setMaterial(finishMaterial);
const rungPrimitive = createBox(0.6, 0.05, 0.05).setMaterial(finishMaterial);

const sideMesh = document.createMesh('side').addPrimitive(sidePrimitive);
const rungMesh = document.createMesh('rung').addPrimitive(rungPrimitive);

const scene = document.createScene('Scene');
scene.addChild(document.createNode('left').setMesh(sideMesh).setTranslation([-0.28, 0, 0]));
scene.addChild(document.createNode('right').setMesh(sideMesh).setTranslation([0.28, 0, 0]));

for (let i = 0; i < 6; i += 1) {
	scene.addChild(
		document
			.createNode(`rung-${i}`)
			.setMesh(rungMesh)
			.setTranslation([0, -0.5 + i * 0.2, 0])
	);
}

const io = new NodeIO();
await io.write(resolve('static/models/rail.glb'), document);
console.log('GLB written to static/models/rail.glb');
