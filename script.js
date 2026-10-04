import * as THREE from "three";

const canvas = document.querySelector(".scene");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
const sculpture = new THREE.Group();
const dinosaur = new THREE.Group();
const foliage = new THREE.Group();
const fireflies = [];
const targetRotation = new THREE.Vector2();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

camera.position.set(0, 0, 8.2);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
scene.add(sculpture);
sculpture.add(dinosaur, foliage);

scene.add(new THREE.HemisphereLight(0xffffff, 0x64736a, 2.1));

const keyLight = new THREE.DirectionalLight(0xfff1d5, 4);
keyLight.position.set(-3, 4, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x56a894, 28, 12);
rimLight.position.set(3, -2, -1);
scene.add(rimLight);

function createLeaf(color, x, y, rotation, scale) {
	const shape = new THREE.Shape();
	shape.moveTo(0, 0);
	shape.quadraticCurveTo(0.28, 0.38, 0, 0.82);
	shape.quadraticCurveTo(-0.28, 0.38, 0, 0);

	const leaf = new THREE.Mesh(
		new THREE.ShapeGeometry(shape, 12),
		new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
	);
	leaf.position.set(x, y, 0.55);
	leaf.rotation.z = rotation;
	leaf.scale.setScalar(scale);
	foliage.add(leaf);
}

[
	[0x147a52, 2.65, -1.55, -0.9, 1.1],
	[0x28a66a, 3.05, -1.45, 0.65, 0.9],
	[0x9fcf45, 2.88, -1.85, 1.2, 0.75],
	[0x147a52, -0.9, -1.7, -0.45, 0.75],
	[0x28a66a, -0.65, -1.85, 0.9, 0.65]
].forEach(([color, x, y, rotation, scale]) => {
	createLeaf(color, x, y, rotation, scale);
});

const fireflyMaterial = new THREE.MeshBasicMaterial({
	color: 0xffd879,
	toneMapped: false
});

for (let index = 0; index < 12; index += 1) {
	const firefly = new THREE.Mesh(
		new THREE.SphereGeometry(index % 3 === 0 ? 0.035 : 0.022, 8, 8),
		fireflyMaterial
	);
	firefly.position.set(
		(index % 4) * 0.85 - 1.2,
		Math.floor(index / 4) * 0.8 - 0.75,
		0.8 + (index % 2) * 0.25
	);
	firefly.userData.phase = index * 0.7;
	firefly.userData.baseY = firefly.position.y;
	fireflies.push(firefly);
	sculpture.add(firefly);
}

const dinosaurTexture = new THREE.TextureLoader().load("./assets/dino.jpeg");
dinosaurTexture.colorSpace = THREE.SRGBColorSpace;

const dinosaurMaterial = new THREE.MeshBasicMaterial({
	map: dinosaurTexture,
	toneMapped: false
});

const dinosaurImage = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1),
	dinosaurMaterial
);
dinosaurImage.position.z = 0.15;
dinosaur.add(dinosaurImage);

function resizeScene() {
	const { clientWidth, clientHeight } = canvas;
	renderer.setSize(clientWidth, clientHeight, false);
	camera.aspect = clientWidth / clientHeight;
	const isMobile = clientWidth < 700;
	camera.position.z = isMobile ? 9 : 8.2;
	camera.updateProjectionMatrix();
	sculpture.position.x = isMobile ? 0 : 1.55;
	sculpture.scale.setScalar(isMobile ? 0.55 : 1);
	dinosaur.position.y = isMobile ? 1.78 : -0.05;

	if (dinosaurTexture.image) {
		const imageAspect = dinosaurTexture.image.width / dinosaurTexture.image.height;
		const imageWidth = isMobile ? 4 : 3.35;
		dinosaurImage.scale.set(imageWidth, imageWidth / imageAspect, 1);
	}
}

dinosaurTexture.onUpdate = resizeScene;

const resizeObserver = new ResizeObserver(resizeScene);
resizeObserver.observe(canvas);
resizeScene();

window.addEventListener("pointermove", (event) => {
	targetRotation.x = ((event.clientY / window.innerHeight) * 2 - 1) * 0.2;
	targetRotation.y = ((event.clientX / window.innerWidth) * 2 - 1) * 0.28;
}, { passive: true });

const clock = new THREE.Clock();

function animate() {
	const elapsed = clock.getElapsedTime();

	if (!reducedMotion.matches) {
		sculpture.rotation.x += (targetRotation.x - sculpture.rotation.x) * 0.035;
		sculpture.rotation.y += (targetRotation.y - sculpture.rotation.y) * 0.035;
		sculpture.rotation.y += 0.002;
		sculpture.position.y = Math.sin(elapsed * 0.8) * 0.08;
		dinosaur.rotation.z = Math.sin(elapsed * 0.7) * 0.018;
		foliage.rotation.z = Math.sin(elapsed * 0.55) * 0.025;
		fireflies.forEach((firefly) => {
			firefly.position.y = firefly.userData.baseY
				+ Math.sin(elapsed * 1.5 + firefly.userData.phase) * 0.08;
		});
	}

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

animate();
